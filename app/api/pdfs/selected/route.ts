import { NextRequest, NextResponse } from 'next/server'
import { getPDFById, getMostRecentPDF } from '@/lib/db/pdfs'
import { getSelectedPDFId } from '@/lib/db/settings'
import { getPublicUrl } from '@/lib/storage'
import { ApiResponse } from '@/types'

// GET /api/pdfs/selected - Get currently selected/published PDF
export async function GET(request: NextRequest) {
  try {
    let selectedPDF = null
    let fallbackUsed = false

    // First, try to get the explicitly selected PDF
    try {
      const selectedPDFId = await getSelectedPDFId()
      if (selectedPDFId) {
        selectedPDF = await getPDFById(selectedPDFId)
      }
    } catch (error) {
      console.warn('Failed to get selected PDF:', error)
    }

    // If no selected PDF or selected PDF not found, fallback to most recent
    if (!selectedPDF) {
      try {
        selectedPDF = await getMostRecentPDF()
        fallbackUsed = true
      } catch (error) {
        console.warn('Failed to get recent PDF:', error)
      }
    }

    // If still no PDF found
    if (!selectedPDF) {
      const response: ApiResponse = {
        success: false,
        error: 'No PDF available',
        message: 'No selected PDF found and no PDFs available'
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Get public URL for the PDF
    let publicUrl: string | undefined
    try {
      publicUrl = await getPublicUrl(selectedPDF.file_path)
    } catch (error) {
      console.warn('Failed to get public URL:', error)
    }

    const response: ApiResponse = {
      success: true,
      data: {
        ...selectedPDF,
        storage_url: publicUrl,
        fallback_used: fallbackUsed
      },
      message: fallbackUsed 
        ? 'Returned most recent PDF (no selection set)' 
        : 'Returned selected PDF'
    }

    // Cache for better performance since this is a public endpoint
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
        // Allow embedding from any domain
        'X-Frame-Options': 'ALLOWALL',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  } catch (error) {
    console.error('Error in GET /api/pdfs/selected:', error)
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch selected PDF'
    }

    // Even on error, allow CORS for public endpoint
    return NextResponse.json(response, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}