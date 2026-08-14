'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/forms/Input'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth()
  
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user types
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }))
    }
    if (error) clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client side validation
    const result = loginSchema.safeParse(formData)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      setFieldErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      })
      return
    }

    try {
      await login(formData)
    } catch {
      // Clear password on error as per requirements
      setFormData(prev => ({ ...prev, password: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6" noValidate>
      <div className="text-center space-y-2 mb-8">
        <Typography variant="h2">Welcome back</Typography>
        <Typography variant="body" color="secondary">
          Enter your details to access your dashboard.
        </Typography>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-error-bg border border-error/20 flex items-start gap-3">
          <AlertCircle className="text-error shrink-0 mt-0.5" size={18} />
          <Typography variant="body-sm" color="error" className="font-medium">
            {error}
          </Typography>
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />
        
        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
          />
          <div className="flex justify-end mt-1">
            <Link href="/forgot-password" className="text-caption text-brand hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
      >
        Sign in
      </Button>

      <Typography variant="body-sm" className="text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link href={ROUTES.REGISTER} className="text-brand font-medium hover:underline">
          Register here
        </Link>
      </Typography>
    </form>
  )
}
