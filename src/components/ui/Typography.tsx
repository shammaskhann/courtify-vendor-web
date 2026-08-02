import { cn } from '@/lib/utils'
import type { ReactNode, ElementType } from 'react'

type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'label'
  | 'overline'

type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'disabled'
  | 'brand'
  | 'inverse'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

interface TypographyProps {
  variant?: TypographyVariant
  color?: TypographyColor
  as?: ElementType
  className?: string
  children: ReactNode
}

const variantClasses: Record<TypographyVariant, string> = {
  'display': 'text-display tracking-tight font-bold',
  'h1': 'text-h1 tracking-tight font-bold',
  'h2': 'text-h2 tracking-tight font-semibold',
  'h3': 'text-h3 font-semibold',
  'h4': 'text-h4 font-semibold',
  'body-lg': 'text-body-lg font-normal',
  'body': 'text-body font-normal',
  'body-sm': 'text-body-sm font-normal',
  'caption': 'text-caption font-normal',
  'label': 'text-label font-semibold uppercase tracking-wider',
  'overline': 'text-overline font-semibold uppercase tracking-widest',
}

const colorClasses: Record<TypographyColor, string> = {
  'primary': 'text-primary',
  'secondary': 'text-secondary',
  'tertiary': 'text-tertiary',
  'disabled': 'text-disabled',
  'brand': 'text-brand',
  'inverse': 'text-inverse',
  'success': 'text-success',
  'warning': 'text-warning',
  'error': 'text-error',
  'info': 'text-info',
}

const defaultElements: Record<TypographyVariant, ElementType> = {
  'display': 'h1',
  'h1': 'h1',
  'h2': 'h2',
  'h3': 'h3',
  'h4': 'h4',
  'body-lg': 'p',
  'body': 'p',
  'body-sm': 'p',
  'caption': 'span',
  'label': 'span',
  'overline': 'span',
}

export function Typography({
  variant = 'body',
  color = 'primary',
  as,
  className,
  children,
}: TypographyProps) {
  const Component = as ?? defaultElements[variant]

  return (
    <Component
      className={cn(
        variantClasses[variant],
        colorClasses[color],
        className
      )}
    >
      {children}
    </Component>
  )
}
