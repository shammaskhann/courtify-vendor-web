'use client'

import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, type = 'text', id, className, maxLength, ...props }, ref) => {
    const fallbackId = `input-${Math.random().toString(36).slice(2, 11)}`
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : fallbackId)
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
    
    // For character count
    const value = props.value as string || ''
    
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', className)}>
        {label && (
          <div className="flex justify-between items-end">
            <label
              htmlFor={inputId}
              className="text-label text-primary"
            >
              {label} {props.required && <span className="text-error" aria-hidden="true">*</span>}
            </label>
            {maxLength && (
              <span className="text-[10px] text-tertiary">
                {value.length}/{maxLength}
              </span>
            )}
          </div>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={
              cn(error && errorId, helperText && !error && helperId) || undefined
            }
            className={cn(
              'w-full h-10 px-3 rounded-md bg-surface border text-body text-primary',
              'placeholder:text-tertiary transition-all duration-base outline-none',
              error
                ? 'border-error focus:ring-2 focus:ring-error focus:border-error'
                : 'border-border focus:border-brand focus:ring-2 focus:ring-brand',
              isPassword && 'pr-10',
              leftIcon && 'pl-10'
            )}
            {...props}
          />
          
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors focus-visible:outline-none focus-visible:text-brand"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
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

Input.displayName = 'Input'
