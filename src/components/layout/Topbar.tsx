'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { cn } from '@/lib/utils'

interface TopbarProps {
  onMenuToggle?: () => void
  pageTitle?: string
  className?: string
}

export function Topbar({ onMenuToggle, pageTitle, className }: TopbarProps) {
  return (
    <header
      className={cn(
        'h-topbar flex items-center gap-4 px-6',
        'bg-surface border-b border-border',
        'sticky top-0 z-40',
        className
      )}
    >
      {/* Mobile menu toggle */}
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className={cn(
            'lg:hidden inline-flex items-center justify-center',
            'h-10 w-10 rounded-md text-secondary hover:text-primary hover:bg-surface-variant',
            'transition-all duration-base',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
          )}
          aria-label="Open navigation menu"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
      )}

      {/* Page title */}
      {pageTitle && (
        <h1 className="text-h4 font-semibold text-primary hidden lg:block">
          {pageTitle}
        </h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search venues, courts, bookings..."
            className={cn(
              'w-64 h-9 pl-9 pr-4',
              'bg-surface-variant border border-border rounded-lg',
              'text-body text-primary placeholder:text-tertiary',
              'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
              'transition-all duration-base',
              'xl:w-80'
            )}
            aria-label="Search"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <ThemeToggle variant="icon" />

        {/* Notifications */}
        <button
          className={cn(
            'relative inline-flex items-center justify-center',
            'h-10 w-10 rounded-md text-secondary hover:text-primary hover:bg-surface-variant',
            'transition-all duration-base',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
          )}
          aria-label="Notifications — 3 unread"
        >
          <Bell size={18} aria-hidden="true" />
          {/* Unread badge */}
          <span
            className="absolute top-2 right-2 h-2 w-2 rounded-full bg-error"
            aria-hidden="true"
          />
        </button>

        {/* Profile */}
        <button
          className={cn(
            'inline-flex items-center gap-2 pl-2 pr-3 h-10 rounded-lg',
            'hover:bg-surface-variant transition-all duration-base',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
          )}
          aria-label="Open profile menu"
          aria-haspopup="true"
        >
          {/* Avatar placeholder */}
          <div className="h-7 w-7 rounded-full bg-brand flex items-center justify-center shrink-0">
            <span className="text-caption font-bold text-[#1C1C1E]" aria-hidden="true">
              VA
            </span>
          </div>
          <span className="hidden xl:block text-body-sm font-medium text-primary">
            Vendor Admin
          </span>
        </button>
      </div>
    </header>
  )
}
