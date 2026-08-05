import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusMap: Record<string, { label: string; className: string }> = {
  // Booking Statuses
  PENDING: { label: 'Pending', className: 'bg-warning-bg text-warning-text' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-info-bg text-info-text' },
  COMPLETED: { label: 'Completed', className: 'bg-success-bg text-success-text' },
  REJECTED: { label: 'Rejected', className: 'bg-error-bg text-error-text' },
  CANCELLED: { label: 'Cancelled', className: 'bg-surface-variant text-secondary' },
  
  // Payment Statuses
  PAID: { label: 'Paid', className: 'bg-success-bg text-success-text' },
  REFUNDED: { label: 'Refunded', className: 'bg-surface-variant text-secondary' },
  FAILED: { label: 'Failed', className: 'bg-error-bg text-error-text' },
  
  // General Statuses
  ACTIVE: { label: 'Active', className: 'bg-success-bg text-success-text' },
  INACTIVE: { label: 'Inactive', className: 'bg-surface-variant text-secondary' },
  DRAFT: { label: 'Draft', className: 'bg-warning-bg text-warning-text' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = (status || '').toUpperCase()
  const config = statusMap[normalizedStatus] || {
    label: status,
    className: 'bg-surface-variant text-primary',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-pill text-caption font-semibold whitespace-nowrap',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
