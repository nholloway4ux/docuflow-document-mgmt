import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, validateUploadToken } from '@/lib/storage'
import { createPDF } from '@/lib/db/pdfs'
import { validatePDFUpload, sanitizeFilename, PDFValidationError } from '@/lib/validations/pdf'
import { ApiResponse } from '@/types'

// POST /api/uploads/complete - Confirm upload completion
export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData()
    const uploadToken = formData.get('upload_token') as string
    const file = formData.get('file') as File
    const title = formData.get('title') as string || ''
    const description = formData.get('description') as string || ''
    const isPublic = formData.get('is_public') === 'true'

    console.log('Upload Complete Request:', {
      uploadToken: uploadToken?.substring(0, 20) + '...',
      file: file ? { name: file.name, size: file.size, type: file.type } : null,
      title,
      description,
      isPublic
    })

    // Validate required fields
    if (!uploadToken || !file) {
      console.error('Missing fields:', { uploadToken: !!uploadToken, file: !!file })
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields: upload_token, file'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validate upload token
    const tokenData = validateUploadToken(uploadToken)
    if (!tokenData) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired upload token'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validate PDF upload
    try {
      validatePDFUpload({
        title: title || undefined,
        description: description || undefined,
        is_public: isPublic,
        file,
        uploaded_by: tokenData.userId
      })
    } catch (validationError) {
      if (validationError instanceof PDFValidationError) {
        const response: ApiResponse = {
          success: false,
          error: validationError.message
        }
        return NextResponse.json(response, { status: validationError.statusCode })
      }
      throw validationError
    }

    // Upload file to storage
    const { path: storagePath, publicUrl } = await uploadFile(file, {
      path: tokenData.path,
      userId: tokenData.userId,
      originalFilename: file.name
    })

    // Prepare PDF metadata
    const sanitizedFilename = sanitizeFilename(file.name)
    const pdfTitle = title.trim() || file.name.replace(/\.[^/.]+$/, '') // Remove extension if no title provided
    
    // Generate embed code
    const embedCode = `<iframe src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/embed/pdf" width="100%" height="600" frameborder="0"></iframe>`

    console.log('Creating PDF record with data:', {
      title: pdfTitle,
      filename: sanitizedFilename,
      original_filename: file.name,
      file_size: file.size,
      file_path: storagePath,
      mime_type: 'application/pdf',
      description: description.trim() || undefined,
      is_active: true,
      is_public: isPublic,
      embed_code: embedCode.substring(0, 50) + '...',
      uploaded_by: tokenData.userId,
      storage_url: publicUrl?.substring(0, 50) + '...'
    })

    // Create PDF record in database
    const pdf = await createPDF({
      title: pdfTitle,
      filename: sanitizedFilename,
      original_filename: file.name,
      file_size: file.size,
      file_path: storagePath,
      mime_type: 'application/pdf',
      description: description.trim() || undefined,
      is_active: true,
      is_public: isPublic,
      embed_code: embedCode,
      uploaded_by: tokenData.userId,
      storage_url: publicUrl
    })

    const response: ApiResponse = {
      success: true,
      data: {
        pdf,
        storage_url: publicUrl,
        upload_complete: true
      },
      message: 'PDF uploaded and processed successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/uploads/complete:', error)
    
    if (error instanceof PDFValidationError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      }
      return NextResponse.json(response, { status: error.statusCode })
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete upload'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// Handle file upload via traditional POST (alternative method)
export async function PUT(request: NextRequest) {
  try {
    // Get upload token from headers or query params
    const uploadToken = request.headers.get('x-upload-token') || 
                       new URL(request.url).searchParams.get('token')
    
    if (!uploadToken) {
      const response: ApiResponse = {
        success: false,
        error: 'Upload token required in header (x-upload-token) or query param (token)'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validate upload token
    const tokenData = validateUploadToken(uploadToken)
    if (!tokenData) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired upload token'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Get file data from request body
    const fileBuffer = Buffer.from(await request.arrayBuffer())
    
    // Validate file size
    if (fileBuffer.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'No file data received'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Extract filename from path or use default
    const originalFilename = tokenData.path.split('/').pop() || 'document.pdf'
    
    // Upload file to storage
    const { path: storagePath, publicUrl } = await uploadFile(fileBuffer, {
      path: tokenData.path,
      userId: tokenData.userId,
      originalFilename
    })

    // Prepare PDF metadata with minimal information
    const sanitizedFilename = sanitizeFilename(originalFilename)
    const pdfTitle = originalFilename.replace(/\.[^/.]+$/, '') // Remove extension
    
    // Generate embed code
    const embedCode = `<iframe src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/embed/pdf" width="100%" height="600" frameborder="0"></iframe>`

    // Create PDF record in database
    const pdf = await createPDF({
      title: pdfTitle,
      filename: sanitizedFilename,
      original_filename: originalFilename,
      file_size: fileBuffer.length,
      file_path: storagePath,
      mime_type: 'application/pdf',
      description: undefined,
      is_active: true,
      is_public: true,
      embed_code: embedCode,
      uploaded_by: tokenData.userId,
      storage_url: publicUrl
    })

    const response: ApiResponse = {
      success: true,
      data: {
        pdf,
        storage_url: publicUrl,
        upload_complete: true
      },
      message: 'PDF uploaded and processed successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error in PUT /api/uploads/complete:', error)
    
    if (error instanceof PDFValidationError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      }
      return NextResponse.json(response, { status: error.statusCode })
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete upload'
    }

    return NextResponse.json(response, { status: 500 })
  }
}