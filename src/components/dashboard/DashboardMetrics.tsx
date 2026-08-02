import { StatCard } from '../ui/StatCard'
import { Banknote, CalendarCheck, Activity, Users } from 'lucide-react'
import type { AnalyticsSummary } from '@/types/models'

interface DashboardMetricsProps {
  data?: AnalyticsSummary
  isLoading?: boolean
}

export function DashboardMetrics({ data, isLoading = false }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Revenue"
        value={isLoading ? '-' : `PKR ${(data?.summary?.total_revenue || 0).toLocaleString()}`}
        icon={Banknote}
        variant="primary"
        isLoading={isLoading}
        trend={{ value: 12.5, direction: 'up' }}
      />
      <StatCard
        label="Total Bookings"
        value={isLoading ? '-' : (data?.summary?.total_bookings || 0).toLocaleString()}
        icon={CalendarCheck}
        variant="success"
        isLoading={isLoading}
        trend={{ value: 8.2, direction: 'up' }}
      />
      <StatCard
        label="Occupancy Rate"
        value={isLoading ? '-' : `${Math.round((data?.summary?.occupancy_rate || 0))}%`}
        icon={Activity}
        variant="warning"
        isLoading={isLoading}
        trend={{ value: 2.1, direction: 'down' }}
      />
      <StatCard
        label="Active Customers"
        value={isLoading ? '-' : '142'} // Hardcoded for mockup as per prompt not having it
        icon={Users}
        variant="default"
        isLoading={isLoading}
        trend={{ value: 5.4, direction: 'up' }}
      />
    </div>
  )
}
