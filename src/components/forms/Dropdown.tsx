'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  label?: string
  options: DropdownOption[]
  error?: string
  helperText?: string
}

export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, options, error, helperText, id, className, ...props }, ref) => {
    const fallbackId = `dropdown-${Math.random().toString(36).slice(2, 11)}`
    const selectId = id || (label ? `dropdown-${label.replace(/\s+/g, '-').toLowerCase()}` : fallbackId)
    const errorId = `${selectId}-error`
    const helperId = `${selectId}-helper`

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', className)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-label text-primary"
          >
            {label} {props.required && <span className="text-error" aria-hidden="true">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            aria-describedby={
              cn(error && errorId, helperText && !error && helperId) || undefined
            }
            className={cn(
              'w-full h-10 px-3 pr-10 rounded-md bg-surface border text-body text-primary appearance-none',
              'transition-all duration-base outline-none',
              error
                ? 'border-error focus:ring-2 focus:ring-error focus:border-error'
                : 'border-border focus:border-brand focus:ring-2 focus:ring-brand'
            )}
            {...props}
          >
            <option value="" disabled hidden>
              Select an option
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-tertiary">
            <ChevronDown size={16} />
          </div>
        </div>

        {error && (
          <p id={errorId} className="text-caption text-error">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={helperId} className="text-caption text-secondary">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Dropdown.displayName = 'Dropdown'
