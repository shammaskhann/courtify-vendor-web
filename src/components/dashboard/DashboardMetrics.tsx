import { StatCard } from '../ui/StatCard'
import { Banknote, CalendarCheck, Activity, Users, Layers } from 'lucide-react'
import type { AnalyticsSummary } from '@/types/models'
import type { Trend } from '@/lib/analytics-derive'

export interface DashboardTrends {
  revenue?: Trend
  bookings?: Trend
  occupancy?: Trend
  customers?: Trend
}

interface DashboardMetricsProps {
  data?: AnalyticsSummary
  isLoading?: boolean
  /** Real period-over-period changes. Omitted callers simply show no trend line. */
  trends?: DashboardTrends
  /** Distinct customers in the period. Omit when the caller can't count them. */
  activeCustomers?: number
}

export function DashboardMetrics({
  data,
  isLoading = false,
  trends,
  activeCustomers,
}: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Revenue"
        value={isLoading ? '-' : `PKR ${(data?.summary?.total_revenue || 0).toLocaleString()}`}
        icon={Banknote}
        variant="primary"
        isLoading={isLoading}
        trend={trends?.revenue}
      />
      <StatCard
        label="Total Bookings"
        value={isLoading ? '-' : (data?.summary?.total_bookings || 0).toLocaleString()}
        icon={CalendarCheck}
        variant="success"
        isLoading={isLoading}
        trend={trends?.bookings}
      />
      <StatCard
        label="Occupancy Rate"
        value={isLoading ? '-' : `${Math.round(data?.summary?.occupancy_rate || 0)}%`}
        icon={Activity}
        variant="warning"
        isLoading={isLoading}
        trend={trends?.occupancy}
      />
      {/* Callers that can count customers show them; the rest fall back to a real
          figure the summary endpoint always returns rather than a placeholder. */}
      {activeCustomers === undefined ? (
        <StatCard
          label="Total Courts"
          value={isLoading ? '-' : (data?.summary?.total_courts || 0).toLocaleString()}
          icon={Layers}
          variant="default"
          isLoading={isLoading}
        />
      ) : (
        <StatCard
          label="Active Customers"
          value={isLoading ? '-' : activeCustomers.toLocaleString()}
          icon={Users}
          variant="default"
          isLoading={isLoading}
          trend={trends?.customers}
        />
      )}
    </div>
  )
}
