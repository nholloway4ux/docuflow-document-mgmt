"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
// import { Calendar } from "@/components/ui/calendar" // Calendar component not available
import {
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  SortAsc,
  SortDesc,
  Grid,
  List
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface SearchFilters {
  query: string
  dateFrom?: Date
  dateTo?: Date
  sizeMin?: number
  sizeMax?: number
  sortBy: 'name' | 'date' | 'size'
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
}

interface PdfSearchProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  resultCount: number
  totalCount: number
}

export function PdfSearch({ 
  filters, 
  onFiltersChange, 
  resultCount, 
  totalCount 
}: PdfSearchProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [dateFromOpen, setDateFromOpen] = useState(false)
  const [dateToOpen, setDateToOpen] = useState(false)

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      query: '',
      sortBy: 'date',
      sortOrder: 'desc',
      viewMode: 'grid'
    })
    setShowFilters(false)
  }

  const hasActiveFilters = 
    filters.query || 
    filters.dateFrom || 
    filters.dateTo || 
    filters.sizeMin || 
    filters.sizeMax

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getFilterCount = () => {
    let count = 0
    if (filters.query) count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.sizeMin || filters.sizeMax) count++
    return count
  }

  return (
    <div className="space-y-4">
      {/* Search Bar and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search PDF files..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              hasActiveFilters && "bg-[#8B3A3A] text-white hover:bg-[#7A3333]"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                {getFilterCount()}
              </Badge>
            )}
          </Button>

          {/* Sort */}
          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder]
              updateFilter('sortBy', sortBy)
              updateFilter('sortOrder', sortOrder)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">
                <div className="flex items-center">
                  <SortDesc className="h-4 w-4 mr-2" />
                  Newest First
                </div>
              </SelectItem>
              <SelectItem value="date-asc">
                <div className="flex items-center">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Oldest First
                </div>
              </SelectItem>
              <SelectItem value="name-asc">
                <div className="flex items-center">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Name A-Z
                </div>
              </SelectItem>
              <SelectItem value="name-desc">
                <div className="flex items-center">
                  <SortDesc className="h-4 w-4 mr-2" />
                  Name Z-A
                </div>
              </SelectItem>
              <SelectItem value="size-desc">
                <div className="flex items-center">
                  <SortDesc className="h-4 w-4 mr-2" />
                  Largest First
                </div>
              </SelectItem>
              <SelectItem value="size-asc">
                <div className="flex items-center">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Smallest First
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex rounded-md overflow-hidden border border-gray-200">
            <Button
              variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateFilter('viewMode', 'grid')}
              className={cn(
                "rounded-none",
                filters.viewMode === 'grid' && "bg-[#8B3A3A] hover:bg-[#7A3333]"
              )}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateFilter('viewMode', 'list')}
              className={cn(
                "rounded-none border-l",
                filters.viewMode === 'list' && "bg-[#8B3A3A] hover:bg-[#7A3333]"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Advanced Filters</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date Range</label>
                <div className="flex space-x-2">
                  <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {filters.dateFrom ? formatDate(filters.dateFrom) : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4">
                      <Input
                        type="date"
                        value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          updateFilter('dateFrom', e.target.value ? new Date(e.target.value) : undefined)
                          setDateFromOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {filters.dateTo ? formatDate(filters.dateTo) : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4">
                      <Input
                        type="date"
                        value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          updateFilter('dateTo', e.target.value ? new Date(e.target.value) : undefined)
                          setDateToOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* File Size Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">File Size (MB)</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.sizeMin || ''}
                    onChange={(e) => updateFilter('sizeMin', e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1"
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.sizeMax || ''}
                    onChange={(e) => updateFilter('sizeMax', e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {resultCount} of {totalCount} PDFs
          {hasActiveFilters && (
            <Badge variant="outline" className="ml-2">
              Filtered
            </Badge>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}