import { cn } from '@/lib/utils'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 min-h-[300px]',
        'bg-error-bg/50 border border-error/20 rounded-xl',
        className
      )}
    >
      <div className="h-16 w-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-h4 font-semibold text-error mb-2">{title}</h3>
      <p className="text-body text-error-text max-w-sm mb-6">{message}</p>
      
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="border-error/30 text-error hover:bg-error/10 hover:border-error/50">
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}
