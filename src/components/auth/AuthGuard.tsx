'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { PageLoader } from '@/components/common/PageLoader'
import { ROUTES } from '@/lib/constants'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(ROUTES.LOGIN)
    } else if (status === 'authenticated-pending-verification') {
      router.replace(ROUTES.VERIFY_OTP)
    } else if (status === 'authenticated-pending-approval') {
      router.replace(ROUTES.APPROVAL_PENDING)
    }
  }, [status, router])

  if (status === 'initializing' || status === 'unauthenticated' || status.includes('pending')) {
    return <PageLoader fullScreen message="Loading dashboard..." />
  }

  // authenticated
  return <>{children}</>
}
