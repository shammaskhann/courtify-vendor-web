'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useTheme } from '@/hooks/useTheme'

interface LogoProps {
  variant?: 'full' | 'mark'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

const sizeMap = {
  sm: { full: { width: 100, height: 28 }, mark: { width: 28, height: 28 } },
  md: { full: { width: 130, height: 36 }, mark: { width: 36, height: 36 } },
  lg: { full: { width: 160, height: 44 }, mark: { width: 44, height: 44 } },
}

export function Logo({
  variant = 'full',
  size = 'md',
  href = ROUTES.DASHBOARD,
  className,
}: LogoProps) {
  const { isDark, mounted } = useTheme()
  const dimensions = sizeMap[size][variant]

  // Use a neutral placeholder during SSR to avoid hydration mismatch.
  // Once mounted on the client, switch to the correct theme-aware logo.
  const logoSrc = !mounted ? '/logo.png' : isDark ? '/logo-dark.png' : '/logo.png'

  const content = (
    <div
      style={{ width: dimensions.width, height: dimensions.height }}
      className={cn('select-none relative flex items-center justify-center', className)}
    >
      <Image
        src={logoSrc}
        alt="Courtify Logo"
        fill
        className={cn('object-contain', variant === 'mark' && 'object-left')}
        priority
      />
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm"
        aria-label="Courtify — Go to Dashboard"
      >
        {content}
      </Link>
    )
  }

  return content
}
