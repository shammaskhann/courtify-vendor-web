'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Logo } from '@/components/common/Logo'
import { RefreshCw, LogOut, Clock } from 'lucide-react'

export default function ApprovalPendingPage() {
  const { user, status, logout, checkApprovalStatus, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If somehow fully approved, kick them to dashboard
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      
      <div className="w-full max-w-lg bg-surface border border-border p-8 rounded-xl shadow-sm text-center">
        <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={32} />
        </div>
        
        <Typography variant="h2" className="mb-3">
          Approval Pending
        </Typography>
        
        <Typography variant="body" color="secondary" className="mb-8 max-w-sm mx-auto">
          Thanks for verifying your email, {user?.name}. Your vendor account is currently being reviewed by our administration team. 
          We&apos;ll notify you at <span className="font-medium text-primary">{user?.email}</span> once approved.
        </Typography>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="secondary" 
            onClick={checkApprovalStatus}
            isLoading={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh Status
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={logout}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
