import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { validatePDFFile } from '@/lib/format'

export interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
  uploadedFile: { id: string; filename: string } | null
}

export interface UploadOptions {
  onSuccess?: (fileId: string, filename: string) => void
  onError?: (error: string) => void
  onProgress?: (progress: number) => void
}

export function useUpload(options: UploadOptions = {}) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFile: null
  })
  
  const { toast } = useToast()

  const resetState = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFile: null
    })
  }, [])

  const uploadFile = useCallback(async (file: File) => {
    // Validate file
    const validation = validatePDFFile(file)
    if (!validation.valid) {
      const error = validation.error || 'Invalid file'
      setState(prev => ({ ...prev, error }))
      toast({
        title: "Upload Error",
        description: error,
        variant: "destructive"
      })
      options.onError?.(error)
      return false
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
      uploadedFile: null
    }))

    try {
      // Step 1: Request upload URL
      const urlResponse = await fetch('/api/uploads/request-url', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          file_size: file.size,
          file_type: file.type,
        }),
      })

      if (!urlResponse.ok) {
        const errorData = await urlResponse.json()
        throw new Error(errorData.error || 'Failed to request upload URL')
      }

      const { data } = await urlResponse.json()
      const { upload_token } = data

      // Step 2: Upload file with the token
      setState(prev => ({ ...prev, progress: 10 }))
      options.onProgress?.(10)

      // Use FormData to upload the file
      const formData = new FormData()
      formData.append('upload_token', upload_token)
      formData.append('file', file)

      const xhr = new XMLHttpRequest()
      
      return new Promise<boolean>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 80) + 10 // 10-90%
            setState(prev => ({ ...prev, progress }))
            options.onProgress?.(progress)
          }
        })

        xhr.addEventListener('load', async () => {
          if (xhr.status === 200 || xhr.status === 201) {
            try {
              setState(prev => ({ ...prev, progress: 95 }))
              options.onProgress?.(95)

              const result = JSON.parse(xhr.responseText)

              if (!result.success) {
                throw new Error(result.error || 'Failed to complete upload')
              }

              const { pdf } = result.data || {}
              
              if (pdf && pdf.id && pdf.filename) {
                setState(prev => ({
                  ...prev,
                  isUploading: false,
                  progress: 100,
                  uploadedFile: { id: pdf.id, filename: pdf.filename }
                }))
                
                options.onProgress?.(100)
                options.onSuccess?.(pdf.id, pdf.filename)
              } else {
                throw new Error('Upload response missing PDF data')
              }
              
              toast({
                title: "Upload Successful",
                description: `${file.name} has been uploaded successfully.`
              })

              resolve(true)
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Failed to complete upload'
              setState(prev => ({
                ...prev,
                isUploading: false,
                error: message
              }))
              options.onError?.(message)
              toast({
                title: "Upload Error",
                description: message,
                variant: "destructive"
              })
              reject(error)
            }
          } else {
            const message = `Upload failed with status: ${xhr.status}`
            setState(prev => ({
              ...prev,
              isUploading: false,
              error: message
            }))
            options.onError?.(message)
            toast({
              title: "Upload Error",
              description: message,
              variant: "destructive"
            })
            reject(new Error(message))
          }
        })

        xhr.addEventListener('error', () => {
          const message = 'Network error during upload'
          setState(prev => ({
            ...prev,
            isUploading: false,
            error: message
          }))
          options.onError?.(message)
          toast({
            title: "Upload Error",
            description: message,
            variant: "destructive"
          })
          reject(new Error(message))
        })

        xhr.open('POST', '/api/uploads/complete')
        xhr.send(formData)
      })

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: message
      }))
      options.onError?.(message)
      toast({
        title: "Upload Error",
        description: message,
        variant: "destructive"
      })
      return false
    }
  }, [toast, options])

  const uploadMultipleFiles = useCallback(async (files: File[]) => {
    const results = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const success = await uploadFile(file)
        results.push({ file: file.name, success, error: success ? null : 'Upload failed' })
        
        // Reset state between uploads except for the last one
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause between uploads
          resetState()
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed'
        results.push({ file: file.name, success: false, error: message })
      }
    }
    
    // Show summary for multiple uploads
    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount
    
    if (failureCount === 0) {
      toast({
        title: "All Uploads Successful",
        description: `Successfully uploaded ${successCount} files.`
      })
    } else if (successCount === 0) {
      toast({
        title: "All Uploads Failed",
        description: `Failed to upload ${failureCount} files.`,
        variant: "destructive"
      })
    } else {
      toast({
        title: "Partial Upload Success",
        description: `${successCount} files uploaded successfully, ${failureCount} failed.`,
        variant: "destructive"
      })
    }
    
    return results
  }, [uploadFile, resetState, toast])

  return {
    ...state,
    uploadFile,
    uploadMultipleFiles,
    resetUpload: resetState
  }
}