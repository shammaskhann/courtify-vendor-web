'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authStorage } from '@/lib/auth-storage'
import { AuthStatus, VendorUser, JwtPayload } from '@/types/auth'
import { ROUTES } from '@/lib/constants'

interface LoginCredentials {
  email: string
  password?: string // optional because of mock implementation nuances
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password?: string
  lat?: number
  lng?: number
}

interface AuthContextValue {
  user: VendorUser | null
  status: AuthStatus
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  verifyOtp: (code: string) => Promise<void>
  resendOtp: (email: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  checkApprovalStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<VendorUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('initializing')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Derived routing logic based on user state
  const getRouteForUser = (vendor: VendorUser) => {
    if (!vendor.isVerified) return ROUTES.VERIFY_OTP
    if (!vendor.isApproved) return ROUTES.APPROVAL_PENDING
    return ROUTES.DASHBOARD
  }

  // Hydrate session on mount
  useEffect(() => {
    const initSession = async () => {
      const token = authStorage.getToken()
      if (!token) {
        setStatus('unauthenticated')
        return
      }

      // Mock validation since we don't have a real backend
      try {
        const payloadStr = Buffer.from(token.split('.')[1], 'base64').toString()
        const payload: JwtPayload = JSON.parse(payloadStr)
        
        // Simple expiry check
        if (payload.exp * 1000 < Date.now()) {
          throw new Error('Token expired')
        }

        setUser(payload.vendor)
        setStatus(
          !payload.vendor.isVerified ? 'authenticated-pending-verification'
          : !payload.vendor.isApproved ? 'authenticated-pending-approval'
          : 'authenticated'
        )
      } catch {
        authStorage.clearToken()
        setUser(null)
        setStatus('unauthenticated')
      }
    }

    initSession()

    // Listen for global 401 unauth events from api-client
    const handleUnauthorized = () => {
      setUser(null)
      setStatus('unauthenticated')
      router.replace(ROUTES.LOGIN)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [router])

  const clearError = useCallback(() => setError(null), [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)
    try {
      // Mock API call
      // const res = await api.post<{ token: string, user: VendorUser }>('/auth/login', credentials)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Simulate backend behavior
      if (credentials.email === 'error@test.com') {
        throw new Error('Invalid email or password')
      }

      // Create a mock token
      const mockUser: VendorUser = {
        id: '1',
        name: 'Jane Doe',
        email: credentials.email,
        role: 'vendor',
        isVerified: credentials.email !== 'unverified@test.com',
        isApproved: credentials.email !== 'unapproved@test.com' && credentials.email !== 'unverified@test.com',
        isProfileComplete: true,
      }
      
      const payload: JwtPayload = { sub: mockUser.id, exp: Math.floor(Date.now() / 1000) + 86400, vendor: mockUser }
      const token = `header.${Buffer.from(JSON.stringify(payload)).toString('base64')}.signature`
      
      authStorage.setToken(token)
      setUser(mockUser)
      
      const newStatus = !mockUser.isVerified ? 'authenticated-pending-verification'
        : !mockUser.isApproved ? 'authenticated-pending-approval'
        : 'authenticated'
        
      setStatus(newStatus)
      router.push(getRouteForUser(mockUser))
    } catch (err) {
      const e = err as Error
      setError(e.message || 'Something went wrong on our end. Please try again shortly.')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (data.email === 'exists@test.com') {
        throw new Error('This email is already registered. Please log in.')
      }
      // On success, we navigate to verify OTP without logging them in fully
      router.push(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(data.email)}`)
    } catch (err) {
      const e = err as Error
      setError(e.message || 'Registration failed.')
      throw err // Rethrow so component can stay on same step
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const verifyOtp = useCallback(async (code: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      if (code !== '123456') {
        throw new Error('Incorrect code. Please try again.')
      }
      // Mock updating user
      if (user) {
        const updatedUser = { ...user, isVerified: true }
        setUser(updatedUser)
        // Refresh token in real app
        
        const newStatus = !updatedUser.isApproved ? 'authenticated-pending-approval' : 'authenticated'
        setStatus(newStatus)
        router.push(getRouteForUser(updatedUser))
      }
    } catch (err) {
      const e = err as Error
      setError(e.message || 'Verification failed.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router, user])

  const resendOtp = useCallback(async () => {
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      // success silently
    } catch (err) {
      const e = err as Error
      setError(e.message || 'Failed to resend code.')
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      // await api.post('/auth/logout', {})
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch {
      // ignore
    } finally {
      authStorage.clearToken()
      setUser(null)
      setStatus('unauthenticated')
      setIsLoading(false)
      router.replace(ROUTES.LOGIN)
    }
  }, [router])

  const checkApprovalStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      // Mock logic: randomly approve
      if (Math.random() > 0.5 && user) {
        const updatedUser = { ...user, isApproved: true }
        setUser(updatedUser)
        setStatus('authenticated')
        router.push(ROUTES.DASHBOARD)
      }
    } finally {
      setIsLoading(false)
    }
  }, [user, router])

  const value = {
    user,
    status,
    isLoading,
    error,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    clearError,
    checkApprovalStatus
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
