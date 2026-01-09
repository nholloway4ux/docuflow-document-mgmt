import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { LucideIcon, FileText, CheckCircle, HardDrive, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    type: 'positive' | 'negative' | 'neutral'
  }
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  isLoading?: boolean
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  isLoading = false,
  className
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  const getTrendColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      case 'neutral':
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {badge && (
            <Badge variant={badge.variant || 'secondary'} className="text-xs">
              {badge.text}
            </Badge>
          )}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          <div className="flex items-center justify-between">
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            
            {trend && (
              <div className={cn('text-xs font-medium flex items-center space-x-1', getTrendColor(trend.type))}>
                <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Pre-built stats card variants for common use cases
interface QuickStatsProps {
  totalPDFs: number
  selectedPDF: string | null
  totalSize: number
  recentUploads: number
  isLoading?: boolean
}

export function QuickStats({ 
  totalPDFs, 
  selectedPDF, 
  totalSize, 
  recentUploads, 
  isLoading = false 
}: QuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total PDFs"
        value={totalPDFs}
        description="Documents uploaded"
        icon={FileText}
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Selected PDF"
        value={selectedPDF || 'None'}
        description="Currently active"
        icon={CheckCircle}
        badge={selectedPDF ? { text: 'Active', variant: 'default' } : { text: 'None', variant: 'secondary' }}
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Storage Used"
        value={`${(totalSize / (1024 * 1024)).toFixed(1)} MB`}
        description="Total file size"
        icon={HardDrive}
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Recent Uploads"
        value={recentUploads}
        description="Last 7 days"
        icon={Upload}
        trend={recentUploads > 0 ? { value: recentUploads * 10, label: 'vs last week', type: 'positive' } : undefined}
        isLoading={isLoading}
      />
    </div>
  )
}