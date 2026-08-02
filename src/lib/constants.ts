export const APP_NAME = 'Courtify' as const

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  VENUES: '/venues',
  COURTS: '/courts',
  BOOKINGS: '/bookings',
  DEALS: '/deals',
  CUSTOMERS: '/customers',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  HELP: '/help',
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  APPROVAL_PENDING: '/approval-pending',
  // Error/Fallback
  NOT_FOUND: '/404',
  UNDER_DEVELOPMENT: '/under-development',
} as const

export const BREAKPOINTS = {
  XS: 480,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1440,
} as const

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const
