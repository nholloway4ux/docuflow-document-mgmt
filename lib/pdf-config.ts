// PDF.js configuration options
export const PDF_CONFIG = {
  // Enable text layer for text selection
  enableTextLayer: true,
  // Enable annotation layer for interactive content
  enableAnnotationLayer: true,
  // Standard DPI for rendering
  standardDPI: 96,
  // Default scale
  defaultScale: 1.0,
  // Maximum scale factor
  maxScale: 5.0,
  // Minimum scale factor
  minScale: 0.1,
  // Scale step for zoom in/out
  scaleStep: 0.25,
  // Page fit modes
  fitModes: {
    PAGE_FIT: 'page-fit',
    PAGE_WIDTH: 'page-width',
    AUTO: 'auto',
  } as const,
}

export type FitMode = typeof PDF_CONFIG.fitModes[keyof typeof PDF_CONFIG.fitModes]

// Default rendering options
export const DEFAULT_RENDER_OPTIONS = {
  canvasContext: '2d' as const,
  transform: null,
  viewport: null,
  enableWebGL: false,
  renderInteractiveForms: true,
  disableAutoFetch: false,
  disableStream: false,
  disableFontFace: false,
}

// Initialize PDF.js worker when on client side
export async function initializePDFWorker() {
  if (typeof window !== 'undefined') {
    const { GlobalWorkerOptions } = await import('pdfjs-dist')
    
    // Set the worker source for PDF.js
    GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
  }
}

// Utility functions for PDF rendering
export function calculateScale(
  pageWidth: number,
  pageHeight: number,
  containerWidth: number,
  containerHeight: number,
  fitMode: FitMode
): number {
  switch (fitMode) {
    case PDF_CONFIG.fitModes.PAGE_WIDTH:
      return containerWidth / pageWidth
    case PDF_CONFIG.fitModes.PAGE_FIT:
      const widthScale = containerWidth / pageWidth
      const heightScale = containerHeight / pageHeight
      return Math.min(widthScale, heightScale)
    case PDF_CONFIG.fitModes.AUTO:
    default:
      // Auto mode: fit width if page is wider than tall, otherwise fit page
      const aspectRatio = pageWidth / pageHeight
      if (aspectRatio > 1) {
        return containerWidth / pageWidth
      } else {
        const widthScale = containerWidth / pageWidth
        const heightScale = containerHeight / pageHeight
        return Math.min(widthScale, heightScale)
      }
  }
}

// Error messages for PDF operations
export const PDF_ERRORS = {
  LOADING_FAILED: 'Failed to load PDF document',
  RENDERING_FAILED: 'Failed to render PDF page',
  INVALID_PAGE_NUMBER: 'Invalid page number',
  WORKER_FAILED: 'Failed to initialize PDF worker',
  NETWORK_ERROR: 'Network error while loading PDF',
  INVALID_PDF: 'Invalid or corrupted PDF file',
  ACCESS_DENIED: 'Access denied to PDF file',
  NOT_FOUND: 'PDF file not found',
} as const