import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface PDF {
  id: string
  filename: string
  originalName: string
  fileSize: number
  uploadedAt: string
  selected: boolean
  viewCount: number
  downloadCount: number
  mimeType: string
  url?: string
}

export interface PDFsState {
  pdfs: PDF[]
  selectedPDF: PDF | null
  isLoading: boolean
  error: string | null
  totalCount: number
  totalSize: number
}

export function usePDFs() {
  const [state, setState] = useState<PDFsState>({
    pdfs: [],
    selectedPDF: null,
    isLoading: false,
    error: null,
    totalCount: 0,
    totalSize: 0
  })
  const { toast } = useToast()

  // Fetch all PDFs
  const fetchPDFs = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await fetch('/api/pdfs', {
        credentials: 'include' // Include cookies for authentication
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch PDFs: ${response.statusText}`)
      }
      
      const data = await response.json()
      const rawPDFs = data.data || data.pdfs || []
      
      // Transform API response to match component expectations
      const pdfs = rawPDFs.map((pdf: any) => ({
        id: pdf.id,
        originalName: pdf.original_name || pdf.originalName || pdf.filename,
        filename: pdf.filename,
        fileSize: pdf.file_size || pdf.fileSize,
        uploadedAt: pdf.uploaded_at || pdf.created_at || pdf.uploadedAt,
        viewCount: pdf.view_count || pdf.viewCount || 0,
        downloadCount: pdf.download_count || pdf.downloadCount || 0,
        isPublic: pdf.is_public !== undefined ? pdf.is_public : pdf.isPublic,
        selected: pdf.selected || false,
        storageUrl: pdf.storage_url || pdf.storageUrl,
        embedCode: pdf.embed_code || pdf.embedCode
      }))
      
      const selectedPDF = pdfs.find((pdf: PDF) => pdf.selected) || null
      const totalSize = pdfs.reduce((sum: number, pdf: PDF) => sum + pdf.fileSize, 0)
      
      setState(prev => ({
        ...prev,
        pdfs,
        selectedPDF,
        totalCount: pdfs.length,
        totalSize,
        isLoading: false
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch PDFs'
      setState(prev => ({
        ...prev,
        error: message,
        isLoading: false
      }))
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
    }
  }, [toast])

  // Fetch selected PDF
  const fetchSelectedPDF = useCallback(async () => {
    try {
      const response = await fetch('/api/pdfs/selected')
      if (response.ok) {
        const data = await response.json()
        setState(prev => ({
          ...prev,
          selectedPDF: data.pdf || null
        }))
      }
    } catch (error) {
      console.error('Failed to fetch selected PDF:', error)
    }
  }, [])

  // Select a PDF
  const selectPDF = useCallback(async (pdfId: string) => {
    try {
      const response = await fetch(`/api/pdfs/${pdfId}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to select PDF: ${response.statusText}`)
      }

      // Update local state optimistically
      setState(prev => {
        const updatedPDFs = prev.pdfs.map(pdf => ({
          ...pdf,
          selected: pdf.id === pdfId
        }))
        const newSelectedPDF = updatedPDFs.find(pdf => pdf.id === pdfId) || null
        
        return {
          ...prev,
          pdfs: updatedPDFs,
          selectedPDF: newSelectedPDF
        }
      })

      toast({
        title: "Success",
        description: "PDF selected successfully"
      })

      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to select PDF'
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
      return false
    }
  }, [toast])

  // Delete a PDF
  const deletePDF = useCallback(async (pdfId: string) => {
    try {
      const response = await fetch(`/api/pdfs/${pdfId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete PDF: ${response.statusText}`)
      }

      // Update local state
      setState(prev => {
        const updatedPDFs = prev.pdfs.filter(pdf => pdf.id !== pdfId)
        const newSelectedPDF = prev.selectedPDF?.id === pdfId ? null : prev.selectedPDF
        const totalSize = updatedPDFs.reduce((sum, pdf) => sum + pdf.fileSize, 0)
        
        return {
          ...prev,
          pdfs: updatedPDFs,
          selectedPDF: newSelectedPDF,
          totalCount: updatedPDFs.length,
          totalSize
        }
      })

      toast({
        title: "Success",
        description: "PDF deleted successfully"
      })

      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete PDF'
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
      return false
    }
  }, [toast])

  // Deselect current PDF
  const deselectPDF = useCallback(async () => {
    if (!state.selectedPDF) return false

    try {
      const response = await fetch(`/api/pdfs/${state.selectedPDF.id}/select`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to deselect PDF: ${response.statusText}`)
      }

      setState(prev => ({
        ...prev,
        pdfs: prev.pdfs.map(pdf => ({ ...pdf, selected: false })),
        selectedPDF: null
      }))

      toast({
        title: "Success",
        description: "PDF deselected successfully"
      })

      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deselect PDF'
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
      return false
    }
  }, [state.selectedPDF, toast])

  // Refresh data
  const refreshPDFs = useCallback(() => {
    fetchPDFs()
  }, [fetchPDFs])

  // Initial load
  useEffect(() => {
    fetchPDFs()
  }, [fetchPDFs])

  return {
    ...state,
    actions: {
      fetchPDFs,
      fetchSelectedPDF,
      selectPDF,
      deletePDF,
      deselectPDF,
      refreshPDFs
    }
  }
}