'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Printer,
  Maximize,
  Monitor
} from 'lucide-react'
import { PDF_CONFIG, FitMode } from '@/lib/pdf-config'

interface PDFControlsProps {
  currentPage: number
  totalPages: number
  scale: number
  fitMode: FitMode
  isLoading?: boolean
  onPrevPage: () => void
  onNextPage: () => void
  onGoToPage: (page: number) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onSetFitMode: (mode: FitMode) => void
  onDownload?: () => void
  onPrint?: () => void
  className?: string
  compact?: boolean
}

export const PDFControls: React.FC<PDFControlsProps> = ({
  currentPage,
  totalPages,
  scale,
  fitMode,
  isLoading = false,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  onSetFitMode,
  onDownload,
  onPrint,
  className = '',
  compact = false,
}) => {
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageNumber = parseInt(e.target.value)
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onGoToPage(pageNumber)
    }
  }

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const pageNumber = parseInt(e.currentTarget.value)
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        onGoToPage(pageNumber)
      }
    }
  }

  const scalePercentage = Math.round(scale * 100)

  if (compact) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {/* Page Navigation - Compact */}
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="px-2"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          
          <div className="flex items-center space-x-1 text-sm">
            <input
              type="number"
              value={currentPage}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputKeyDown}
              className="w-12 px-1 py-0.5 text-center text-sm border rounded"
              min={1}
              max={totalPages}
              disabled={isLoading}
            />
            <span className="text-gray-500">of {totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="px-2"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        {/* Download Button */}
        {onDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            disabled={isLoading}
            className="px-2"
          >
            <Download className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-between bg-white border-b px-4 py-2 ${className}`}>
      {/* Left Section - Page Navigation */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Page</span>
            <input
              type="number"
              value={currentPage}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputKeyDown}
              className="w-16 px-2 py-1 text-center text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={1}
              max={totalPages}
              disabled={isLoading}
            />
            <span className="text-sm text-gray-600">of {totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={currentPage >= totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Center Section - Zoom Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          disabled={scale <= PDF_CONFIG.minScale || isLoading}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {scalePercentage}%
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          disabled={scale >= PDF_CONFIG.maxScale || isLoading}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* Fit Mode Buttons */}
        <div className="flex items-center space-x-1 ml-4 border-l pl-4">
          <Button
            variant={fitMode === PDF_CONFIG.fitModes.PAGE_FIT ? "default" : "outline"}
            size="sm"
            onClick={() => onSetFitMode(PDF_CONFIG.fitModes.PAGE_FIT)}
            disabled={isLoading}
          >
            <Maximize className="h-4 w-4" />
            <span className="ml-1 text-xs">Fit</span>
          </Button>
          
          <Button
            variant={fitMode === PDF_CONFIG.fitModes.PAGE_WIDTH ? "default" : "outline"}
            size="sm"
            onClick={() => onSetFitMode(PDF_CONFIG.fitModes.PAGE_WIDTH)}
            disabled={isLoading}
          >
            <Monitor className="h-4 w-4" />
            <span className="ml-1 text-xs">Width</span>
          </Button>
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center space-x-2">
        {onPrint && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            disabled={isLoading}
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
        )}
        
        {onDownload && (
          <Button
            variant="default"
            size="sm"
            onClick={onDownload}
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        )}
      </div>
    </div>
  )
}