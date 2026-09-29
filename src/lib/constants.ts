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
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_VENUES: '/admin/venues',
  ADMIN_VENUE_DETAIL: (id: string) => `/admin/venues/${id}`,
  ADMIN_COURTS: '/admin/courts',
  ADMIN_COURT_DETAIL: (id: string) => `/admin/courts/${id}`,
  ADMIN_USERS: '/admin/users',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_MARKETPLACE: '/admin/marketplace',
  ADMIN_METADATA: '/admin/metadata',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_COMMON: '/admin/common',
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
