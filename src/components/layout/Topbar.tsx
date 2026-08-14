'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Menu, LogOut, Settings, KeyRound } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

interface TopbarProps {
  onMenuToggle?: () => void
  pageTitle?: string
  className?: string
}

export function Topbar({ onMenuToggle, pageTitle, className }: TopbarProps) {
  const { user, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const userName = user?.name || user?.businessName || 'Vendor Admin'
  const userInitials = userName.substring(0, 2).toUpperCase()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen])

  return (
    <header
      className={cn(
        'h-topbar flex items-center gap-4 px-6',
        'bg-transparent',
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
          aria-label="Notifications"
        >
          <Bell size={18} aria-hidden="true" />
          {/* Unread badge */}
          <span
            className="absolute top-2 right-2 h-2 w-2 rounded-full bg-error"
            aria-hidden="true"
          />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              'inline-flex items-center gap-2 pl-2 pr-3 h-10 rounded-lg',
              'hover:bg-surface-variant transition-all duration-base',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              isProfileOpen && 'bg-surface-variant'
            )}
            aria-label="Open profile menu"
            aria-haspopup="true"
            aria-expanded={isProfileOpen}
          >
            {/* Avatar placeholder */}
            <div className="h-7 w-7 rounded-full bg-brand flex items-center justify-center shrink-0">
              <span className="text-caption font-bold text-[#1C1C1E]" aria-hidden="true">
                {userInitials}
              </span>
            </div>
            <span className="hidden xl:block text-body-sm font-medium text-primary">
              {userName}
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
              <Link 
                href={ROUTES.SETTINGS} 
                className="flex items-center gap-2 px-4 py-2 text-body-sm text-secondary hover:text-primary hover:bg-surface-variant transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <Settings size={16} />
                Settings
              </Link>
              <Link 
                href={ROUTES.SETTINGS} 
                className="flex items-center gap-2 px-4 py-2 text-body-sm text-secondary hover:text-primary hover:bg-surface-variant transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <KeyRound size={16} />
                Reset Password
              </Link>
              <div className="h-px bg-border my-1" />
              <button
                onClick={() => {
                  setIsProfileOpen(false)
                  logout()
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-body-sm text-error hover:bg-error-bg/50 transition-colors text-left"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
