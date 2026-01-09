'use client'

import { useState } from 'react'
import { Eye, Check, CheckCircle, Trash2, Download, Code, MoreVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PDF } from '@/hooks/usePDFs'
import { formatFileSize, formatSmartDate, truncateFilename } from '@/lib/format'
import { cn } from '@/lib/utils'

interface PDFCardProps {
  pdf: PDF
  onView?: (pdf: PDF) => void
  onSelect?: (pdf: PDF) => void
  onDeselect?: (pdf: PDF) => void
  onDelete?: (pdf: PDF) => void
  onDownload?: (pdf: PDF) => void
  onShowEmbed?: (pdf: PDF) => void
  isSelecting?: boolean
  className?: string
}

export function PDFCard({
  pdf,
  onView,
  onSelect,
  onDeselect,
  onDelete,
  onDownload,
  onShowEmbed,
  isSelecting = false,
  className
}: PDFCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleSelect = () => {
    if (pdf.selected) {
      onDeselect?.(pdf)
    } else {
      onSelect?.(pdf)
    }
  }

  const handleView = () => {
    onView?.(pdf)
  }

  const handleDelete = () => {
    onDelete?.(pdf)
  }

  const handleDownload = () => {
    onDownload?.(pdf)
  }

  const handleShowEmbed = () => {
    onShowEmbed?.(pdf)
  }

  return (
    <Card 
      className={cn(
        'group relative overflow-hidden transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
        pdf.selected && 'ring-2 ring-blue-500 bg-blue-50/50',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selected indicator */}
      {pdf.selected && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </Badge>
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          {/* PDF Icon and Title */}
          <div className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                  <path d="M8 12h4M8 14h3" stroke="white" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 
                className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors"
                title={pdf.originalName}
              >
                {truncateFilename(pdf.originalName, 25)}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatFileSize(pdf.fileSize)}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-2 mb-4 flex-1">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Uploaded</span>
              <span>{formatSmartDate(pdf.uploadedAt)}</span>
            </div>
            
            {pdf.viewCount > 0 && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Views</span>
                <span>{pdf.viewCount.toLocaleString()}</span>
              </div>
            )}
            
            {pdf.downloadCount > 0 && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Downloads</span>
                <span>{pdf.downloadCount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex space-x-1">
              {/* View button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleView}
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                title="View PDF"
              >
                <Eye className="h-4 w-4" />
              </Button>

              {/* Select/Deselect button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelect}
                disabled={isSelecting}
                className={cn(
                  'h-8 w-8 p-0 transition-colors',
                  pdf.selected 
                    ? 'hover:bg-orange-50 hover:text-orange-600' 
                    : 'hover:bg-green-50 hover:text-green-600'
                )}
                title={pdf.selected ? 'Deselect PDF' : 'Select PDF'}
              >
                {pdf.selected ? (
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* More actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-50"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View</span>
                </DropdownMenuItem>
                
                {onDownload && (
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download</span>
                  </DropdownMenuItem>
                )}
                
                {onShowEmbed && (
                  <DropdownMenuItem onClick={handleShowEmbed}>
                    <Code className="mr-2 h-4 w-4" />
                    <span>Embed Code</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>

      {/* Loading overlay during selection */}
      {isSelecting && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
        </div>
      )}
    </Card>
  )
}

// Grid container component
interface PDFGridProps {
  pdfs: PDF[]
  onView?: (pdf: PDF) => void
  onSelect?: (pdf: PDF) => void
  onDeselect?: (pdf: PDF) => void
  onDelete?: (pdf: PDF) => void
  onDownload?: (pdf: PDF) => void
  onShowEmbed?: (pdf: PDF) => void
  selectingIds?: string[]
  className?: string
}

export function PDFGrid({
  pdfs,
  onView,
  onSelect,
  onDeselect,
  onDelete,
  onDownload,
  onShowEmbed,
  selectingIds = [],
  className
}: PDFGridProps) {
  if (pdfs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No PDFs found</h3>
        <p className="text-sm text-gray-500">
          Upload some PDF files to get started.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {pdfs.map((pdf) => (
        <PDFCard
          key={pdf.id}
          pdf={pdf}
          onView={onView}
          onSelect={onSelect}
          onDeselect={onDeselect}
          onDelete={onDelete}
          onDownload={onDownload}
          onShowEmbed={onShowEmbed}
          isSelecting={selectingIds.includes(pdf.id)}
        />
      ))}
    </div>
  )
}