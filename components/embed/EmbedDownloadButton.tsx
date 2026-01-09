'use client'

import React from 'react'
import { Download, Loader2 } from 'lucide-react'

interface EmbedDownloadButtonProps {
  onDownload: () => void
  filename?: string
  disabled?: boolean
  isLoading?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const EmbedDownloadButton: React.FC<EmbedDownloadButtonProps> = ({
  onDownload,
  filename = 'document.pdf',
  disabled = false,
  isLoading = false,
  className = '',
  size = 'lg',
  fullWidth = true,
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-semibold text-white',
    'bg-maroon hover:bg-maroon-dark',
    'border border-maroon hover:border-maroon-dark',
    'focus:outline-none focus:ring-4 focus:ring-maroon/20',
    'active:bg-maroon-darker',
    'transition-all duration-200 ease-in-out',
    'transform hover:scale-105 active:scale-95',
    'shadow-lg hover:shadow-xl',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'disabled:hover:scale-100 disabled:hover:bg-maroon',
  ]

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg', 
    lg: 'px-8 py-4 text-lg rounded-xl',
  }

  const widthClasses = fullWidth ? 'w-full' : ''

  const allClasses = [
    ...baseClasses,
    sizeClasses[size],
    widthClasses,
    className,
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* Custom CSS for maroon colors */}
      <style jsx>{`
        .bg-maroon {
          background-color: #8B3A3A;
        }
        .hover\\:bg-maroon-dark:hover {
          background-color: #722F2F;
        }
        .active\\:bg-maroon-darker:active {
          background-color: #5D2626;
        }
        .border-maroon {
          border-color: #8B3A3A;
        }
        .hover\\:border-maroon-dark:hover {
          border-color: #722F2F;
        }
        .focus\\:ring-maroon\\/20:focus {
          box-shadow: 0 0 0 4px rgba(139, 58, 58, 0.2);
        }
        .disabled\\:hover\\:bg-maroon:disabled:hover {
          background-color: #8B3A3A;
        }
      `}</style>
      
      <button
        onClick={onDownload}
        disabled={disabled || isLoading}
        className={allClasses}
        aria-label={`Download ${filename}`}
        title={`Download ${filename}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            <span>Preparing Download...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-3" />
            <span>Download Church Bulletin</span>
          </>
        )}
      </button>
    </>
  )
}

// Alternative version with Tailwind custom colors (if you prefer to add to tailwind.config.js)
export const EmbedDownloadButtonTailwind: React.FC<EmbedDownloadButtonProps> = ({
  onDownload,
  filename = 'document.pdf',
  disabled = false,
  isLoading = false,
  className = '',
  size = 'lg',
  fullWidth = true,
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-semibold text-white',
    'bg-[#8B3A3A] hover:bg-[#722F2F]',
    'border border-[#8B3A3A] hover:border-[#722F2F]',
    'focus:outline-none focus:ring-4 focus:ring-[#8B3A3A]/20',
    'active:bg-[#5D2626]',
    'transition-all duration-200 ease-in-out',
    'transform hover:scale-105 active:scale-95',
    'shadow-lg hover:shadow-xl',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'disabled:hover:scale-100 disabled:hover:bg-[#8B3A3A]',
  ]

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-xl',
  }

  const widthClasses = fullWidth ? 'w-full' : ''

  const allClasses = [
    ...baseClasses,
    sizeClasses[size],
    widthClasses,
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      onClick={onDownload}
      disabled={disabled || isLoading}
      className={allClasses}
      aria-label={`Download ${filename}`}
      title={`Download ${filename}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          <span>Preparing Download...</span>
        </>
      ) : (
        <>
          <Download className="w-5 h-5 mr-3" />
          <span>Download Church Bulletin</span>
        </>
      )}
    </button>
  )
}