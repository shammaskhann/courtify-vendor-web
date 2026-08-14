'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/common/Logo'
import { Input } from '@/components/forms/Input'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { AlertCircle } from 'lucide-react'
import { forgotPassword } from '@/lib/api/authApi'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await forgotPassword(email)
      router.push(`/reset-password?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError((err as Error).message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="hidden md:flex md:w-1/2 bg-surface border-r border-border items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <Logo size="lg" />
          <h1 className="text-display font-bold text-primary tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-body-lg text-secondary">
            Don't worry, it happens to the best of us. Enter your email and we'll send you an OTP to reset it.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full flex justify-center md:hidden mb-8">
          <Logo size="md" />
        </div>
        
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6" noValidate>
          <div className="text-center space-y-2 mb-8">
            <Typography variant="h2">Reset Password</Typography>
            <Typography variant="body" color="secondary">
              Enter your email address to receive a one-time password.
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
            />
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            Send OTP
          </Button>

          <Typography variant="body-sm" className="text-center mt-6">
            Remembered your password?{' '}
            <Link href="/login" className="text-brand font-medium hover:underline">
              Back to login
            </Link>
          </Typography>
        </form>
      </div>
    </div>
  )
}
