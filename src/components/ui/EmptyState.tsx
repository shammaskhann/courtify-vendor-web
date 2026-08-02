import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 min-h-[300px]',
        'bg-surface border border-border border-dashed rounded-xl',
        className
      )}
    >
      <div className="h-16 w-16 bg-brand/10 rounded-full flex items-center justify-center mb-6">
        <Icon size={32} className="text-[#1C1C1E]" />
      </div>
      <h3 className="text-h4 font-semibold text-primary mb-2">{title}</h3>
      <p className="text-body text-secondary max-w-sm mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
