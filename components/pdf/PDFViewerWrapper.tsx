'use client'

import React, { useEffect, useState } from 'react'
import { PDFViewer } from './PDFViewer'
import { usePDF } from '@/hooks/usePDF'
import { PDF_CONFIG } from '@/lib/pdf-config'
import { Loader2, AlertCircle } from 'lucide-react'

interface PDFViewerWrapperProps {
  url: string
  className?: string
}

export const PDFViewerWrapper: React.FC<PDFViewerWrapperProps> = ({
  url,
  className = ''
}) => {
  const [state, actions] = usePDF()
  const [loadAttempted, setLoadAttempted] = useState(false)

  useEffect(() => {
    console.log('[PDFViewerWrapper] Component mounted with URL:', url)
    if (url && !loadAttempted) {
      console.log('[PDFViewerWrapper] Loading PDF from URL:', url)
      setLoadAttempted(true)
      actions.loadPDF(url).then(() => {
        console.log('[PDFViewerWrapper] PDF load completed')
      }).catch((error) => {
        console.error('[PDFViewerWrapper] PDF load failed:', error)
      })
    }
  }, [url, actions, loadAttempted])

  useEffect(() => {
    console.log('[PDFViewerWrapper] State updated:', {
      isLoading: state.isLoading,
      error: state.error,
      document: state.document ? 'loaded' : 'null',
      currentPage: state.currentPage ? 'loaded' : 'null',
      pageNumber: state.pageNumber,
      totalPages: state.totalPages
    })
  }, [state])

  if (state.isLoading) {
    console.log('[PDFViewerWrapper] Showing loading state')
    return (
      <div className={`flex items-center justify-center min-h-screen  ${className}`}>
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (state.error) {
    console.error('[PDFViewerWrapper] Showing error state:', state.error)
    return (
      <div className={`flex items-center justify-center min-h-screen  ${className}`}>
        <div className="flex flex-col items-center space-y-3 max-w-md">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <div className="text-center">
            <p className="text-red-600 font-medium">Failed to load PDF</p>
            <p className="text-red-500 text-sm mt-1">{state.error}</p>
            <button
              onClick={() => {
                console.log('[PDFViewerWrapper] Retrying PDF load')
                setLoadAttempted(false)
              }}
              className="mt-4 px-4 py-2 0 text-white rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!state.currentPage) {
    console.log('[PDFViewerWrapper] No current page available')
    return (
      <div className={`flex items-center justify-center min-h-screen  ${className}`}>
        <div className="text-center text-gray-500">
          <p>No PDF content available</p>
        </div>
      </div>
    )
  }

  console.log('[PDFViewerWrapper] Rendering PDFViewer with page')
  return (
    <div className={`w-full h-full ${className}`}>
      <PDFViewer
        page={state.currentPage}
        scale={state.scale}
        fitMode={state.fitMode}
        className="w-full h-full"
      />
      
      {/* Simple navigation controls */}
      {state.totalPages > 1 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-4">
          <button
            onClick={actions.prevPage}
            disabled={state.pageNumber <= 1}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {state.pageNumber} of {state.totalPages}
          </span>
          <button
            onClick={actions.nextPage}
            disabled={state.pageNumber >= state.totalPages}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}