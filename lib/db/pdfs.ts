import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { PDF, Database } from '@/types'
import { validatePaginationParams, PaginationParams } from '@/lib/validations/pdf'

// Database error types
export class DatabaseError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code: string, statusCode = 500) {
    super(message)
    this.name = 'DatabaseError'
    this.code = code
    this.statusCode = statusCode
  }
}

// Initialize Supabase client for database operations
function getDatabaseClient(): SupabaseClient<Database> | null {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase credentials not found, using mock database')
      return null
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey)
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error)
    return null
  }
}

// Mock database for development when Supabase is not configured
class MockPDFDatabase {
  private pdfs = new Map<string, PDF>()
  private idCounter = 1

  constructor() {
    // Initialize with some sample data
    this.seedMockData()
  }

  private seedMockData() {
    const samplePDFs: Omit<PDF, 'id'>[] = [
      {
        title: 'Sample Document 1',
        filename: 'sample_1_123.pdf',
        original_filename: 'sample-document.pdf',
        file_size: 1024000,
        file_path: 'pdfs/public/sample_1_123.pdf',
        mime_type: 'application/pdf',
        description: 'A sample PDF document for testing',
        is_active: true,
        is_public: true,
        download_count: 5,
        view_count: 15,
        embed_code: '<iframe src="/embed/1" width="100%" height="600"></iframe>',
        uploaded_by: 'admin',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        title: 'Internal Report',
        filename: 'internal_report_456.pdf',
        original_filename: 'quarterly-report.pdf',
        file_size: 2048000,
        file_path: 'pdfs/user_admin/internal_report_456.pdf',
        mime_type: 'application/pdf',
        description: 'Internal quarterly report',
        is_active: true,
        is_public: false,
        download_count: 2,
        view_count: 8,
        embed_code: '<iframe src="/embed/2" width="100%" height="600"></iframe>',
        uploaded_by: 'admin',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString()
      }
    ]

    samplePDFs.forEach(pdf => {
      const id = `mock-pdf-${this.idCounter++}`
      this.pdfs.set(id, { ...pdf, id })
    })
  }

  async findMany(params: {
    page: number
    limit: number
    search?: string
    isPublic?: boolean
  }): Promise<{ data: PDF[]; total: number }> {
    let allPDFs = Array.from(this.pdfs.values())

    // Filter by search
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      allPDFs = allPDFs.filter(pdf =>
        pdf.title.toLowerCase().includes(searchLower) ||
        pdf.filename.toLowerCase().includes(searchLower) ||
        pdf.original_filename.toLowerCase().includes(searchLower)
      )
    }

    // Filter by public status
    if (params.isPublic !== undefined) {
      allPDFs = allPDFs.filter(pdf => pdf.is_public === params.isPublic)
    }

    // Sort by creation date (newest first)
    allPDFs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const total = allPDFs.length
    const offset = (params.page - 1) * params.limit
    const data = allPDFs.slice(offset, offset + params.limit)

    return { data, total }
  }

  async findById(id: string): Promise<PDF | null> {
    return this.pdfs.get(id) || null
  }

  async create(data: Omit<PDF, 'id' | 'created_at' | 'updated_at' | 'download_count' | 'view_count'>): Promise<PDF> {
    const id = `mock-pdf-${this.idCounter++}`
    const now = new Date().toISOString()
    const pdf: PDF = {
      ...data,
      id,
      download_count: 0,
      view_count: 0,
      created_at: now,
      updated_at: now
    }
    this.pdfs.set(id, pdf)
    return pdf
  }

  async update(id: string, data: Partial<Omit<PDF, 'id' | 'created_at' | 'updated_at'>>): Promise<PDF | null> {
    const existing = this.pdfs.get(id)
    if (!existing) return null

    const updated: PDF = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString()
    }
    this.pdfs.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.pdfs.delete(id)
  }

  async incrementViewCount(id: string): Promise<void> {
    const pdf = this.pdfs.get(id)
    if (pdf) {
      pdf.view_count += 1
      pdf.updated_at = new Date().toISOString()
    }
  }

  async incrementDownloadCount(id: string): Promise<void> {
    const pdf = this.pdfs.get(id)
    if (pdf) {
      pdf.download_count += 1
      pdf.updated_at = new Date().toISOString()
    }
  }

  async findMostRecent(): Promise<PDF | null> {
    const allPDFs = Array.from(this.pdfs.values())
    if (allPDFs.length === 0) return null

    return allPDFs
      .filter(pdf => pdf.is_active)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null
  }
}

// Global mock database instance
const mockDB = new MockPDFDatabase()

// Get paginated list of PDFs
export async function getPDFs(params: PaginationParams & { isPublic?: boolean } = {}): Promise<{
  data: PDF[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}> {
  const validatedParams = validatePaginationParams(params)
  const supabase = getDatabaseClient()

  if (!supabase) {
    // Use mock database
    const result = await mockDB.findMany({
      ...validatedParams,
      isPublic: params.isPublic
    })

    return {
      data: result.data,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / validatedParams.limit)
      }
    }
  }

  try {
    let query = supabase
      .from('pdfs')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Add public filter if specified
    if (params.isPublic !== undefined) {
      query = query.eq('is_public', params.isPublic)
    }

    // Add search filter
    if (validatedParams.search) {
      query = query.or(`title.ilike.%${validatedParams.search}%,filename.ilike.%${validatedParams.search}%,original_filename.ilike.%${validatedParams.search}%`)
    }

    // Add pagination
    const offset = (validatedParams.page - 1) * validatedParams.limit
    query = query.range(offset, offset + validatedParams.limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new DatabaseError(
        `Failed to fetch PDFs: ${error.message}`,
        'FETCH_FAILED'
      )
    }

    return {
      data: data || [],
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validatedParams.limit)
      }
    }
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    throw new DatabaseError(
      `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DATABASE_ERROR'
    )
  }
}

// Get single PDF by ID
export async function getPDFById(id: string): Promise<PDF | null> {
  const supabase = getDatabaseClient()

  if (!supabase) {
    // Use mock database
    return mockDB.findById(id)
  }

  try {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw new DatabaseError(
        `Failed to fetch PDF: ${error.message}`,
        'FETCH_FAILED'
      )
    }

    return data
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    throw new DatabaseError(
      `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DATABASE_ERROR'
    )
  }
}

