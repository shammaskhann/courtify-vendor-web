'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { OtpInput } from '@/components/auth/OtpInput'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Logo } from '@/components/common/Logo'
import { AlertCircle } from 'lucide-react'

function VerifyOtpContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { verifyOtp, resendOtp, isLoading, error, clearError, status } = useAuth()
  
  // Extract email from query param if available, otherwise from auth context if they are partially logged in
  const emailParam = searchParams.get('email')
  const email = emailParam || 'your email'

  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)

  // Redirect if already fully authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status, router])

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    } else if (countdown === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [countdown, canResend])

  const handleComplete = async (completedCode: string) => {
    if (error) clearError()
    try {
      await verifyOtp(completedCode)
    } catch {
      setCode('') // Clear inputs on error
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setCanResend(false)
    setCountdown(30)
    await resendOtp(email)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center space-y-2 mb-8">
        <Typography variant="h2">Verify your email</Typography>
        <Typography variant="body" color="secondary">
          We sent a 6-digit verification code to <span className="font-medium text-primary">{email}</span>.
        </Typography>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-error-bg border border-error/20 flex items-start gap-3">
          <AlertCircle className="text-error shrink-0 mt-0.5" size={18} />
          <Typography variant="body-sm" color="error" className="font-medium">
            {error}
          </Typography>
        </div>
      )}

      <div className="space-y-8">
        <OtpInput
          length={6}
          value={code}
          onChange={(val) => {
            setCode(val)
            if (error) clearError()
          }}
          onComplete={handleComplete}
          error={error ? ' ' : undefined} // Don't duplicate error text, just red border
          disabled={isLoading}
        />

        <Button
          fullWidth
          isLoading={isLoading}
          onClick={() => handleComplete(code)}
          disabled={code.length < 6}
        >
          Verify Code
        </Button>

        <div className="text-center">
          <Typography variant="body-sm" color="secondary">
            Didn&apos;t receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={!canResend || isLoading}
              className="text-brand font-medium hover:underline disabled:opacity-50 disabled:hover:no-underline"
            >
              {canResend ? 'Resend now' : `Resend in ${countdown}s`}
            </button>
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <div className="w-full max-w-lg bg-surface border border-border p-8 rounded-xl shadow-sm">
        <Suspense fallback={<div className="h-64 flex items-center justify-center animate-pulse bg-surface-variant rounded-md" />}>
          <VerifyOtpContent />
        </Suspense>
      </div>
    </div>
  )
}
