import { NextRequest, NextResponse } from 'next/server'
import { getPDFs, createPDF } from '@/lib/db/pdfs'
import { validatePDFMetadata, PDFValidationError } from '@/lib/validations/pdf'
import { ApiResponse, PaginatedResponse } from '@/types'
import { createServerClientForAuth } from '@/lib/supabase-server'

// GET /api/pdfs - List all PDFs with metadata
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    const isPublic = searchParams.get('public') ? searchParams.get('public') === 'true' : undefined

    // Get paginated PDFs
    const result = await getPDFs({
      page,
      limit,
      search,
      isPublic
    })

    const response: PaginatedResponse<any> = {
      success: true,
      data: result.data,
      pagination: result.pagination
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error in GET /api/pdfs:', error)
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch PDFs'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// POST /api/pdfs - Create PDF metadata record
export async function POST(request: NextRequest) {
  try {
    // Check authentication for admin routes
    const supabase = await createServerClientForAuth()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Validate required fields
    const {
      title,
      filename,
      original_filename,
      file_size,
      file_path,
      description,
      is_active = true,
      is_public = true
    } = body

    if (!title || !filename || !original_filename || !file_size || !file_path) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields: title, filename, original_filename, file_size, file_path'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validate PDF metadata
    const pdfData = {
      title,
      filename,
      original_filename,
      file_size: parseInt(file_size.toString()),
      file_path,
      mime_type: 'application/pdf',
      description,
      is_active,
      is_public,
      uploaded_by: user.id
    }

    validatePDFMetadata(pdfData)

    // Generate embed code
    const embedCode = `<iframe src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/embed/pdf" width="100%" height="600" frameborder="0"></iframe>`

    // Create PDF record
    const pdf = await createPDF({
      ...pdfData,
      embed_code: embedCode
    })

    const response: ApiResponse = {
      success: true,
      data: pdf,
      message: 'PDF metadata created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/pdfs:', error)
    
    if (error instanceof PDFValidationError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      }
      return NextResponse.json(response, { status: error.statusCode })
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create PDF metadata'
    }

    return NextResponse.json(response, { status: 500 })
  }
}