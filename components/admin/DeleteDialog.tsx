'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PDF } from '@/hooks/usePDFs'
import { formatFileSize, truncateFilename } from '@/lib/format'

interface DeleteDialogProps {
  pdf: PDF
  onDelete: (pdf: PDF) => Promise<boolean>
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DeleteDialog({
  pdf,
  onDelete,
  children,
  open,
  onOpenChange
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const success = await onDelete(pdf)
      if (success) {
        onOpenChange?.(false)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const dialogContent = (
    <AlertDialogContent className="sm:max-w-lg">
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          Delete PDF File?
        </AlertDialogTitle>
        <AlertDialogDescription className="text-left space-y-3">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-600"
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900" title={pdf.originalName}>
                  {truncateFilename(pdf.originalName, 40)}
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-xs text-gray-500">
                    {formatFileSize(pdf.fileSize)}
                  </p>
                  {pdf.selected && (
                    <Badge variant="default" className="text-xs">
                      Currently Published
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-2">
              This action cannot be undone. This will permanently:
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                <span>Delete the PDF file from storage</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                <span>Remove all file metadata and statistics</span>
              </li>
              {pdf.selected && (
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  <span className="font-medium text-red-700">
                    Make your embedded PDF unavailable on websites
                  </span>
                </li>
              )}
            </ul>
          </div>

          {pdf.selected && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">
                    Warning: This PDF is currently published
                  </p>
                  <p className="text-amber-700">
                    Deleting it will break any embedded instances on your websites.
                    Consider deselecting it first if you want to keep your embeds working.
                  </p>
                </div>
              </div>
            </div>
          )}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isDeleting}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
        >
          {isDeleting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete PDF
            </>
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )

  // If controlled (open prop provided), don't use trigger
  if (open !== undefined) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {dialogContent}
      </AlertDialog>
    )
  }

  // If uncontrolled, use trigger
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      {dialogContent}
    </AlertDialog>
  )
}

// Quick delete button component
interface QuickDeleteButtonProps {
  pdf: PDF
  onDelete: (pdf: PDF) => Promise<boolean>
  variant?: 'ghost' | 'outline' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
  showText?: boolean
  className?: string
}

export function QuickDeleteButton({
  pdf,
  onDelete,
  variant = 'ghost',
  size = 'sm',
  showText = false,
  className
}: QuickDeleteButtonProps) {
  return (
    <DeleteDialog pdf={pdf} onDelete={onDelete}>
      <Button 
        variant={variant} 
        size={size} 
        className={className}
      >
        <Trash2 className={showText ? 'w-4 h-4 mr-2' : 'w-4 h-4'} />
        {showText && 'Delete'}
      </Button>
    </DeleteDialog>
  )
}