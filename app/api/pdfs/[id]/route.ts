import { NextRequest, NextResponse } from 'next/server'
import { getPDFById, incrementViewCount, deletePDF, updatePDF } from '@/lib/db/pdfs'
import { getPublicUrl, deleteFile } from '@/lib/storage'
import { validatePDFId, PDFValidationError } from '@/lib/validations/pdf'
import { ApiResponse } from '@/types'
import { createServerClientForAuth } from '@/lib/supabase-server'

// GET /api/pdfs/[id] - Get single PDF details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    // Validate PDF ID
    const pdfId = validatePDFId(resolvedParams.id)

    // Get PDF by ID
    const pdf = await getPDFById(pdfId)

    if (!pdf) {
      const response: ApiResponse = {
        success: false,
        error: 'PDF not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Increment view count (async, don't wait for completion)
    incrementViewCount(pdfId).catch(err => {
      console.warn('Failed to increment view count:', err)
    })

    // Get public URL for the PDF
    let publicUrl: string | undefined
    try {
      publicUrl = await getPublicUrl(pdf.file_path)
    } catch (error) {
      console.warn('Failed to get public URL:', error)
    }

    const response: ApiResponse = {
      success: true,
      data: {
        ...pdf,
        storage_url: publicUrl
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error in GET /api/pdfs/[id]:', error)
    
    if (error instanceof PDFValidationError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      }
      return NextResponse.json(response, { status: error.statusCode })
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch PDF'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// PUT /api/pdfs/[id] - Update PDF metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
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

    // Validate PDF ID
    const pdfId = validatePDFId(resolvedParams.id)

    // Check if PDF exists
    const existingPDF = await getPDFById(pdfId)
    if (!existingPDF) {
      const response: ApiResponse = {
        success: false,
        error: 'PDF not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { title, description, is_public, is_active } = body

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Title must be a non-empty string'
        }
        return NextResponse.json(response, { status: 400 })
      }
      if (title.length > 255) {
        const response: ApiResponse = {
          success: false,
          error: 'Title cannot exceed 255 characters'
        }
        return NextResponse.json(response, { status: 400 })
      }
    }

    // Validate description if provided
    if (description !== undefined && description !== null) {
      if (typeof description !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Description must be a string'
        }
        return NextResponse.json(response, { status: 400 })
      }
      if (description.length > 1000) {
        const response: ApiResponse = {
          success: false,
          error: 'Description cannot exceed 1000 characters'
        }
        return NextResponse.json(response, { status: 400 })
      }
    }

    // Update PDF
    const updatedPDF = await updatePDF(pdfId, {
      title,
      description,
      is_public,
      is_active
    })

    if (!updatedPDF) {
      const response: ApiResponse = {
        success: false,
        error: 'PDF not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse = {
      success: true,
      data: updatedPDF,
      message: 'PDF updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in PUT /api/pdfs/[id]:', error)
    
    if (error instanceof PDFValidationError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      }
      return NextResponse.json(response, { status: error.statusCode })
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update PDF'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// DELETE /api/pdfs/[id] - Delete PDF
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
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

    // Validate PDF ID
    const pdfId = validatePDFId(resolvedParams.id)

    // Get PDF details before deletion
    const pdf = await getPDFById(pdfId)
    if (!pdf) {
      const response: ApiResponse = {
        success: false,
        error: 'PDF not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Delete from database (soft delete)
    const deleted = await deletePDF(pdfId)
    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to delete PDF from database'
      }
      return NextResponse.json(response, { status: 500 })
    }

    // Delete from storage (async, don't wait for completion)
    deleteFile(pdf.file_path).catch(err => {
      console.error('Failed to delete file from storage:', err)
    })

    const response: ApiResponse = {
      success: true,
      message: 'PDF deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in DELETE /api/pdfs/[id]:', error)
    
    if (error instanceof PDFValidationError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      }
      return NextResponse.json(response, { status: error.statusCode })
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete PDF'
    }

    return NextResponse.json(response, { status: 500 })
  }
}