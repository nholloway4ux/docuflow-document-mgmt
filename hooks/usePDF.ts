'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { PDF_CONFIG, PDF_ERRORS, initializePDFWorker, FitMode } from '@/lib/pdf-config'

export interface PDFState {
  document: PDFDocumentProxy | null
  currentPage: PDFPageProxy | null
  pageNumber: number
  totalPages: number
  scale: number
  isLoading: boolean
  error: string | null
  fitMode: FitMode
}

export interface PDFActions {
  loadPDF: (url: string) => Promise<void>
  goToPage: (pageNumber: number) => Promise<void>
  nextPage: () => Promise<void>
  prevPage: () => Promise<void>
  zoomIn: () => void
  zoomOut: () => void
  setFitMode: (mode: FitMode) => void
  setScale: (scale: number) => void
  reset: () => void
}

// Detect mobile device
const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

const initialState: PDFState = {
  document: null,
  currentPage: null,
  pageNumber: 1,
  totalPages: 0,
  scale: PDF_CONFIG.defaultScale,
  isLoading: false,
  error: null,
  fitMode: isMobile ? PDF_CONFIG.fitModes.PAGE_FIT : PDF_CONFIG.fitModes.PAGE_WIDTH,
}

export function usePDF(): [PDFState, PDFActions] {
  const [state, setState] = useState<PDFState>(initialState)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Initialize PDF.js worker
  useEffect(() => {
    initializePDFWorker()
  }, [])

  const loadPDF = useCallback(async (url: string) => {
    if (!url) {
      setState(prev => ({ ...prev, error: 'Invalid PDF URL' }))
      return
    }

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      document: null,
      currentPage: null,
      pageNumber: 1,
      totalPages: 0
    }))

    try {
      // Dynamically import pdfjs-dist to avoid SSR issues
      const { getDocument } = await import('pdfjs-dist')
      
      const loadingTask = getDocument({
        url,
        httpHeaders: {
          'Accept': 'application/pdf',
        },
        withCredentials: false,
        disableAutoFetch: false,
        disableStream: false,
      })

      const pdfDocument = await loadingTask.promise

      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      const totalPages = pdfDocument.numPages
      
      // Load first page
      const firstPage = await pdfDocument.getPage(1)

      setState(prev => ({
        ...prev,
        document: pdfDocument,
        currentPage: firstPage,
        pageNumber: 1,
        totalPages,
        isLoading: false,
        error: null,
      }))
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return
      }

      let errorMessage: string = PDF_ERRORS.LOADING_FAILED
      
      if (error.name === 'MissingPDFException') {
        errorMessage = 'Invalid PDF URL'
      } else if (error.name === 'UnexpectedResponseException') {
        errorMessage = PDF_ERRORS.NETWORK_ERROR
      } else if (error.message) {
        errorMessage = error.message
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        document: null,
        currentPage: null,
      }))
    }
  }, [])

  const goToPage = useCallback(async (pageNumber: number) => {
    if (!state.document || pageNumber < 1 || pageNumber > state.totalPages) {
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const page = await state.document.getPage(pageNumber)
      setState(prev => ({
        ...prev,
        currentPage: page,
        pageNumber,
        isLoading: false,
      }))
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: 'Page not found',
        isLoading: false,
      }))
    }
  }, [state.document, state.totalPages])

  const nextPage = useCallback(async () => {
    if (state.pageNumber < state.totalPages) {
      await goToPage(state.pageNumber + 1)
    }
  }, [state.pageNumber, state.totalPages, goToPage])

  const prevPage = useCallback(async () => {
    if (state.pageNumber > 1) {
      await goToPage(state.pageNumber - 1)
    }
  }, [state.pageNumber, goToPage])

  const zoomIn = useCallback(() => {
    const newScale = Math.min(state.scale + PDF_CONFIG.scaleStep, PDF_CONFIG.maxScale)
    setState(prev => ({ ...prev, scale: newScale, fitMode: PDF_CONFIG.fitModes.AUTO }))
  }, [state.scale])

  const zoomOut = useCallback(() => {
    const newScale = Math.max(state.scale - PDF_CONFIG.scaleStep, PDF_CONFIG.minScale)
    setState(prev => ({ ...prev, scale: newScale, fitMode: PDF_CONFIG.fitModes.AUTO }))
  }, [state.scale])

  const setFitMode = useCallback((mode: FitMode) => {
    setState(prev => ({ ...prev, fitMode: mode }))
  }, [])

  const setScale = useCallback((scale: number) => {
    const clampedScale = Math.max(PDF_CONFIG.minScale, Math.min(PDF_CONFIG.maxScale, scale))
    setState(prev => ({ 
      ...prev, 
      scale: clampedScale,
      fitMode: PDF_CONFIG.fitModes.AUTO 
    }))
  }, [])

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState(initialState)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (state.document) {
        state.document.destroy()
      }
    }
  }, [])

  const actions: PDFActions = {
    loadPDF,
    goToPage,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
    setFitMode,
    setScale,
    reset,
  }

  return [state, actions]
}