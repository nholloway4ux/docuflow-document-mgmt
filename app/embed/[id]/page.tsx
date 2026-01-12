'use client'

import { use, useEffect, useState } from 'react'
import { PDFViewerWrapper } from '@/components/pdf/PDFViewerWrapper'

interface EmbedPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EmbedPage({ params }: EmbedPageProps) {
  const { id } = use(params)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[EmbedPage] Starting to fetch PDF for ID:', id)
    
    async function fetchPDF() {
      try {
        // For testing, use a demo PDF
        if (id === 'test' || id === 'demo') {
          console.log('[EmbedPage] Using demo PDF')
          setPdfUrl('/sample.pdf')
          setIsLoading(false)
          return
        }

        // Fetch the actual PDF URL from the API
        console.log('[EmbedPage] Fetching PDF from API:', `/api/pdfs/${id}`)
        const response = await fetch(`/api/pdfs/${id}`)
        console.log('[EmbedPage] API response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`PDF not found (status: ${response.status})`)
        }
        
        const result = await response.json()
        console.log('[EmbedPage] API response data:', result)
        
        // The API returns data.data.storage_url
        const pdfUrl = result.data?.storage_url || result.data?.file_path
        console.log('[EmbedPage] Extracted PDF URL:', pdfUrl)
        
        if (!pdfUrl) {
          throw new Error('PDF URL not found in response')
        }
        setPdfUrl(pdfUrl)
      } catch (err) {
        console.error('[EmbedPage] Error fetching PDF:', err)
        setError(err instanceof Error ? err.message : 'Failed to load PDF')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPDF()
  }, [id])

  console.log('[EmbedPage] Current state:', { isLoading, error, pdfUrl })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading PDF metadata...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No PDF available</p>
        </div>
      </div>
    )
  }

  console.log('[EmbedPage] Rendering PDFViewerWrapper with URL:', pdfUrl)
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <PDFViewerWrapper url={pdfUrl} className="w-full h-full" />
    </div>
  )
}