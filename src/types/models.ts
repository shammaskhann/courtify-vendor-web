// ============================================================
// Business Domain Types & Enums for Courtify Vendor Panel
// ============================================================

// ---- Enums ----

export const SPORT_TYPES = [
  'TENNIS', 'PADEL', 'BADMINTON', 'SQUASH', 'PICKLEBALL', 'BASKETBALL', 'FOOTBALL',
] as const
export type SportType = (typeof SPORT_TYPES)[number]

export const WEEK_DAYS = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
] as const
export type WeekDay = (typeof WEEK_DAYS)[number]

export const BOOKING_STATUSES = [
  'PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED',
] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const PAYMENT_STATUSES = [
  'PAID', 'PENDING', 'REFUNDED', 'FAILED',
] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const DEAL_TYPES = [
  'PERCENTAGE_OFF', 'FLAT_OFF', 'FIXED_PRICE', 'BUY_X_GET_Y',
] as const
export type DealType = (typeof DEAL_TYPES)[number]

export const PRICING_TYPES = [
  'CONSTANT', 'WEEKDAY_WEEKEND', 'PER_DAY',
] as const
export type PricingType = (typeof PRICING_TYPES)[number]

export const NOTIFICATION_TYPES = [
  'BOOKING_NEW', 'BOOKING_STATUS_CHANGE', 'DEAL_EXPIRING', 'VENUE_REVIEW', 'SYSTEM', 'PAYMENT_RECEIVED',
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

// ---- Models ----

export interface Venue {
  id: string
  name: string
  description: string
  address: string
  city: string
  latitude: number
  longitude: number
  amenities: string[]
  openingTime: string
  closingTime: string
  image: string
  courtCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  ownerId: string
}

export interface Court {
  id: string
  venueId: string
  name: string
  sportType: SportType[]
  openWeekdays: WeekDay[]
  isHalfHourSlot: boolean
  pricingType: PricingType
  images: string[]
  isDisabled: boolean
  createdAt: string
  // CONSTANT pricing
  constantPriceOffPeak?: number
  constantPricePeak?: number | null
  // WEEKDAY_WEEKEND pricing
  weekdayPriceOffPeak?: number
  weekendPriceOffPeak?: number
  weekdayPricePeak?: number | null
  weekendPricePeak?: number | null
  // PER_DAY pricing
  pricePerDayOffPeak?: Record<string, number>
  pricePerDayPeak?: Record<string, number> | null
  // Peak hours (shared)
  peakStartTime?: string | null
  peakEndTime?: string | null
}

export interface Booking {
  id: string
  bookingReference: string
  venueId: string
  venueName: string
  courtId: string
  courtName: string
  customerId: string
  customerName: string
  customerEmail: string
  customerContact: string
  bookingDate: string
  startTime: string
  endTime: string
  durationMinutes: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  amount: number
  dealApplied: string | null
  discountAmount: number | null
  qrToken: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  name: string
  dealType: DealType
  dealValue: number
  applicableDays: WeekDay[]
  validFrom: string
  validTo: string
  maxUses: number
  usedCount: number
  promoCode: string
  priority: number
  isStackable: boolean
  isActive: boolean
  venueId: string | null
  courtId: string | null
  startTime: string | null
  endTime: string | null
  buyQuantity: number | null
  getQuantity: number | null
  createdAt: string
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  relatedId: string | null
  relatedType: string | null
  createdAt: string
}

// ---- Analytics ----

export interface RevenueTrend {
  date: string
  revenue: number
  bookingCount: number
}

export interface BookingBreakdown {
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  rejected: number
}

export interface CourtUtilization {
  courtId: string
  courtName: string
  venueName: string
  utilizationRate: number
  totalBookings: number
}

export interface RevenueByVenue {
  venueId: string
  venueName: string
  revenue: number
  bookingCount: number
}

export interface AnalyticsSummary {
  summary: {
    total_courts: number
    total_bookings: number
    total_revenue: number
    occupancy_rate: number
  }
  revenue_overview: {
    label: string
    amount: number
    date: string
  }[]
  recent_bookings: Booking[]
}

// ---- Pagination ----

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
