import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'brand' | 'current' | 'white'
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-[1.5px]',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[2.5px]',
  xl: 'h-12 w-12 border-[3px]',
}

const colorClasses = {
  brand: 'border-brand/30 border-t-brand',
  current: 'border-current/30 border-t-current',
  white: 'border-white/30 border-t-white',
}

export function LoadingSpinner({
  size = 'md',
  color = 'brand',
  className,
  label = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-block', className)}
    >
      <span
        className={cn(
          'block rounded-full animate-spin',
          sizeClasses[size],
          colorClasses[color]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
