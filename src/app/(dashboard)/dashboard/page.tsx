'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { RecentBookings } from '@/components/dashboard/RecentBookings'
import { GettingStartedGuide } from '@/components/dashboard/GettingStartedGuide'
import { Dropdown } from '@/components/forms/Dropdown'
import { getDashboardAnalytics } from '@/lib/api/analyticsApi'
import type { AnalyticsSummary } from '@/types/models'

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getDashboardAnalytics({ timeRange: timeRange as any })
        if (isMounted) {
          setData(result)
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load dashboard data')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [timeRange])

  const timeRangeOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
  ]

  // If no data exists at all (e.g., new vendor)
  const isNewVendor = !isLoading && !error && data?.summary?.total_courts === 0

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your sports facilities and bookings."
        actions={
          <div className="w-40">
            <Dropdown
              options={timeRangeOptions}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            />
          </div>
        }
      />

      {error && (
        <div className="bg-error-bg text-error-text p-4 rounded-lg border border-error/20 mb-6">
          {error}
        </div>
      )}

      {isNewVendor ? (
        <GettingStartedGuide />
      ) : (
        <>
          {/* Zone 1: Metrics */}
          <DashboardMetrics data={data || undefined} isLoading={isLoading} />

          {/* Zone 2: Charts */}
          <div className="mb-6">
            <RevenueChart data={data?.revenue_overview} isLoading={isLoading} />
          </div>

          {/* Zone 3: Data Lists */}
          <div>
            <RecentBookings data={data?.recent_bookings} isLoading={isLoading} />
          </div>
        </>
      )}
    </div>
  )
}
