'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/common/Logo'
import { Input } from '@/components/forms/Input'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { resetPassword } from '@/lib/api/authApi'
import Link from 'next/link'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await resetPassword(email, otp, newPassword)
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError((err as Error).message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center">
            <CheckCircle2 size={32} className="text-success" />
          </div>
        </div>
        <Typography variant="h3">Password Reset Successful</Typography>
        <Typography variant="body" color="secondary">
          Your password has been successfully updated. You will be redirected to the login page shortly.
        </Typography>
        <div className="pt-4">
          <Link href="/login">
            <Button fullWidth>Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6" noValidate>
      <div className="text-center space-y-2 mb-8">
        <Typography variant="h2">Create New Password</Typography>
        <Typography variant="body" color="secondary">
          We've sent a 6-digit OTP to <span className="font-medium text-primary">{email}</span>. Enter it below along with your new password.
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
          label="One-Time Password (OTP)"
          name="otp"
          type="text"
          maxLength={6}
          required
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, ''))
            setError(null)
          }}
          placeholder="123456"
        />
        <Input
          label="New Password"
          name="newPassword"
          type="password"
          required
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value)
            setError(null)
          }}
        />
        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            setError(null)
          }}
        />
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        Reset Password
      </Button>

      <Typography variant="body-sm" className="text-center mt-6">
        <Link href="/login" className="text-brand font-medium hover:underline">
          Back to login
        </Link>
      </Typography>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="hidden md:flex md:w-1/2 bg-surface border-r border-border items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <Logo size="lg" />
          <h1 className="text-display font-bold text-primary tracking-tight">
            Secure your account
          </h1>
          <p className="text-body-lg text-secondary">
            Set a strong password to protect your business data and earnings on Courtify.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full flex justify-center md:hidden mb-8">
          <Logo size="md" />
        </div>
        
        <Suspense fallback={<div className="p-12 text-center text-secondary">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
