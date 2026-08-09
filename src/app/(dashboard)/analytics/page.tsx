'use client'

import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { BookingStatusChart } from '@/components/dashboard/BookingStatusChart'
import { CourtUtilization } from '@/components/dashboard/CourtUtilization'
import { RevenueByVenue } from '@/components/dashboard/RevenueByVenue'
import { Dropdown } from '@/components/forms/Dropdown'
import { Skeleton } from '@/components/ui/Skeleton'
import { getBookings } from '@/lib/api/bookingApi'
import { getCourts } from '@/lib/api/courtApi'
import { getVenues } from '@/lib/api/venueApi'
import {
  deriveBookingBreakdown,
  deriveCourtUtilization,
  deriveCustomerCount,
  deriveRevenue,
  deriveRevenueByVenue,
  deriveRevenueSeries,
  deriveTrend,
  filterBookingsByPeriod,
  getPeriodBounds,
  getPreviousPeriod,
  type TimeRange,
} from '@/lib/analytics-derive'
import type { Booking, Court, Venue } from '@/types/models'

const TIME_RANGE_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'week' },
  { label: 'Last 30 Days', value: 'month' },
  { label: 'Last 90 Days', value: 'quarter' },
]

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('month')

  // Fetched once — switching range re-derives locally rather than re-querying.
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [bookingsRes, courtsRes, venuesRes] = await Promise.all([
          getBookings({ pageSize: 1000 }),
          getCourts({ pageSize: 200 }),
          getVenues({ pageSize: 100 }),
        ])

        if (!isMounted) return
        setBookings(bookingsRes.data)
        setCourts(courtsRes.data)
        setVenues(venuesRes.data)
      } catch (err) {
        if (isMounted) setError((err as Error).message || 'Failed to load analytics')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [])

  const analytics = useMemo(() => {
    const period = getPeriodBounds(timeRange)
    const previousPeriod = getPreviousPeriod(timeRange, period)

    const current = filterBookingsByPeriod(bookings, period)
    const previous = filterBookingsByPeriod(bookings, previousPeriod)

    const utilization = deriveCourtUtilization(current, courts, venues, period)
    const previousUtilization = deriveCourtUtilization(previous, courts, venues, previousPeriod)

    const averageOccupancy = (rows: typeof utilization) =>
      rows.length === 0 ? 0 : (rows.reduce((sum, row) => sum + row.utilizationRate, 0) / rows.length) * 100

    const revenue = deriveRevenue(current)
    const previousRevenue = deriveRevenue(previous)
    const occupancy = averageOccupancy(utilization)
    const customers = deriveCustomerCount(current)

    return {
      summary: {
        summary: {
          total_courts: courts.length,
          total_bookings: current.length,
          total_revenue: revenue,
          occupancy_rate: occupancy,
        },
        revenue_overview: deriveRevenueSeries(current, period),
        recent_bookings: [],
      },
      breakdown: deriveBookingBreakdown(current),
      utilization,
      revenueByVenue: deriveRevenueByVenue(current, venues),
      customers,
      trends: {
        revenue: deriveTrend(revenue, previousRevenue),
        bookings: deriveTrend(current.length, previous.length),
        occupancy: deriveTrend(occupancy, averageOccupancy(previousUtilization)),
        customers: deriveTrend(customers, deriveCustomerCount(previous)),
      },
    }
  }, [bookings, courts, venues, timeRange])

  const header = (
    <PageHeader
      title="Analytics & Reports"
      subtitle="Detailed insights into your business performance and customer trends."
      actions={
        <div className="w-44">
          <Dropdown
            options={TIME_RANGE_OPTIONS}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          />
        </div>
      }
    />
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 h-full pb-8">
        {header}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      {header}

      {error && (
        <div className="bg-error-bg text-error-text p-4 rounded-lg border border-error/20">
          {error}
        </div>
      )}

      <DashboardMetrics
        data={analytics.summary}
        trends={analytics.trends}
        activeCustomers={analytics.customers}
      />

      <RevenueChart data={analytics.summary.revenue_overview} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingStatusChart data={analytics.breakdown} />
        <CourtUtilization data={analytics.utilization} />
      </div>

      <RevenueByVenue data={analytics.revenueByVenue} />
    </div>
  )
}
