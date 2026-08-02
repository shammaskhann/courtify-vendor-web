import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  variant?: 'default' | 'primary' | 'success' | 'warning'
  isLoading?: boolean
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  isLoading = false,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className={cn('bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4 animate-pulse', className)}>
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-surface-variant rounded" />
          <div className="h-10 w-10 bg-surface-variant rounded-lg" />
        </div>
        <div className="h-8 w-32 bg-surface-variant rounded mt-2" />
        {trend && <div className="h-4 w-20 bg-surface-variant rounded mt-1" />}
      </div>
    )
  }

  const variantStyles = {
    default: 'bg-surface border-border',
    primary: 'bg-brand/10 border-brand/20',
    success: 'bg-success-bg border-success/20',
    warning: 'bg-warning-bg border-warning/20',
  }

  const iconStyles = {
    default: 'bg-surface-variant text-primary',
    primary: 'bg-brand text-[#1C1C1E]',
    success: 'bg-success/20 text-success-text',
    warning: 'bg-warning/20 text-warning-text',
  }

  return (
    <div
      className={cn(
        'rounded-xl p-6 border shadow-sm flex flex-col',
        'transition-all duration-base hover:shadow-md',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-body-sm font-medium text-secondary">{label}</p>
        <div
          className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
            iconStyles[variant]
          )}
        >
          <Icon size={20} />
        </div>
      </div>
      
      <div className="mt-4 flex flex-col gap-1">
        <h3 className="text-h3 font-semibold text-primary">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1.5 text-caption font-medium">
            <span
              className={cn(
                'flex items-center gap-0.5',
                trend.direction === 'up' ? 'text-success-text' : 'text-error-text'
              )}
            >
              {trend.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend.value}%
            </span>
            <span className="text-tertiary">vs last period</span>
          </div>
        )}
      </div>
    </div>
  )
}
