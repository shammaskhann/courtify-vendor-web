'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { Skeleton } from '../ui/Skeleton'
import type { AnalyticsSummary } from '@/types/models'
import { Button } from '../ui/Button'
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react'

interface RevenueChartProps {
  data?: AnalyticsSummary['revenue_overview']
  isLoading?: boolean
}

export function RevenueChart({ data, isLoading = false }: RevenueChartProps) {
  const [chartType, setChartType] = React.useState<'bar' | 'line'>('bar')

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4 h-[400px]">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="flex-1 w-full" />
      </div>
    )
  }

  // Format date for x-axis (e.g., "Jul 15")
  const formattedData = data?.map((item) => {
    const d = new Date(item.date)
    return {
      ...item,
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
  }) || []

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-md text-sm">
          <p className="font-semibold text-primary mb-1">{label}</p>
          <p className="text-brand font-medium">
            Revenue: PKR {payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-h4 font-semibold text-primary">Revenue Trend</h3>
        <div className="flex gap-2">
          <Button
            variant={chartType === 'bar' ? 'primary' : 'ghost'}
            size="sm"
            className="px-2 h-8"
            onClick={() => setChartType('bar')}
          >
            <BarChart3 size={16} />
          </Button>
          <Button
            variant={chartType === 'line' ? 'primary' : 'ghost'}
            size="sm"
            className="px-2 h-8"
            onClick={() => setChartType('line')}
          >
            <LineChartIcon size={16} />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} tickFormatter={(val) => `PKR ${(val / 1000)}k`} />
              <YAxis yAxisId="right" orientation="right" hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-variant)' }} />
              <Bar yAxisId="left" dataKey="amount" fill="var(--color-brand)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          ) : (
            <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} tickFormatter={(val) => `PKR ${(val / 1000)}k`} />
              <YAxis yAxisId="right" orientation="right" hide />
              <Tooltip content={<CustomTooltip />} />
              <Line yAxisId="left" type="monotone" dataKey="amount" stroke="var(--color-brand)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: 'var(--color-brand)', stroke: 'var(--color-surface)' }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
