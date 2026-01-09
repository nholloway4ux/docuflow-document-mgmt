'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { EmbedViewer } from '@/components/embed/EmbedViewer'
import { Loader2, AlertCircle } from 'lucide-react'

interface PDFDocument {
  id: string
  filename: string
  title: string
  file_url: string
  is_selected: boolean
}

function EmbedPageContent() {
  const searchParams = useSearchParams()
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [title, setTitle] = useState<string>('Church Bulletin')
  const [filename, setFilename] = useState<string>('bulletin.pdf')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeEmbed = async () => {
      try {
        setLoading(true)
        
        // Check if specific PDF URL is provided via URL parameters
        const paramPdfUrl = searchParams.get('pdf')
        const paramTitle = searchParams.get('title')
        const paramFilename = searchParams.get('filename')

        if (paramPdfUrl) {
          // Use URL parameters
          setPdfUrl(decodeURIComponent(paramPdfUrl))
          setTitle(paramTitle ? decodeURIComponent(paramTitle) : 'Church Bulletin')
          setFilename(paramFilename ? decodeURIComponent(paramFilename) : 'document.pdf')
          setLoading(false)
          return
        }

        // Otherwise, fetch the selected PDF or latest PDF
        const response = await fetch('/api/pdfs/selected', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          // If no selected PDF, try to get the latest PDF
          const allPdfsResponse = await fetch('/api/pdfs?limit=1', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (allPdfsResponse.ok) {
            const allPdfs = await allPdfsResponse.json()
            if (allPdfs.length > 0) {
              const latestPdf = allPdfs[0]
              setPdfUrl(latestPdf.file_url)
              setTitle(latestPdf.title || 'Church Bulletin')
              setFilename(latestPdf.filename || 'bulletin.pdf')
            } else {
              setError('No PDF documents available')
            }
          } else {
            setError('No PDF documents available')
          }
        } else {
          const selectedPdf: PDFDocument = await response.json()
          setPdfUrl(selectedPdf.file_url)
          setTitle(selectedPdf.title || 'Church Bulletin')
          setFilename(selectedPdf.filename || 'bulletin.pdf')
        }
      } catch (err: any) {
        console.error('Error loading PDF:', err)
        setError('Failed to load PDF document')
      } finally {
        setLoading(false)
      }
    }

    initializeEmbed()
  }, [searchParams])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading church bulletin...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Church Bulletin Unavailable
          </h2>
          <p className="text-gray-600 mb-4 max-w-md">
            {error}
          </p>
          <p className="text-sm text-gray-500">
            Please contact the church office or try again later.
          </p>
        </div>
      </div>
    )
  }

  // No PDF available
  if (!pdfUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Church Bulletin Available
          </h2>
          <p className="text-gray-600 mb-4 max-w-md">
            There is currently no church bulletin available for viewing.
          </p>
          <p className="text-sm text-gray-500">
            Please check back later or contact the church office.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-white">
      <EmbedViewer
        pdfUrl={pdfUrl}
        title={title}
        filename={filename}
        autoLoad={true}
        showControls={true}
        showDownloadButton={true}
        className="h-full w-full"
        height="100%"
      />
    </div>
  )
}

export default function EmbedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <EmbedPageContent />
    </Suspense>
  )
}