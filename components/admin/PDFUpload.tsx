'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUpload } from '@/hooks/useUpload'
import { formatFileSize, formatProgress, validatePDFFile } from '@/lib/format'
import { cn } from '@/lib/utils'

interface PDFUploadProps {
  onUploadSuccess?: (fileId: string, filename: string) => void
  onUploadComplete?: () => void
  maxFiles?: number
  className?: string
}

interface FileWithStatus {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  uploadedId?: string
}

export function PDFUpload({ 
  onUploadSuccess, 
  onUploadComplete,
  maxFiles = 5,
  className 
}: PDFUploadProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  const upload = useUpload({
    onSuccess: (fileId, filename) => {
      onUploadSuccess?.(fileId, filename)
    }
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileWithStatus[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0
    }))

    // Validate files and set errors
    newFiles.forEach((fileItem) => {
      const validation = validatePDFFile(fileItem.file)
      if (!validation.valid) {
        fileItem.status = 'error'
        fileItem.error = validation.error
      }
    })

    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles))
  }, [maxFiles])

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const uploadFile = async (fileItem: FileWithStatus) => {
    setFiles(prev => prev.map(f => 
      f.id === fileItem.id 
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ))

    const success = await upload.uploadFile(fileItem.file)
    
    setFiles(prev => prev.map(f => 
      f.id === fileItem.id 
        ? { 
            ...f, 
            status: success ? 'success' : 'error',
            progress: success ? 100 : 0,
            error: success ? undefined : 'Upload failed',
            uploadedId: success ? upload.uploadedFile?.id : undefined
          }
        : f
    ))

    if (success && upload.uploadedFile) {
      onUploadSuccess?.(upload.uploadedFile.id, upload.uploadedFile.filename)
    }
  }

  const uploadAllPending = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    for (const fileItem of pendingFiles) {
      await uploadFile(fileItem)
    }
    
    onUploadComplete?.()
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const clearAll = () => {
    setFiles([])
    upload.resetUpload()
  }

  const pendingFiles = files.filter(f => f.status === 'pending')
  const hasValidFiles = pendingFiles.length > 0

  const dropzoneClasses = cn(
    'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
    'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    {
      'border-blue-400 bg-blue-50': isDragAccept,
      'border-red-400 bg-red-50': isDragReject,
      'border-gray-300': !isDragActive && !isDragAccept && !isDragReject,
    }
  )

  return (
    <div className={cn('space-y-6', className)}>
      {/* Upload dropzone */}
      <div {...getRootProps({ className: dropzoneClasses })}>
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Drop PDF files here or click to browse
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Choose PDF files up to 50MB each. Maximum {maxFiles} files.
            </p>
          </div>
          
          <Button type="button" variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({files.length})
            </h4>
            <div className="flex space-x-2">
              {hasValidFiles && (
                <Button
                  onClick={uploadAllPending}
                  disabled={upload.isUploading}
                  size="sm"
                >
                  Upload All
                </Button>
              )}
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                disabled={upload.isUploading}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {files.map((fileItem) => (
              <Card key={fileItem.id} className="p-4">
                <div className="flex items-center space-x-4">
                  {/* File icon and info */}
                  <div className="flex-shrink-0">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileItem.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {/* Status badge */}
                        <StatusBadge status={fileItem.status} />
                        
                        {/* Remove button */}
                        {fileItem.status !== 'uploading' && (
                          <Button
                            onClick={() => removeFile(fileItem.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileItem.file.size)}
                    </p>
                    
                    {/* Progress bar */}
                    {fileItem.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={upload.progress} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatProgress(upload.progress)}
                        </p>
                      </div>
                    )}
                    
                    {/* Error message */}
                    {fileItem.status === 'error' && fileItem.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {fileItem.error}
                      </p>
                    )}
                  </div>
                  
                  {/* Upload button for individual files */}
                  {fileItem.status === 'pending' && (
                    <Button
                      onClick={() => uploadFile(fileItem)}
                      disabled={upload.isUploading}
                      size="sm"
                      variant="outline"
                    >
                      Upload
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: FileWithStatus['status'] }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary" className="text-xs">
          Pending
        </Badge>
      )
    case 'uploading':
      return (
        <Badge variant="default" className="text-xs">
          <div className="animate-spin rounded-full h-2 w-2 border border-white border-t-transparent mr-1" />
          Uploading
        </Badge>
      )
    case 'success':
      return (
        <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Success
        </Badge>
      )
    case 'error':
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>
      )
    default:
      return null
  }
}