// Create new PDF record
export async function createPDF(
  data: Omit<PDF, 'id' | 'created_at' | 'updated_at' | 'download_count' | 'view_count'> & { storage_url?: string }
): Promise<PDF> {
  const supabase = getDatabaseClient()

  if (!supabase) {
    // Use mock database
    return mockDB.create(data)
  }

  try {
    const insertData = {
      title: data.title,
      filename: data.filename,
      original_name: data.original_filename,  // Map original_filename to original_name
      file_size: data.file_size,
      file_path: data.file_path,
      mime_type: 'application/pdf',  // Add mime_type field
      description: data.description,
      is_active: data.is_active ?? true,
      is_public: data.is_public ?? true,
      embed_code: data.embed_code,
      uploaded_by: data.uploaded_by,
      storage_url: data.storage_url || '',  // Add storage_url if provided
      uploaded_at: new Date().toISOString()  // Add uploaded_at timestamp
    }
    
    console.log('Inserting into database:', insertData)
    
    const { data: newPDF, error } = await supabase
      .from('pdfs')
      .insert(insertData as any)
      .select()
      .single()

    if (error) {
      throw new DatabaseError(
        `Failed to create PDF: ${error.message}`,
        'CREATE_FAILED'
      )
    }

    return newPDF
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    throw new DatabaseError(
      `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DATABASE_ERROR'
    )
  }
}

// Update PDF record
export async function updatePDF(
  id: string,
  data: Partial<Omit<PDF, 'id' | 'created_at' | 'updated_at'>>
): Promise<PDF | null> {
  const supabase = getDatabaseClient()

  if (!supabase) {
    // Use mock database
    return mockDB.update(id, data)
  }

  try {
    const { data: updatedPDF, error } = await supabase
      .from('pdfs')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw new DatabaseError(
        `Failed to update PDF: ${error.message}`,
        'UPDATE_FAILED'
      )
    }

    return updatedPDF
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    throw new DatabaseError(
      `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DATABASE_ERROR'
    )
  }
}

// Soft delete PDF record
export async function deletePDF(id: string): Promise<boolean> {
  const supabase = getDatabaseClient()

  if (!supabase) {
    // Use mock database
    return mockDB.delete(id)
  }

  try {
    const { error } = await supabase
      .from('pdfs')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      throw new DatabaseError(
        `Failed to delete PDF: ${error.message}`,
        'DELETE_FAILED'
      )
    }

    return true
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    throw new DatabaseError(
      `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DATABASE_ERROR'
    )
  }
}

// Increment view count
export async function incrementViewCount(id: string): Promise<void> {
  const supabase = getDatabaseClient()

  if (!supabase) {
    // Use mock database
    await mockDB.incrementViewCount(id)
    return
  }

  try {
    const { error } = await supabase.rpc('increment_pdf_view_count', { pdf_id: id })

    if (error) {
      // If RPC doesn't exist, fall back to manual increment
      const pdf = await getPDFById(id)
      if (pdf) {
        await updatePDF(id, { view_count: pdf.view_count + 1 })
      }
    }
  } catch (error) {
    // Silently fail for view count increments
    console.warn('Failed to increment view count:', error)
  }
}

// Increment download count
export async function incrementDownloadCount(id: string): Promise<void> {
  const supabase = getDatabaseClient()

  if (!supabase) {
    // Use mock database
    await mockDB.incrementDownloadCount(id)
    return
  }

  try {
    const { error } = await supabase.rpc('increment_pdf_download_count', { pdf_id: id })

    if (error) {
      // If RPC doesn't exist, fall back to manual increment
      const pdf = await getPDFById(id)
      if (pdf) {
        await updatePDF(id, { download_count: pdf.download_count + 1 })
      }
    }
  } catch (error) {
    // Silently fail for download count increments
    console.warn('Failed to increment download count:', error)
  }
}

// Get most recently uploaded PDF
export async function getMostRecentPDF(): Promise<PDF | null> {
  const supabase = getDatabaseClient()

  if (!supabase) {
    // Use mock database
    return mockDB.findMostRecent()
  }

  try {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw new DatabaseError(
        `Failed to fetch recent PDF: ${error.message}`,
        'FETCH_FAILED'
      )
    }

    return data
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    throw new DatabaseError(
      `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DATABASE_ERROR'
    )
  }
}

// Search PDFs by filename or title
export async function searchPDFs(query: string, limit = 10): Promise<PDF[]> {
  if (!query.trim()) {
    return []
  }

  const params: PaginationParams = {
    search: query,
    limit,
    page: 1
  }

  const result = await getPDFs(params)
  return result.data
}