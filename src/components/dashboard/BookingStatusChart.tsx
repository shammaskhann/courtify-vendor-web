'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Skeleton } from '../ui/Skeleton'
import type { BookingBreakdown } from '@/types/models'

interface BookingStatusChartProps {
  data?: BookingBreakdown
  isLoading?: boolean
}

// Map status to semantic colors defined in globals.css
const STATUS_COLORS = {
  confirmed: '#00C7E0', // info
  completed: '#34C759', // success
  pending: '#FF9F0A',   // warning
  cancelled: '#8E8E93', // tertiary
  rejected: '#FF453A',  // error
}

const STATUS_LABELS = {
  confirmed: 'Confirmed',
  completed: 'Completed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

export function BookingStatusChart({ data, isLoading = false }: BookingStatusChartProps) {
  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4 h-[400px]">
        <Skeleton className="h-6 w-40" />
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-48 w-48 rounded-full" />
        </div>
      </div>
    )
  }

  // Convert object to array for Recharts
  const chartData = data
    ? Object.entries(data)
        .map(([key, value]) => ({
          name: STATUS_LABELS[key as keyof BookingBreakdown],
          value,
          color: STATUS_COLORS[key as keyof BookingBreakdown],
        }))
        .filter((item) => item.value > 0)
    : []

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-md flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="text-sm font-medium text-primary">
            {data.name}: <span className="font-bold">{data.value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
      <h3 className="text-h4 font-semibold text-primary mb-2">Booking Status</h3>
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              formatter={(value) => <span className="text-sm text-secondary ml-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-3xl font-bold text-primary">{total}</span>
          <span className="text-xs text-secondary uppercase tracking-wider">Total</span>
        </div>
      </div>
    </div>
  )
}
