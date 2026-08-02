import { cn } from '@/lib/utils'

interface PageLoaderProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export function PageLoader({
  message = 'Loading...',
  fullScreen = true,
  className,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullScreen ? 'min-h-screen bg-background' : 'min-h-64 w-full',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* Logo mark with subtle pulse */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring pulse */}
        <div className="absolute h-16 w-16 rounded-full bg-brand/10 animate-ping" />
        {/* Inner brand circle */}
        <div className="relative h-12 w-12 rounded-full bg-brand flex items-center justify-center shadow-md">
          {/* Court icon — simplified racket/court mark */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" stroke="#1C1C1E" strokeWidth="1.5" />
            <line x1="12" y1="3" x2="12" y2="21" stroke="#1C1C1E" strokeWidth="1.5" />
            <line x1="3" y1="12" x2="21" y2="12" stroke="#1C1C1E" strokeWidth="1.5" />
            <line x1="4.5" y1="7" x2="19.5" y2="7" stroke="#1C1C1E" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="4.5" y1="17" x2="19.5" y2="17" stroke="#1C1C1E" strokeWidth="1" strokeOpacity="0.5" />
          </svg>
        </div>
      </div>

      {/* Brand name */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-h4 font-bold text-primary tracking-tight">
          Courtify
        </p>
        <p className="text-body-sm text-secondary">{message}</p>
      </div>

      {/* Loading bar */}
      <div className="w-32 h-1 rounded-pill bg-surface-variant overflow-hidden">
        <div className="h-full w-1/2 bg-brand rounded-pill animate-[shimmer_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  )
}
