'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import type { PDFPageProxy } from 'pdfjs-dist'
import { PDF_CONFIG, FitMode } from '@/lib/pdf-config'
import { Loader2, AlertCircle } from 'lucide-react'

interface PDFViewerProps {
  page: PDFPageProxy | null
  scale: number
  fitMode: FitMode
  containerWidth?: number
  containerHeight?: number
  onError?: (error: string) => void
  className?: string
  showLoading?: boolean
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  page,
  scale,
  fitMode,
  containerWidth = 800,
  containerHeight = 600,
  onError,
  className = '',
  showLoading = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const renderTaskRef = useRef<any>(null)
  const [isRendering, setIsRendering] = useState(false)
  const [renderError, setRenderError] = useState<string | null>(null)

  const calculateScale = useCallback((page: PDFPageProxy): number => {
    if (!containerRef.current) return scale

    const viewport = page.getViewport({ scale: 1.0 })
    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    
    const availableWidth = containerRect.width || containerWidth
    const availableHeight = containerRect.height || containerHeight

    switch (fitMode) {
      case PDF_CONFIG.fitModes.PAGE_WIDTH:
        return availableWidth / viewport.width

      case PDF_CONFIG.fitModes.PAGE_FIT:
        const scaleX = availableWidth / viewport.width
        const scaleY = availableHeight / viewport.height
        return Math.min(scaleX, scaleY)

      case PDF_CONFIG.fitModes.AUTO:
      default:
        return scale
    }
  }, [scale, fitMode, containerWidth, containerHeight])

  const renderPage = useCallback(async (page: PDFPageProxy) => {
    if (!canvasRef.current) return

    // Cancel previous render if it exists
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    setIsRendering(true)
    setRenderError(null)

    try {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (!context) {
        throw new Error('Could not get 2D context from canvas')
      }

      const actualScale = calculateScale(page)
      const viewport = page.getViewport({ scale: actualScale })

      // Set canvas dimensions
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height)

      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        enableWebGL: false,
        canvas: canvas,
      }

      renderTaskRef.current = page.render(renderContext)
      await renderTaskRef.current.promise

      setIsRendering(false)
    } catch (error: any) {
      if (error.name === 'RenderingCancelledException') {
        // Ignore cancelled renders
        return
      }

      console.error('PDF render error:', error)
      const errorMessage = error.message || 'Failed to render PDF page'
      setRenderError(errorMessage)
      setIsRendering(false)
      onError?.(errorMessage)
    }
  }, [calculateScale, onError])

  // Effect to render page when page or scale changes
  useEffect(() => {
    if (page) {
      renderPage(page)
    }
    
    // Cleanup function
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
    }
  }, [page, renderPage])

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current || fitMode === PDF_CONFIG.fitModes.AUTO) return

    const handleResize = () => {
      if (page) {
        renderPage(page)
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [page, fitMode, renderPage])

  if (!page && showLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} ref={containerRef}>
        <div className="flex flex-col items-center space-y-2 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (renderError) {
    return (
      <div className={`flex items-center justify-center ${className}`} ref={containerRef}>
        <div className="flex flex-col items-center space-y-2 text-red-600">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm text-center px-4">
            Error rendering PDF: {renderError}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ 
        width: '100%',
        height: '100%',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {isRendering && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-2 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Rendering page...</p>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-auto block"
        style={{ maxWidth: '100%', height: 'auto' }}
        style={{
          display: page ? 'block' : 'none',
        }}
      />
      
      {!page && !showLoading && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p className="text-sm">No PDF loaded</p>
        </div>
      )}
    </div>
  )
}