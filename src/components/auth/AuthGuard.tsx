'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { PageLoader } from '@/components/common/PageLoader'
import { ROUTES } from '@/lib/constants'

import { UserRole } from '@/types/auth'

export function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }) {
  const { status, user } = useAuth()
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

  // Ensure user has the correct role
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    // Navigate away if they don't have permission
    router.replace(user.role === 'ADMIN' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD)
    return null
  }

  // authenticated
  return <>{children}</>
}
