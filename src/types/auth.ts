export type AuthStatus =
  | 'initializing'
  | 'unauthenticated'
  | 'authenticated-pending-verification'
  | 'authenticated-pending-approval'
  | 'authenticated'

export type UserRole = 'ADMIN' | 'COURTOWNER' | 'PLAYER' | 'USER' | 'COURTMANAGER'

export interface VendorUser {
  id: string
  name: string
  email: string
  role: UserRole
  isVerified: boolean
  isApproved: boolean
  isProfileComplete: boolean
  contactNo?: string
  businessName?: string
}

export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  statusCode: number
}

// Simulated backend JWT payload shape
export interface JwtPayload {
  sub: string
  exp: number
  vendor: VendorUser
}
