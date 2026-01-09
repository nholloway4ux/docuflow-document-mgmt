import { PDFFileInfo } from '@/types'

// Configuration for PDF validation
export const PDF_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB in bytes
  ALLOWED_MIME_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf'],
  MIN_FILE_SIZE: 1024, // 1KB minimum
} as const

// Validation error types
export class PDFValidationError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code: string, statusCode = 400) {
    super(message)
    this.name = 'PDFValidationError'
    this.code = code
    this.statusCode = statusCode
  }
}

// Validate file type based on MIME type
export function validateMimeType(file: File): void {
  if (!PDF_CONFIG.ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new PDFValidationError(
      `Invalid file type. Only PDF files are allowed. Received: ${file.type}`,
      'INVALID_FILE_TYPE'
    )
  }
}

// Validate file extension
export function validateFileExtension(filename: string): void {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  if (!PDF_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
    throw new PDFValidationError(
      `Invalid file extension. Only .pdf files are allowed. Received: ${extension}`,
      'INVALID_FILE_EXTENSION'
    )
  }
}

// Validate file size
export function validateFileSize(size: number): void {
  if (size < PDF_CONFIG.MIN_FILE_SIZE) {
    throw new PDFValidationError(
      `File too small. Minimum size is ${PDF_CONFIG.MIN_FILE_SIZE} bytes`,
      'FILE_TOO_SMALL'
    )
  }
  
  if (size > PDF_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = PDF_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
    throw new PDFValidationError(
      `File too large. Maximum size is ${maxSizeMB}MB`,
      'FILE_TOO_LARGE'
    )
  }
}

// Sanitize filename for safe storage
export function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  let sanitized = filename.replace(/[\/\\?%*:|"<>]/g, '_')
  
  // Replace multiple underscores with single underscore
  sanitized = sanitized.replace(/_{2,}/g, '_')
  
  // Remove leading/trailing underscores
  sanitized = sanitized.replace(/^_+|_+$/g, '')
  
  // Ensure filename is not empty
  if (!sanitized) {
    sanitized = 'untitled.pdf'
  }
  
  // Ensure .pdf extension
  if (!sanitized.toLowerCase().endsWith('.pdf')) {
    sanitized += '.pdf'
  }
  
  return sanitized
}

// Generate safe storage path
export function generateStoragePath(userId?: string, originalFilename?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const sanitizedFilename = originalFilename ? sanitizeFilename(originalFilename) : `document_${timestamp}.pdf`
  
  // Create a unique filename to avoid conflicts
  const nameWithoutExt = sanitizedFilename.substring(0, sanitizedFilename.lastIndexOf('.'))
  const uniqueFilename = `${nameWithoutExt}_${timestamp}_${random}.pdf`
  
  // Organize by user if provided, otherwise use a general uploads folder
  const userFolder = userId ? `user_${userId}` : 'public'
  
  return `pdfs/${userFolder}/${uniqueFilename}`
}

// Validate PDF upload form data
export interface PDFUploadData {
  title?: string
  description?: string
  is_public?: boolean
  file: File
  uploaded_by?: string
}

export function validatePDFUpload(data: PDFUploadData): void {
  // Validate file
  if (!data.file) {
    throw new PDFValidationError('File is required', 'MISSING_FILE')
  }

  validateMimeType(data.file)
  validateFileExtension(data.file.name)
  validateFileSize(data.file.size)

  // Validate title (if provided)
  if (data.title && data.title.trim().length === 0) {
    throw new PDFValidationError('Title cannot be empty if provided', 'INVALID_TITLE')
  }

  if (data.title && data.title.length > 255) {
    throw new PDFValidationError('Title cannot exceed 255 characters', 'TITLE_TOO_LONG')
  }

  // Validate description (if provided)
  if (data.description && data.description.length > 1000) {
    throw new PDFValidationError('Description cannot exceed 1000 characters', 'DESCRIPTION_TOO_LONG')
  }
}

// Validate PDF metadata for creation
export interface PDFMetadataInput {
  title: string
  filename: string
  original_filename: string
  file_size: number
  file_path: string
  description?: string
  is_active?: boolean
  is_public?: boolean
  uploaded_by?: string
}

export function validatePDFMetadata(data: PDFMetadataInput): void {
  if (!data.title || data.title.trim().length === 0) {
    throw new PDFValidationError('Title is required', 'MISSING_TITLE')
  }

  if (data.title.length > 255) {
    throw new PDFValidationError('Title cannot exceed 255 characters', 'TITLE_TOO_LONG')
  }

  if (!data.filename || data.filename.trim().length === 0) {
    throw new PDFValidationError('Filename is required', 'MISSING_FILENAME')
  }

  if (!data.original_filename || data.original_filename.trim().length === 0) {
    throw new PDFValidationError('Original filename is required', 'MISSING_ORIGINAL_FILENAME')
  }

  if (!data.file_path || data.file_path.trim().length === 0) {
    throw new PDFValidationError('File path is required', 'MISSING_FILE_PATH')
  }

  validateFileSize(data.file_size)
  validateFileExtension(data.original_filename)

  if (data.description && data.description.length > 1000) {
    throw new PDFValidationError('Description cannot exceed 1000 characters', 'DESCRIPTION_TOO_LONG')
  }
}

// Validate pagination parameters
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export function validatePaginationParams(params: PaginationParams): {
  page: number
  limit: number
  search?: string
} {
  const page = Math.max(1, parseInt(String(params.page || 1)))
  let limit = Math.max(1, parseInt(String(params.limit || 10)))
  
  // Cap limit to prevent abuse
  limit = Math.min(limit, 100)
  
  return {
    page,
    limit,
    search: params.search?.trim() || undefined
  }
}

// Helper function to format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Validate PDF ID parameter
export function validatePDFId(id: string): string {
  if (!id || id.trim().length === 0) {
    throw new PDFValidationError('PDF ID is required', 'MISSING_PDF_ID')
  }
  
  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id.trim())) {
    throw new PDFValidationError('Invalid PDF ID format', 'INVALID_PDF_ID')
  }
  
  return id.trim()
}