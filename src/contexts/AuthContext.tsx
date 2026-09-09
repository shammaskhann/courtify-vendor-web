'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authStorage } from '@/lib/auth-storage'
import { AuthStatus, VendorUser, JwtPayload } from '@/types/auth'
import { api } from '@/lib/api-client'
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
  address?: string
  city?: string
}

interface AuthContextValue {
  user: VendorUser | null
  status: AuthStatus
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  verifyOtp: (email: string, code: string) => Promise<void>
  resendOtp: (email: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  checkApprovalStatus: () => Promise<void>
  updateSessionUser: (data: Partial<VendorUser>) => void
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
    if (vendor.role === 'ADMIN') return ROUTES.ADMIN_DASHBOARD
    
    const isVer = vendor.isVerified ?? (vendor as any).verified ?? true
    const isApp = vendor.isApproved ?? (vendor as any).approved ?? true
    
    if (!isVer) return ROUTES.VERIFY_OTP
    if (!isApp) return ROUTES.APPROVAL_PENDING
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

        const storedUser = authStorage.getUser() as VendorUser | null
        if (!storedUser) {
          throw new Error('User not found in storage')
        }

        let newStatus: AuthStatus = 'authenticated'
        if (storedUser.role !== 'ADMIN') {
          const isVer = storedUser.isVerified ?? (storedUser as any).verified ?? true
          const isApp = storedUser.isApproved ?? (storedUser as any).approved ?? true
          
          newStatus = !isVer ? 'authenticated-pending-verification'
            : !isApp ? 'authenticated-pending-approval'
            : 'authenticated'
        }
        
        setUser(storedUser)
        setStatus(newStatus)
      } catch {
        authStorage.clearToken()
        authStorage.clearUser()
        setUser(null)
        setStatus('unauthenticated')
      }
    }

    initSession()

    // Listen for global 401 unauth events from api-client
    const handleUnauthorized = () => {
      authStorage.clearUser()
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
      const res = await api.post<{ token: string, user: VendorUser }>('/auth/login', credentials)
      if (res.error) {
        throw new Error(res.error)
      }
      
      const { token, user: fetchedUser } = res.data!
      
      authStorage.setToken(token)
      authStorage.setUser(fetchedUser)
      setUser(fetchedUser)
      
      let newStatus: AuthStatus = 'authenticated'
      if (fetchedUser.role !== 'ADMIN') {
        const isVer = fetchedUser.isVerified ?? (fetchedUser as any).verified ?? true
        const isApp = fetchedUser.isApproved ?? (fetchedUser as any).approved ?? true
        
        newStatus = !isVer ? 'authenticated-pending-verification'
          : !isApp ? 'authenticated-pending-approval'
          : 'authenticated'
      }
        
      setStatus(newStatus)
      router.push(getRouteForUser(fetchedUser))
    } catch (err) {
      const e = err as Error
      const errorMessage = e.message || 'Something went wrong on our end. Please try again shortly.'
      setError(errorMessage)
      
      // Redirect to OTP verification if the user needs to verify their account
      if (errorMessage.includes('Kindly Verify Account') || errorMessage.includes('OTP has been send')) {
        router.push(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(credentials.email)}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true)
    setError(null)
    try {
      const payload = {
        buissnessName: data.name,
        businessName: data.name,
        email: data.email,
        contactNo: data.phone,
        password: data.password,
        address: data.address || '',
        city: data.city || '',
        coordinates: {
          lat: data.lat || 0,
          lng: data.lng || 0
        }
      }
      const res = await api.post<null>('/auth/vendor/signup', payload)
      if (res.error) {
        throw new Error(res.error)
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

  const verifyOtp = useCallback(async (email: string, code: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.post<{ status: string }>('/auth/vendor/verifyOtp', { email, code })
      if (res.error) {
        throw new Error(res.error)
      }
      
      // On success, send to login page to login again as per requirements
      router.push(ROUTES.LOGIN)
    } catch (err) {
      const e = err as Error
      setError(e.message || 'Verification failed.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const resendOtp = useCallback(async (email: string) => {
    setError(null)
    try {
      const res = await api.post<{ status: string }>('/auth/vendor/resendOtp', { email })
      if (res.error) {
        throw new Error(res.error)
      }
    } catch (err) {
      const e = err as Error
      setError(e.message || 'Failed to resend code.')
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await api.post('/auth/logout', {})
    } catch {
      // ignore
    } finally {
      authStorage.clearToken()
      authStorage.clearUser()
      setUser(null)
      setStatus('unauthenticated')
      setIsLoading(false)
      router.replace(ROUTES.LOGIN)
    }
  }, [router])

  const checkApprovalStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get<{ isApproved?: boolean }>('/auth/me')
      if (res.error) {
        throw new Error(res.error)
      }
      
      if (res.data?.isApproved && user) {
        const updatedUser = { ...user, isApproved: true }
        setUser(updatedUser)
        setStatus('authenticated')
        router.push(ROUTES.DASHBOARD)
      }
    } catch (err) {
      console.warn('Approval check failed', err)
    } finally {
      setIsLoading(false)
    }
  }, [user, router])

  const updateSessionUser = useCallback((data: Partial<VendorUser>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...data }
      authStorage.setUser(updated)
      return updated
    })
  }, [])

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
    checkApprovalStatus,
    updateSessionUser
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
