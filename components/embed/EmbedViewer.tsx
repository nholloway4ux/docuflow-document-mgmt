'use client'

import React, { useEffect, useState } from 'react'
import { PDFViewer } from '@/components/pdf/PDFViewer'
import { PDFControls } from '@/components/pdf/PDFControls'
import { EmbedDownloadButton } from '@/components/embed/EmbedDownloadButton'
import { usePDF } from '@/hooks/usePDF'
import { PDF_CONFIG } from '@/lib/pdf-config'
import { AlertCircle, Loader2 } from 'lucide-react'

interface EmbedViewerProps {
  pdfUrl?: string
  filename?: string
  title?: string
  autoLoad?: boolean
  showControls?: boolean
  showDownloadButton?: boolean
  className?: string
  height?: string | number
}

export const EmbedViewer: React.FC<EmbedViewerProps> = ({
  pdfUrl,
  filename = 'document.pdf',
  title = 'PDF Document',
  autoLoad = true,
  showControls = true,
  showDownloadButton = true,
  className = '',
  height = '600px',
}) => {
  const [pdfState, pdfActions] = usePDF()
  const [containerHeight, setContainerHeight] = useState<number>(600)

  // Convert height prop to number
  useEffect(() => {
    if (typeof height === 'number') {
      setContainerHeight(height)
    } else if (typeof height === 'string') {
      const numericHeight = parseInt(height.replace('px', ''))
      if (!isNaN(numericHeight)) {
        setContainerHeight(numericHeight)
      }
    }
  }, [height])

  // Auto-load PDF if URL is provided
  useEffect(() => {
    if (autoLoad && pdfUrl && !pdfState.document && !pdfState.isLoading) {
      pdfActions.loadPDF(pdfUrl)
    }
  }, [pdfUrl, autoLoad, pdfState.document, pdfState.isLoading, pdfActions])

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Set fit mode to page width for better mobile experience
      if (window.innerWidth < 768 && pdfState.fitMode !== PDF_CONFIG.fitModes.PAGE_WIDTH) {
        pdfActions.setFitMode(PDF_CONFIG.fitModes.PAGE_WIDTH)
      }
    }

    handleResize() // Call once on mount
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [pdfActions, pdfState.fitMode])

  const handleDownload = () => {
    if (pdfUrl) {
      // Create a temporary download link
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePrint = () => {
    if (pdfUrl) {
      // Open PDF in new window for printing
      const printWindow = window.open(pdfUrl, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    }
  }

  // Error state
  if (pdfState.error) {
    return (
      <div 
        className={`flex items-center justify-center bg-red-50 ${className}`}
        style={{ height }}
      >
        <div className="text-center px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            PDF Not Available
          </h3>
          <p className="text-red-700 mb-4 text-sm">
            {pdfState.error}
          </p>
          <p className="text-red-600 text-xs">
            Please contact the administrator or try again later.
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (pdfState.isLoading && !pdfState.document) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading PDF
          </h3>
          <p className="text-gray-600 text-sm">
            Please wait while we load the document...
          </p>
        </div>
      </div>
    )
  }

  // No PDF URL provided
  if (!pdfUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ height }}
      >
        <div className="text-center px-4">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No PDF Available
          </h3>
          <p className="text-gray-600 text-sm">
            There is currently no PDF document available to display.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Please check with the administrator or try again later.
          </p>
        </div>
      </div>
    )
  }

  const viewerHeight = showControls ? containerHeight - 60 : containerHeight - 20
  const downloadButtonHeight = showDownloadButton ? 60 : 0
  const finalViewerHeight = viewerHeight - downloadButtonHeight

  return (
    <div 
      className={`flex flex-col bg-white ${className}`}
      style={{ height }}
    >
      {/* Title Bar (optional) */}
      {title && (
        <div className="bg-gray-50 border-b px-4 py-2">
          <h2 className="text-lg font-semibold text-gray-800 truncate">
            {title}
          </h2>
        </div>
      )}

      {/* Controls */}
      {showControls && pdfState.document && (
        <PDFControls
          currentPage={pdfState.pageNumber}
          totalPages={pdfState.totalPages}
          scale={pdfState.scale}
          fitMode={pdfState.fitMode}
          isLoading={pdfState.isLoading}
          onPrevPage={pdfActions.prevPage}
          onNextPage={pdfActions.nextPage}
          onGoToPage={pdfActions.goToPage}
          onZoomIn={pdfActions.zoomIn}
          onZoomOut={pdfActions.zoomOut}
          onSetFitMode={pdfActions.setFitMode}
          onDownload={handleDownload}
          onPrint={handlePrint}
          compact={containerHeight < 500}
        />
      )}

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden">
        <PDFViewer
          page={pdfState.currentPage}
          scale={pdfState.scale}
          fitMode={pdfState.fitMode}
          containerHeight={finalViewerHeight}
          onError={(error) => console.error('PDF Render Error:', error)}
          className="w-full h-full"
          showLoading={false}
        />
      </div>

      {/* Download Button */}
      {showDownloadButton && (
        <div className="border-t bg-white px-4 py-3">
          <EmbedDownloadButton
            onDownload={handleDownload}
            filename={filename}
            disabled={pdfState.isLoading || !pdfUrl}
          />
        </div>
      )}
    </div>
  )
}