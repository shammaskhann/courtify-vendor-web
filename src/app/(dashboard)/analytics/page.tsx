'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { getDashboardAnalytics } from '@/lib/api/analyticsApi'
import type { AnalyticsSummary } from '@/types/models'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const summary = await getDashboardAnalytics()
        setData(summary)
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-6 h-full pb-8">
        <PageHeader title="Analytics & Reports" subtitle="Detailed insights into your business performance." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
        <Skeleton className="h-[400px] rounded-xl w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <PageHeader 
        title="Analytics & Reports" 
        subtitle="Detailed insights into your business performance and customer trends." 
      />

      <DashboardMetrics data={data} />

      <div className="flex flex-col h-full w-full">
        <RevenueChart data={data.revenue_overview} />
      </div>

    </div>
  )
}
