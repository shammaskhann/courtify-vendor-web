'use client'

import React, { forwardRef, useState, useEffect } from 'react'
import { Input, InputProps } from './Input'
import { Check, X } from 'lucide-react'

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ value, onChange, ...props }, ref) => {
    const [password, setPassword] = useState((value as string) || '')
    const [focused, setFocused] = useState(false)

    useEffect(() => {
      if (value !== undefined) {
        setPassword(value as string)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value)
      if (onChange) {
        onChange(e)
      }
    }

    const rules = [
      { id: 'length', label: 'At least 6 characters', test: (v: string) => v.length >= 6 },
      { id: 'upper', label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
      { id: 'lower', label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
      { id: 'number', label: 'One number', test: (v: string) => /[0-9]/.test(v) },
    ]

    return (
      <div className="flex flex-col gap-1 w-full">
        <Input
          {...props}
          ref={ref}
          type="password"
          value={value}
          onChange={handleChange}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
        />
        
        {/* Validation indicators pop up when typing or focused */}
        {(focused || password.length > 0) && (
          <div className="mt-2 space-y-1 bg-surface p-3 rounded-md border border-border shadow-sm">
            {rules.map((rule) => {
              const passed = rule.test(password)
              return (
                <div key={rule.id} className="flex items-center gap-2 text-caption">
                  {passed ? (
                    <Check size={14} className="text-success" />
                  ) : (
                    <X size={14} className="text-tertiary" />
                  )}
                  <span className={passed ? 'text-primary' : 'text-tertiary'}>
                    {rule.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
