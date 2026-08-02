import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand text-[#1C1C1E] font-semibold',
    'hover:bg-brand-hover',
    'active:scale-[0.98]',
    'disabled:bg-surface-variant disabled:text-disabled disabled:cursor-not-allowed',
    'shadow-sm hover:shadow-md',
  ].join(' '),
  secondary: [
    'bg-surface border border-border text-primary font-medium',
    'hover:bg-surface-variant hover:border-border-strong',
    'active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  ghost: [
    'bg-transparent text-primary font-medium',
    'hover:bg-surface-variant',
    'active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  destructive: [
    'bg-error text-white font-semibold',
    'hover:opacity-90',
    'active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'shadow-sm',
  ].join(' '),
  link: [
    'bg-transparent text-brand font-medium underline-offset-4',
    'hover:underline',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-body-sm rounded-md gap-1.5',
  md: 'h-10 px-4 text-body rounded-md gap-2',
  lg: 'h-12 px-6 text-body-lg rounded-lg gap-2.5',
  icon: 'h-10 w-10 rounded-md p-0 flex items-center justify-center',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center',
          'transition-all duration-base',
          'select-none whitespace-nowrap',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinnerInline />
            {children && <span className="ml-2">{children}</span>}
          </>
        ) : (
          <>
            {LeftIcon && <LeftIcon className="shrink-0" size={size === 'sm' ? 14 : 16} />}
            {children}
            {RightIcon && <RightIcon className="shrink-0" size={size === 'sm' ? 14 : 16} />}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

function LoadingSpinnerInline() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
