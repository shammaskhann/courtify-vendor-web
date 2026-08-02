'use client'

import React, { useRef } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  error?: string
  disabled?: boolean
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  disabled = false
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // Create an array of strings representing each digit
  const digits = value.padEnd(length, '').split('').slice(0, length)

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus()
      // Optional: select the text so typing replaces it
      inputRefs.current[index]?.select()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value
    // Only allow digits
    if (!/^\d*$/.test(val)) return

    const newChar = val.slice(-1)
    const newDigits = [...digits]
    newDigits[index] = newChar
    
    const newValue = newDigits.join('')
    onChange(newValue)

    if (newChar && index < length - 1) {
      focusInput(index + 1)
    }

    if (newValue.length === length && onComplete) {
      onComplete(newValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newDigits = [...digits]
      
      if (digits[index]) {
        // If current box has a value, clear it
        newDigits[index] = ''
        onChange(newDigits.join(''))
      } else if (index > 0) {
        // If empty, move to previous and clear it
        newDigits[index - 1] = ''
        onChange(newDigits.join(''))
        focusInput(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      focusInput(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pastedData) {
      onChange(pastedData)
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData)
      } else {
        focusInput(Math.min(pastedData.length, length - 1))
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between gap-2 sm:gap-4">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={2} // allow 2 so we can grab the last char in onChange if they type quickly
            value={digits[i] || ''}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-invalid={!!error}
            aria-label={`Digit ${i + 1} of ${length}`}
            className={cn(
              'w-10 h-12 sm:w-12 sm:h-14 text-center text-h3 font-semibold rounded-lg',
              'bg-surface border transition-all duration-base outline-none',
              error 
                ? 'border-error focus:ring-2 focus:ring-error text-error' 
                : 'border-border focus:border-brand focus:ring-2 focus:ring-brand text-primary',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        ))}
      </div>
      {error && (
        <p className="text-caption text-error text-center mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
