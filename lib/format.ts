import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMM dd, yyyy')
}

/**
 * Format date to include time
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMM dd, yyyy at h:mm a')
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Truncate filename with ellipsis
 */
export function truncateFilename(filename: string, maxLength: number = 30): string {
  if (filename.length <= maxLength) return filename
  
  const extension = filename.split('.').pop()
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'))
  
  if (extension && nameWithoutExt.length > maxLength - extension.length - 4) {
    const truncated = nameWithoutExt.substring(0, maxLength - extension.length - 4)
    return `${truncated}...${extension}`
  }
  
  return filename.substring(0, maxLength - 3) + '...'
}

/**
 * Calculate storage percentage used
 */
export function calculateStoragePercentage(used: number, limit: number = 1024 * 1024 * 1024): number {
  return Math.min((used / limit) * 100, 100)
}

/**
 * Format date with smart relative time
 */
export function formatSmartDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isToday(dateObj)) {
    return format(dateObj, 'h:mm a')
  } else if (isYesterday(dateObj)) {
    return 'Yesterday'
  } else {
    const distance = formatDistanceToNow(dateObj, { addSuffix: true })
    // If more than a week ago, show actual date
    const daysAgo = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24))
    if (daysAgo > 7) {
      return format(dateObj, 'MMM d, yyyy')
    }
    return distance
  }
}

/**
 * Format upload progress percentage
 */
export function formatProgress(progress: number): string {
  return Math.round(progress).toString() + '%'
}

/**
 * Generate embed iframe code for a PDF
 */
export function generateEmbedCode(pdfId: string, options: {
  width?: number
  height?: number
  responsive?: boolean
} = {}): string {
  const { width = 800, height = 600, responsive = true } = options
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000'
  
  if (responsive) {
    return `<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%;">
  <iframe 
    src="${baseUrl}/embed/${pdfId}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    title="PDF Viewer">
  </iframe>
</div>`
  }
  
  return `<iframe 
  src="${baseUrl}/embed/${pdfId}"
  width="${width}"
  height="${height}"
  style="border: none;"
  title="PDF Viewer">
</iframe>`
}

/**
 * Validate file type for PDF uploads
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected' }
  }
  
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' }
  }
  
  // 50MB limit
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' }
  }
  
  return { valid: true }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'absolute'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    }
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

/**
 * Format storage usage with status
 */
export function formatStorageUsage(used: number, total: number): {
  used: string
  total: string
  percentage: number
  status: 'low' | 'medium' | 'high' | 'critical'
} {
  const percentage = (used / total) * 100
  let status: 'low' | 'medium' | 'high' | 'critical' = 'low'
  
  if (percentage >= 90) status = 'critical'
  else if (percentage >= 75) status = 'high'
  else if (percentage >= 50) status = 'medium'
  
  return {
    used: formatFileSize(used),
    total: formatFileSize(total),
    percentage: Math.round(percentage),
    status
  }
}