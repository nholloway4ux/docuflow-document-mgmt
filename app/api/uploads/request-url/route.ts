import { NextRequest, NextResponse } from 'next/server'
import { generateUploadToken } from '@/lib/storage'
import { getAppConfig } from '@/lib/db/settings'
import { validateMimeType, validateFileExtension, validateFileSize, PDFValidationError } from '@/lib/validations/pdf'
import { ApiResponse } from '@/types'
import { createServerClientForRequest } from '@/lib/supabase-server'

// POST /api/uploads/request-url - Get upload URL/token
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { filename, file_size, file_type } = body
    
    console.log('Upload request received:', { filename, file_size, file_type })

    if (!filename || !file_size || !file_type) {
      console.error('Missing fields:', { filename, file_size, file_type })
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields: filename, file_size, file_type'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validate file type
    const mockFile = new File([], filename, { type: file_type })
    
    try {
      validateMimeType(mockFile)
      validateFileExtension(filename)
      validateFileSize(parseInt(file_size.toString()))
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

    // Check app configuration for file size limits
    console.log('Getting app config...')
    const config = await getAppConfig()
    console.log('App config:', config)
    if (parseInt(file_size.toString()) > config.maxFileSize) {
      const maxSizeMB = Math.round(config.maxFileSize / (1024 * 1024))
      const response: ApiResponse = {
        success: false,
        error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Check authentication (optional for public uploads)
    let userId: string | undefined
    try {
      const supabase = createServerClientForRequest(request)
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id
      console.log('Authenticated user:', user?.email, 'ID:', userId)
    } catch (error) {
      console.error('Authentication error:', error)
      // Authentication is optional for public uploads if enabled
      if (!config.enablePublicUploads) {
        const response: ApiResponse = {
          success: false,
          error: 'Authentication required for uploads'
        }
        return NextResponse.json(response, { status: 401 })
      }
    }

    // If public uploads are disabled and no user is authenticated
    if (!config.enablePublicUploads && !userId) {
      const response: ApiResponse = {
        success: false,
        error: 'Public uploads are disabled'
      }
      return NextResponse.json(response, { status: 403 })
    }

    // Generate upload token and path
    const { token, uploadPath, expiresAt } = await generateUploadToken(userId, filename)

    const response: ApiResponse = {
      success: true,
      data: {
        upload_token: token,
        upload_path: uploadPath,
        expires_at: expiresAt,
        max_file_size: config.maxFileSize,
        allowed_types: ['application/pdf'],
        instructions: {
          method: 'POST',
          endpoint: '/api/uploads/complete',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          fields: {
            upload_token: token,
            file: 'PDF file to upload'
          }
        }
      },
      message: 'Upload token generated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in POST /api/uploads/request-url:', error)
    
    if (error instanceof PDFValidationError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      }
      return NextResponse.json(response, { status: error.statusCode })
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate upload token'
    }

    return NextResponse.json(response, { status: 500 })
  }
}