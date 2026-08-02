'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'icon' | 'full'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme, mounted, theme } = useTheme()

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-10 w-10 rounded-md bg-surface-variant animate-pulse',
          className
        )}
        aria-hidden="true"
      />
    )
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={() =>
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
        }
        className={cn(
          'inline-flex items-center justify-center',
          'h-10 w-10 rounded-md',
          'text-secondary hover:text-primary hover:bg-surface-variant',
          'transition-all duration-base',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          className
        )}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {resolvedTheme === 'dark' ? (
          <Sun size={18} aria-hidden="true" />
        ) : (
          <Moon size={18} aria-hidden="true" />
        )}
      </button>
    )
  }

  // Full 3-option variant for Settings page
  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-lg bg-surface-variant',
        className
      )}
      role="radiogroup"
      aria-label="Theme selection"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md',
            'text-body-sm font-medium transition-all duration-base',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            theme === value
              ? 'bg-surface text-primary shadow-sm'
              : 'text-secondary hover:text-primary'
          )}
        >
          <Icon size={14} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}
