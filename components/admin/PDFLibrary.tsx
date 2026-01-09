'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Grid3X3, List, SortAsc, SortDesc, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PDF } from '@/hooks/usePDFs'
import { PDFGrid } from './PDFCard'
import { DeleteDialog } from './DeleteDialog'
import { EmbedCodeModal } from './EmbedCodeModal'

interface PDFLibraryProps {
  pdfs: PDF[]
  isLoading?: boolean
  onRefresh?: () => void
  onView?: (pdf: PDF) => void
  onSelect?: (pdf: PDF) => Promise<boolean>
  onDeselect?: (pdf: PDF) => Promise<boolean>
  onDelete?: (pdf: PDF) => Promise<boolean>
  onDownload?: (pdf: PDF) => void
  className?: string
}

type SortField = 'name' | 'size' | 'date' | 'views'
type SortOrder = 'asc' | 'desc'
type ViewMode = 'grid' | 'list'

interface LibraryFilters {
  search: string
  sortField: SortField
  sortOrder: SortOrder
  selectedFilter: 'all' | 'selected' | 'unselected'
}

const ITEMS_PER_PAGE = 12

export function PDFLibrary({
  pdfs,
  isLoading = false,
  onRefresh,
  onView,
  onSelect,
  onDeselect,
  onDelete,
  onDownload,
  className
}: PDFLibraryProps) {
  const [filters, setFilters] = useState<LibraryFilters>({
    search: '',
    sortField: 'date',
    sortOrder: 'desc',
    selectedFilter: 'all'
  })
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectingIds, setSelectingIds] = useState<string[]>([])
  const [deleteDialogPdf, setDeleteDialogPdf] = useState<PDF | null>(null)
  const [embedModalPdf, setEmbedModalPdf] = useState<PDF | null>(null)

  // Filter and sort PDFs
  const filteredAndSortedPDFs = useMemo(() => {
    let result = [...pdfs]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(pdf => 
        pdf.originalName.toLowerCase().includes(searchLower) ||
        pdf.filename.toLowerCase().includes(searchLower)
      )
    }

    // Apply selection filter
    if (filters.selectedFilter === 'selected') {
      result = result.filter(pdf => pdf.selected)
    } else if (filters.selectedFilter === 'unselected') {
      result = result.filter(pdf => !pdf.selected)
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortField) {
        case 'name':
          comparison = a.originalName.localeCompare(b.originalName)
          break
        case 'size':
          comparison = a.fileSize - b.fileSize
          break
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
        case 'views':
          comparison = a.viewCount - b.viewCount
          break
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [pdfs, filters])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPDFs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedPDFs = filteredAndSortedPDFs.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset pagination when filters change
  const updateFilters = (newFilters: Partial<LibraryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  const handleSelect = async (pdf: PDF) => {
    if (!onSelect) return
    
    setSelectingIds(prev => [...prev, pdf.id])
    try {
      await onSelect(pdf)
    } finally {
      setSelectingIds(prev => prev.filter(id => id !== pdf.id))
    }
  }

  const handleDeselect = async (pdf: PDF) => {
    if (!onDeselect) return
    
    setSelectingIds(prev => [...prev, pdf.id])
    try {
      await onDeselect(pdf)
    } finally {
      setSelectingIds(prev => prev.filter(id => id !== pdf.id))
    }
  }

  const handleDelete = async (pdf: PDF) => {
    if (!onDelete) return false
    
    try {
      const success = await onDelete(pdf)
      if (success) {
        setDeleteDialogPdf(null)
      }
      return success
    } catch (error) {
      return false
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      sortField: 'date',
      sortOrder: 'desc',
      selectedFilter: 'all'
    })
    setCurrentPage(1)
  }

  const getSortIcon = (field: SortField) => {
    if (filters.sortField === field) {
      return filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
    }
    return null
  }

  if (isLoading) {
    return <LibrarySkeleton />
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">PDF Library</CardTitle>
            <div className="flex items-center space-x-2">
              {onRefresh && (
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters and Search */}
          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search PDFs by name..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-wrap gap-2 flex-1">
                {/* Selection filter */}
                <Select
                  value={filters.selectedFilter}
                  onValueChange={(value) => updateFilters({ 
                    selectedFilter: value as LibraryFilters['selectedFilter'] 
                  })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All PDFs</SelectItem>
                    <SelectItem value="selected">Published</SelectItem>
                    <SelectItem value="unselected">Unpublished</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort field */}
                <Select
                  value={filters.sortField}
                  onValueChange={(value) => updateFilters({ 
                    sortField: value as SortField 
                  })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort order */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ 
                    sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                  })}
                  className="flex items-center space-x-1"
                >
                  {getSortIcon(filters.sortField)}
                  <span>{filters.sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
                </Button>

                {/* Clear filters */}
                {(filters.search || filters.selectedFilter !== 'all' || 
                  filters.sortField !== 'date' || filters.sortOrder !== 'desc') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear filters
                  </Button>
                )}
              </div>

              {/* View mode toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                {filteredAndSortedPDFs.length} of {pdfs.length} PDFs
              </span>
              {filteredAndSortedPDFs.length !== pdfs.length && (
                <Badge variant="secondary" className="text-xs">
                  Filtered
                </Badge>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>

          {/* PDF Grid */}
          <PDFGrid
            pdfs={paginatedPDFs}
            onView={onView}
            onSelect={handleSelect}
            onDeselect={handleDeselect}
            onDelete={(pdf) => setDeleteDialogPdf(pdf)}
            onDownload={onDownload}
            onShowEmbed={(pdf) => setEmbedModalPdf(pdf)}
            selectingIds={selectingIds}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      {deleteDialogPdf && (
        <DeleteDialog
          pdf={deleteDialogPdf}
          onDelete={handleDelete}
          open={!!deleteDialogPdf}
          onOpenChange={(open) => !open && setDeleteDialogPdf(null)}
        />
      )}

      {/* Embed Code Modal */}
      {embedModalPdf && (
        <EmbedCodeModal
          pdf={embedModalPdf}
          open={!!embedModalPdf}
          onOpenChange={(open) => !open && setEmbedModalPdf(null)}
        />
      )}
    </div>
  )
}

function LibrarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <div className="flex space-x-1">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}