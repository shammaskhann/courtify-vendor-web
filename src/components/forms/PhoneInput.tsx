'use client'

import React, { forwardRef, useState } from 'react'
import { Input, InputProps } from './Input'
import { cn } from '@/lib/utils'

export const PhoneInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'onChange' | 'value'> & {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}>(({ value = '', onChange, ...props }, ref) => {
  // We'll manage formatting internally but pass the raw input value upwards
  const [internalValue, setInternalValue] = useState(value as string)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value

    // If they delete everything, just set empty
    if (!raw || raw === '+92' || raw === '+92 ' || raw === '+') {
      setInternalValue('')
      if (onChange) {
        e.target.value = ''
        onChange(e)
      }
      return
    }

    // Ensure it starts with +92
    if (!raw.startsWith('+92')) {
      // If user typed '0' at the start (common in Pakistan 0300...), replace with +92
      if (raw.startsWith('0')) {
        raw = '+92' + raw.substring(1)
      } else if (!raw.startsWith('+')) {
        raw = '+92' + raw
      } else {
        // If it starts with + but not +92, force it back to +92 (for this specific component)
        raw = '+92' + raw.replace(/[^0-9]/g, '').substring(0, 10) // fallback
      }
    }

    // Extract digits after +92
    const prefix = '+92'
    let digits = raw.substring(prefix.length).replace(/[^0-9]/g, '')
    
    // Limit to 10 digits (e.g. 300 1234567)
    if (digits.length > 10) {
      digits = digits.substring(0, 10)
    }

    // Format as +92 XXX XXXXXXX
    let formatted = prefix
    if (digits.length > 0) formatted += ' ' + digits.substring(0, 3)
    if (digits.length > 3) formatted += ' ' + digits.substring(3, 10)

    setInternalValue(formatted)

    // Trigger external onChange with the formatted value
    if (onChange) {
      e.target.value = formatted
      onChange(e)
    }
  }

  return (
    <Input
      {...props}
      ref={ref}
      type="tel"
      value={internalValue || (value ? value : '')}
      onChange={handlePhoneChange}
      placeholder="+92 300 1234567"
      className={cn("tracking-wide font-mono text-sm", props.className)}
    />
  )
})

PhoneInput.displayName = 'PhoneInput'
