"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

interface PdfUploadProps {
  onUploadComplete?: (files: File[]) => void
  maxFileSize?: number
  maxFiles?: number
}

export function PdfUpload({ 
  onUploadComplete,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 10
}: PdfUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((rejection) => {
        console.error("File rejected:", rejection.file.name, rejection.errors)
      })
    }

    // Add accepted files to upload queue
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
      progress: 0,
      status: 'pending'
    }))

    setUploadFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: maxFileSize,
    maxFiles,
    disabled: isUploading
  })

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id))
  }

  const startUpload = async () => {
    if (uploadFiles.length === 0) return

    setIsUploading(true)

    // Simulate upload process
    for (const uploadFile of uploadFiles) {
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading' }
          : f
      ))

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, progress }
            : f
        ))
      }

      // Mark as completed
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'completed', progress: 100 }
          : f
      ))
    }

    setIsUploading(false)

    // Notify parent component
    const completedFiles = uploadFiles.map(f => f.file)
    onUploadComplete?.(completedFiles)
  }

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'completed'))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'uploading':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const pendingCount = uploadFiles.filter(f => f.status === 'pending').length
  const completedCount = uploadFiles.filter(f => f.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className="p-8">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-[#8B3A3A] bg-red-50" 
              : "border-gray-300 hover:border-gray-400",
            isUploading && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn(
            "mx-auto h-12 w-12 mb-4",
            isDragActive ? "text-[#8B3A3A]" : "text-gray-400"
          )} />
          
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-[#8B3A3A] mb-2">
                Drop your PDF files here
              </p>
              <p className="text-sm text-gray-600">
                Files will be added to the upload queue
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Upload PDF Files
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your PDF files here, or click to browse
              </p>
              <Button variant="outline" disabled={isUploading}>
                <File className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Maximum file size: {formatFileSize(maxFileSize)}</p>
            <p>Accepted formats: PDF only</p>
          </div>
        </div>
      </Card>

      {/* Upload Queue */}
      {uploadFiles.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Queue ({uploadFiles.length})
            </h3>
            <div className="flex items-center space-x-2">
              {completedCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompleted}
                  disabled={isUploading}
                >
                  Clear Completed
                </Button>
              )}
              {pendingCount > 0 && (
                <Button
                  onClick={startUpload}
                  disabled={isUploading}
                  className="bg-[#8B3A3A] hover:bg-[#7A3333]"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {pendingCount} Files
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {uploadFiles.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  getStatusColor(uploadFile.status)
                )}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(uploadFile.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs opacity-75">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {uploadFile.status}
                    </Badge>
                    
                    {uploadFile.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                        disabled={isUploading}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {uploadFile.status === 'uploading' && (
                  <div className="w-24 ml-3">
                    <Progress value={uploadFile.progress} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}