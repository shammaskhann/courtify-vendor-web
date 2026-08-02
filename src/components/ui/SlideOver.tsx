import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface SlideOverProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: 'md' | 'lg' | 'xl'
}

export function SlideOver({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'md',
}: SlideOverProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-[#0A0A0A]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div 
          className={cn(
            'w-screen transform transition-transform duration-500 ease-in-out flex flex-col bg-surface shadow-xl border-l border-border',
            widthClasses[width]
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
            <div>
              <h2 className="text-h4 font-semibold text-primary">{title}</h2>
              {subtitle && <p className="text-body-sm text-secondary mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-tertiary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md p-1 ml-4 shrink-0"
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-6 border-t border-border bg-surface-variant shrink-0 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
