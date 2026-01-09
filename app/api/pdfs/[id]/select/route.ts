import { NextRequest, NextResponse } from 'next/server'
import { getPDFById } from '@/lib/db/pdfs'
import { setSelectedPDFId, clearSelectedPDFId } from '@/lib/db/settings'
import { validatePDFId, PDFValidationError } from '@/lib/validations/pdf'
import { ApiResponse } from '@/types'
import { createServerClientForAuth } from '@/lib/supabase-server'

// POST /api/pdfs/[id]/select - Mark PDF as selected/published
export async function POST(
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

    // Check if PDF exists and is active
    const pdf = await getPDFById(pdfId)
    if (!pdf) {
      const response: ApiResponse = {
        success: false,
        error: 'PDF not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    if (!pdf.is_active) {
      const response: ApiResponse = {
        success: false,
        error: 'Cannot select inactive PDF'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Set as selected PDF (this automatically clears any previous selection)
    await setSelectedPDFId(pdfId)

    const response: ApiResponse = {
      success: true,
      data: {
        pdf_id: pdfId,
        pdf_title: pdf.title,
        selected_at: new Date().toISOString()
      },
      message: `PDF "${pdf.title}" has been selected as the published PDF`
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in POST /api/pdfs/[id]/select:', error)
    
    if (error instanceof PDFValidationError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      }
      return NextResponse.json(response, { status: error.statusCode })
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to select PDF'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// DELETE /api/pdfs/[id]/select - Clear PDF selection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Clear selection (regardless of which PDF ID is passed)
    await clearSelectedPDFId()

    const response: ApiResponse = {
      success: true,
      message: 'PDF selection cleared'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in DELETE /api/pdfs/[id]/select:', error)
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear PDF selection'
    }

    return NextResponse.json(response, { status: 500 })
  }
}