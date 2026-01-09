import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { generateStoragePath } from './validations/pdf'

// Storage configuration
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'pdf',
  MAX_UPLOAD_SIZE: 50 * 1024 * 1024, // 50MB
} as const

// Storage error types
export class StorageError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code: string, statusCode = 500) {
    super(message)
    this.name = 'StorageError'
    this.code = code
    this.statusCode = statusCode
  }
}

// Initialize Supabase client for storage operations
function getStorageClient(): SupabaseClient | null {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase credentials not found, using mock storage')
      return null
    }

    return createClient(supabaseUrl, supabaseServiceKey)
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error)
    return null
  }
}

// Mock storage for development when Supabase is not configured
class MockStorage {
  private files = new Map<string, { data: Buffer; contentType: string }>()

  async upload(path: string, file: File | Buffer | Uint8Array): Promise<{ path: string; fullPath: string }> {
    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : Buffer.from(file)
    this.files.set(path, { data: buffer, contentType: 'application/pdf' })
    
    return {
      path,
      fullPath: `mock-storage://${path}`
    }
  }

  async delete(path: string): Promise<void> {
    this.files.delete(path)
  }

  async getPublicUrl(path: string): Promise<string> {
    return `https://mock-storage.example.com/${path}`
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const expires = Date.now() + expiresIn * 1000
    return `https://mock-storage.example.com/${path}?expires=${expires}`
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path)
  }
}

// Global mock storage instance
const mockStorage = new MockStorage()

// Upload file to storage
export async function uploadFile(
  file: File | Buffer | Uint8Array,
  options: {
    path?: string
    userId?: string
    originalFilename?: string
  } = {}
): Promise<{ path: string; publicUrl: string }> {
  const supabase = getStorageClient()
  
  // Generate storage path
  const storagePath = options.path || generateStoragePath(options.userId, options.originalFilename)

  if (!supabase) {
    // Use mock storage
    const result = await mockStorage.upload(storagePath, file)
    const publicUrl = await mockStorage.getPublicUrl(storagePath)
    
    return {
      path: storagePath,
      publicUrl
    }
  }

  try {
    // Convert File to ArrayBuffer if needed
    const fileData = file instanceof File ? await file.arrayBuffer() : file

    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(storagePath, fileData, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new StorageError(
        `Failed to upload file: ${error.message}`,
        'UPLOAD_FAILED'
      )
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error
    }
    throw new StorageError(
      `Storage operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STORAGE_ERROR'
    )
  }
}

// Delete file from storage
export async function deleteFile(path: string): Promise<void> {
  const supabase = getStorageClient()

  if (!supabase) {
    // Use mock storage
    await mockStorage.delete(path)
    return
  }

  try {
    const { error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .remove([path])

    if (error) {
      throw new StorageError(
        `Failed to delete file: ${error.message}`,
        'DELETE_FAILED'
      )
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error
    }
    throw new StorageError(
      `Storage deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STORAGE_ERROR'
    )
  }
}

// Get public URL for file
export async function getPublicUrl(path: string): Promise<string> {
  const supabase = getStorageClient()

  if (!supabase) {
    // Use mock storage
    return mockStorage.getPublicUrl(path)
  }

  try {
    const { data } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(path)

    return data.publicUrl
  } catch (error) {
    throw new StorageError(
      `Failed to get public URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'URL_GENERATION_FAILED'
    )
  }
}

// Get signed URL for protected access
export async function getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
  const supabase = getStorageClient()

  if (!supabase) {
    // Use mock storage
    return mockStorage.getSignedUrl(path, expiresIn)
  }

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .createSignedUrl(path, expiresIn)

    if (error) {
      throw new StorageError(
        `Failed to create signed URL: ${error.message}`,
        'SIGNED_URL_FAILED'
      )
    }

    return data.signedUrl
  } catch (error) {
    if (error instanceof StorageError) {
      throw error
    }
    throw new StorageError(
      `Signed URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STORAGE_ERROR'
    )
  }
}

// Check if file exists in storage
export async function fileExists(path: string): Promise<boolean> {
  const supabase = getStorageClient()

  if (!supabase) {
    // Use mock storage
    return mockStorage.exists(path)
  }

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .list(path.substring(0, path.lastIndexOf('/')), {
        search: path.substring(path.lastIndexOf('/') + 1)
      })

    if (error) {
      return false
    }

    return data.length > 0
  } catch (error) {
    return false
  }
}

// Generate upload token for secure uploads
export async function generateUploadToken(
  userId?: string,
  originalFilename?: string
): Promise<{
  token: string
  uploadPath: string
  expiresAt: number
}> {
  const uploadPath = generateStoragePath(userId, originalFilename)
  const expiresAt = Date.now() + (15 * 60 * 1000) // 15 minutes
  
  // In a real application, you might store this token in Redis or a database
  // For now, we'll create a simple JWT-like token
  const tokenData = {
    path: uploadPath,
    userId,
    expiresAt
  }
  
  const token = Buffer.from(JSON.stringify(tokenData)).toString('base64')
  
  return {
    token,
    uploadPath,
    expiresAt
  }
}

// Validate upload token
export function validateUploadToken(token: string): {
  path: string
  userId?: string
  expiresAt: number
} | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    
    if (!decoded.path || !decoded.expiresAt) {
      return null
    }
    
    if (Date.now() > decoded.expiresAt) {
      return null
    }
    
    return decoded
  } catch (error) {
    return null
  }
}

// Move file within storage (useful for organizing uploads)
export async function moveFile(fromPath: string, toPath: string): Promise<void> {
  const supabase = getStorageClient()

  if (!supabase) {
    // For mock storage, simulate move by copying data
    const files = (mockStorage as any).files
    const fileData = files.get(fromPath)
    if (fileData) {
      files.set(toPath, fileData)
      files.delete(fromPath)
    }
    return
  }

  try {
    const { error: moveError } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .move(fromPath, toPath)

    if (moveError) {
      throw new StorageError(
        `Failed to move file: ${moveError.message}`,
        'MOVE_FAILED'
      )
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error
    }
    throw new StorageError(
      `File move failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STORAGE_ERROR'
    )
  }
}

// Get storage info and bucket configuration
export async function getStorageInfo(): Promise<{
  configured: boolean
  bucketName: string
  maxUploadSize: number
  supportedTypes: string[]
}> {
  const supabase = getStorageClient()
  
  return {
    configured: !!supabase,
    bucketName: STORAGE_CONFIG.BUCKET_NAME,
    maxUploadSize: STORAGE_CONFIG.MAX_UPLOAD_SIZE,
    supportedTypes: ['application/pdf']
  }
}