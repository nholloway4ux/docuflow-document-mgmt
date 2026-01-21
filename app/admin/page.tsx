'use client'

import { usePDFs } from '@/hooks/usePDFs'
import { QuickStats } from '@/components/admin/StatsCard'
import { PDFUpload } from '@/components/admin/PDFUpload'
import { PDFLibrary } from '@/components/admin/PDFLibrary'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/toaster'

export default function AdminPage() {
  const {
    pdfs,
    selectedPDF,
    isLoading: pdfsLoading,
    totalCount,
    totalSize,
    actions: {
      selectPDF,
      deselectPDF,
      deletePDF,
      refreshPDFs
    }
  } = usePDFs()

  const handleUploadSuccess = () => {
    refreshPDFs()
  }


  const handleView = (pdf: any) => {
    // Open PDF in new tab
    window.open(`/embed/${pdf.id}`, '_blank')
  }

  const handleDownload = (pdf: any) => {
    // Download PDF file
    window.open(`/api/pdfs/${pdf.id}/download`, '_blank')
  }

  const handleSelect = async (pdf: any) => {
    return selectPDF(pdf.id)
  }

  const handleDeselect = async (pdf: any) => {
    return deselectPDF()
  }

  const handleDelete = async (pdf: any) => {
    return deletePDF(pdf.id)
  }

  // Calculate recent uploads (last 7 days)
  const recentUploads = pdfs.filter(pdf => {
    const uploadDate = new Date(pdf.uploadedAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return uploadDate > weekAgo
  }).length

  // Show loading state while PDFs are loading
  if (pdfsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
          {/* Stats overview */}
          <QuickStats
            totalPDFs={totalCount}
            selectedPDF={selectedPDF?.originalName || null}
            totalSize={totalSize}
            recentUploads={recentUploads}
            isLoading={pdfsLoading}
          />

          {/* Main tabs */}
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Upload PDFs
                </h2>
                <p className="text-gray-600 mb-6">
                  Upload PDF documents to make them available for embedding on your website.
                </p>
                
                <PDFUpload 
                  onUploadSuccess={handleUploadSuccess}
                  onUploadComplete={refreshPDFs}
                  maxFiles={5}
                />
              </div>
            </TabsContent>

            <TabsContent value="library" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  PDF Library
                </h2>
                <p className="text-gray-600 mb-6">
                  Manage your uploaded PDFs, select which one to publish, and get embed codes.
                </p>
                
                <PDFLibrary
                  pdfs={pdfs}
                  isLoading={pdfsLoading}
                  onRefresh={refreshPDFs}
                  onView={handleView}
                  onSelect={handleSelect}
                  onDeselect={handleDeselect}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Settings
                </h2>
                <p className="text-gray-600 mb-6">
                  Configure your PDF embedder settings and preferences.
                </p>
                
                <div className="grid gap-6">
                  {/* Account settings */}
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Account Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <p className="text-sm text-gray-900">Authenticated Admin</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Session
                        </label>
                        <p className="text-sm text-gray-900">Active</p>
                      </div>
                    </div>
                  </div>

                  {/* Storage information */}
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Storage Usage
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Total Files
                        </label>
                        <p className="text-sm text-gray-900">{totalCount} PDFs</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Total Size
                        </label>
                        <p className="text-sm text-gray-900">
                          {(totalSize / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-medium text-amber-800 mb-2">
                      Security Information
                    </h4>
                    <p className="text-sm text-amber-700">
                      Your session is secure and will expire automatically for security. 
                      The system uses JWT tokens with httpOnly cookies for authentication.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </main>
  )
}