'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PDFViewer } from '@/components/pdf/PDFViewer'
import { PDFControls } from '@/components/pdf/PDFControls'
import { usePDF } from '@/hooks/usePDF'
import { AlertCircle, Loader2, ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PDFDocument {
  id: string
  filename: string
  title: string
  upload_date: string
  file_url: string
  file_size: number
}

export default function DisplayPDFPage() {
  const params = useParams()
  const id = params.id as string
  const [pdfState, pdfActions] = usePDF()
  const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch PDF document info
  useEffect(() => {
    if (!id) return

    const fetchDocument = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/pdfs/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('PDF document not found')
          } else {
            setError('Failed to load PDF document')
          }
          return
        }

        const data = await response.json()
        setPdfDocument(data)
        
        // Load the PDF
        if (data.file_url) {
          await pdfActions.loadPDF(data.file_url)
        }
      } catch (err: any) {
        console.error('Error fetching document:', err)
        setError('Failed to load PDF document')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [id, pdfActions])

  const handleDownload = () => {
    if (pdfDocument?.file_url) {
      const link = document.createElement('a')
      link.href = pdfDocument.file_url
      link.download = pdfDocument.filename || 'document.pdf'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePrint = () => {
    if (pdfDocument?.file_url) {
      const printWindow = window.open(pdfDocument.file_url, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading PDF Document
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch the document...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || pdfState.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            PDF Not Available
          </h2>
          <p className="text-gray-600 mb-6">
            {error || pdfState.error || 'The requested PDF document could not be found or loaded.'}
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
              className="w-full"
            >
              Try Again
            </Button>
            <Link href="/display">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Gallery
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            If this problem persists, please contact the administrator.
          </p>
        </div>
      </div>
    )
  }

  // No document found
  if (!pdfDocument) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Document Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested PDF document does not exist or has been removed.
          </p>
          <Link href="/display">
            <Button variant="default" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/display">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {pdfDocument.title || pdfDocument.filename}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span>Uploaded {formatDate(pdfDocument.upload_date)}</span>
                  <span>•</span>
                  <span>{formatFileSize(pdfDocument.file_size)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const embedUrl = `${window.location.origin}/embed?pdf=${encodeURIComponent(pdfDocument.file_url)}&title=${encodeURIComponent(pdfDocument.title)}`
                  window.open(embedUrl, '_blank')
                }}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Embed View
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* PDF Controls */}
          {pdfState.document && (
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
            />
          )}

          {/* PDF Viewer */}
          <div className="bg-gray-100" style={{ minHeight: '70vh' }}>
            <PDFViewer
              page={pdfState.currentPage}
              scale={pdfState.scale}
              fitMode={pdfState.fitMode}
              containerHeight={700}
              onError={(error) => {
                console.error('PDF Render Error:', error)
                setError(`Rendering error: ${error}`)
              }}
              className="w-full"
            />
          </div>

          {/* Footer Info */}
          <div className="bg-gray-50 px-6 py-3 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium">File:</span> {pdfDocument.filename}
              </div>
              <div>
                <span className="font-medium">Size:</span> {formatFileSize(pdfDocument.file_size)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}