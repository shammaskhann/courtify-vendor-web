import { Skeleton } from '../ui/Skeleton'
import type { CourtUtilization as CourtUtilizationType } from '@/types/models'
import { cn } from '@/lib/utils'

interface CourtUtilizationProps {
  data?: CourtUtilizationType[]
  isLoading?: boolean
}

export function CourtUtilization({ data, isLoading = false }: CourtUtilizationProps) {
  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Sort by utilization rate descending and take top 6
  const topCourts = [...(data || [])]
    .sort((a, b) => b.utilizationRate - a.utilizationRate)
    .slice(0, 6)

  const getProgressColor = (rate: number) => {
    if (rate >= 0.8) return 'bg-success-text'
    if (rate >= 0.5) return 'bg-brand'
    return 'bg-warning-text'
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col">
      <h3 className="text-h4 font-semibold text-primary mb-6">Court Utilization (Top 6)</h3>
      
      {topCourts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-secondary text-sm">
          No data available
        </div>
      ) : (
        <div className="space-y-5">
          {topCourts.map((court) => (
            <div key={court.courtId}>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-body-sm font-medium text-primary">{court.courtName}</p>
                  <p className="text-caption text-secondary">{court.venueName}</p>
                </div>
                <div className="text-right">
                  <p className="text-body-sm font-bold text-primary">
                    {Math.round(court.utilizationRate * 100)}%
                  </p>
                  <p className="text-caption text-secondary">
                    {court.totalBookings} bookings
                  </p>
                </div>
              </div>
              <div className="w-full h-2 bg-surface-variant rounded-pill overflow-hidden">
                <div
                  className={cn('h-full rounded-pill transition-all duration-500', getProgressColor(court.utilizationRate))}
                  style={{ width: `${Math.round(court.utilizationRate * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
