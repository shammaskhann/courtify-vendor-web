import { Skeleton } from '../ui/Skeleton'
import type { RevenueByVenue as RevenueByVenueType } from '@/types/models'

interface RevenueByVenueProps {
  data?: RevenueByVenueType[]
  isLoading?: boolean
}

export function RevenueByVenue({ data, isLoading = false }: RevenueByVenueProps) {
  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-4 mt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const venues = data || []
  const highest = venues.reduce((max, venue) => Math.max(max, venue.revenue), 0)

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col">
      <h3 className="text-h4 font-semibold text-primary mb-6">Revenue by Venue</h3>

      {venues.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-secondary text-sm py-8">
          No revenue recorded in this period
        </div>
      ) : (
        <div className="space-y-5">
          {venues.map((venue) => (
            <div key={venue.venueId}>
              <div className="flex justify-between items-end mb-2 gap-4">
                <p className="text-body-sm font-medium text-primary truncate">{venue.venueName}</p>
                <div className="text-right shrink-0">
                  <p className="text-body-sm font-bold text-primary">
                    PKR {venue.revenue.toLocaleString()}
                  </p>
                  <p className="text-caption text-secondary">{venue.bookingCount} bookings</p>
                </div>
              </div>
              <div className="w-full h-2 bg-surface-variant rounded-pill overflow-hidden">
                <div
                  className="h-full rounded-pill bg-brand transition-all duration-500"
                  style={{ width: `${highest > 0 ? Math.round((venue.revenue / highest) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
