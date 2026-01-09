"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileText,
  Eye,
  CheckCircle,
  Trash2,
  MoreVertical,
  ExternalLink,
  Calendar,
  HardDrive
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface PdfFile {
  id: string
  filename: string
  originalName: string
  uploadDate: Date
  fileSize: number
  isSelected: boolean
  isPublished: boolean
}

interface PdfCardProps {
  pdf: PdfFile
  onView: (pdf: PdfFile) => void
  onSelect: (pdf: PdfFile) => void
  onDelete: (pdf: PdfFile) => void
  className?: string
}

export function PdfCard({ 
  pdf, 
  onView, 
  onSelect, 
  onDelete,
  className 
}: PdfCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const handleAction = async (action: () => void) => {
    setIsLoading(true)
    try {
      await action()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200",
      pdf.isSelected && "ring-2 ring-[#8B3A3A] ring-opacity-50 bg-red-50",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
              pdf.isSelected ? "bg-[#8B3A3A]" : "bg-blue-500"
            )}>
              <FileText className="h-5 w-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-sm">
                {pdf.originalName}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {pdf.filename}
              </p>
              
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(pdf.uploadDate)}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <HardDrive className="h-3 w-3" />
                  <span>{formatFileSize(pdf.fileSize)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {pdf.isPublished && (
              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                Published
              </Badge>
            )}
            {pdf.isSelected && !pdf.isPublished && (
              <Badge variant="default" className="bg-[#8B3A3A] text-xs">
                Selected
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isLoading}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => handleAction(() => onView(pdf))}
                  className="cursor-pointer"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View PDF
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleAction(() => onSelect(pdf))}
                  className="cursor-pointer"
                  disabled={pdf.isSelected}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {pdf.isSelected ? 'Already Selected' : 'Select for Display'}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleAction(() => onDelete(pdf))}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction(() => onView(pdf))}
              disabled={isLoading}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            
            <Button
              variant={pdf.isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleAction(() => onSelect(pdf))}
              disabled={isLoading || pdf.isSelected}
              className={cn(
                "text-xs",
                pdf.isSelected 
                  ? "bg-[#8B3A3A] hover:bg-[#7A3333]" 
                  : "hover:bg-[#8B3A3A] hover:text-white"
              )}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {pdf.isSelected ? 'Selected' : 'Select'}
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction(() => onDelete(pdf))}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}