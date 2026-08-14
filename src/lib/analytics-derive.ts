import type {
  Booking,
  BookingBreakdown,
  BookingStatus,
  Court,
  CourtUtilization,
  RevenueByVenue,
  Venue,
  WeekDay,
} from '@/types/models'

/**
 * Client-side analytics derivations.
 *
 * The backend only exposes `/dashboard/analytics`, which returns headline totals
 * plus a revenue series. Court utilization, status breakdown and revenue-by-venue
 * are derived here from the bookings the vendor can already read. The return
 * shapes match `@/types/models`, so each of these can be swapped for a real
 * endpoint later without touching the components that consume them.
 */

/** Bookings that represent a slot actually sold — used for revenue and occupancy. */
const REVENUE_STATUSES: BookingStatus[] = ['CONFIRMED', 'COMPLETED']

/** Indexed by `Date.getDay()` (0 = Sunday), which does not match WEEK_DAYS order. */
const DAY_BY_INDEX: WeekDay[] = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY',
]

const TIME_12H = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
const TIME_24H = /^(\d{1,2}):(\d{2})/

/**
 * Parse "06:30 PM" or "18:30" into minutes past midnight.
 * Returns null when the value can't be read, so callers can skip rather than guess.
 */
export function parseTimeToMinutes(value?: string | null): number | null {
  if (!value) return null
  const trimmed = value.trim()

  const twelve = trimmed.match(TIME_12H)
  if (twelve) {
    let hours = parseInt(twelve[1], 10)
    const minutes = parseInt(twelve[2], 10)
    if (hours > 12 || minutes > 59) return null
    if (hours === 12) hours = 0
    if (twelve[3].toUpperCase() === 'PM') hours += 12
    return hours * 60 + minutes
  }

  const twentyFour = trimmed.match(TIME_24H)
  if (twentyFour) {
    const hours = parseInt(twentyFour[1], 10)
    const minutes = parseInt(twentyFour[2], 10)
    if (hours > 23 || minutes > 59) return null
    return hours * 60 + minutes
  }

  return null
}

/** Minutes between two clock times, treating end <= start as running past midnight. */
function spanMinutes(startMinutes: number, endMinutes: number): number {
  return endMinutes > startMinutes
    ? endMinutes - startMinutes
    : 24 * 60 - startMinutes + endMinutes
}

export function bookingDurationMinutes(booking: Booking): number {
  if (booking.durationMinutes && booking.durationMinutes > 0) return booking.durationMinutes

  const start = parseTimeToMinutes(booking.startTime)
  const end = parseTimeToMinutes(booking.endTime)
  if (start === null || end === null) return 0

  return spanMinutes(start, end)
}

export function bookingAmount(booking: Booking): number {
  return booking.amount ?? booking.totalAmount ?? 0
}

export type TimeRange = 'today' | 'week' | 'month' | 'quarter'

/** Number of days each range covers, inclusive of today. */
const RANGE_DAYS: Record<TimeRange, number> = {
  today: 1,
  week: 7,
  month: 30,
  quarter: 90,
}

export interface Period {
  start: Date
  end: Date
}

export function getPeriodBounds(range: TimeRange, now = new Date()): Period {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  start.setDate(start.getDate() - (RANGE_DAYS[range] - 1))
  return { start, end }
}

/** The equally-sized window immediately before `period`, for trend comparison. */
export function getPreviousPeriod(range: TimeRange, period: Period): Period {
  const end = new Date(period.start.getTime() - 1)
  const start = new Date(period.start)
  start.setDate(start.getDate() - RANGE_DAYS[range])
  return { start, end }
}

export function filterBookingsByPeriod(bookings: Booking[], period: Period): Booking[] {
  return bookings.filter((booking) => {
    const date = new Date(booking.bookingDate)
    if (Number.isNaN(date.getTime())) return false
    return date >= period.start && date <= period.end
  })
}

export function deriveBookingBreakdown(bookings: Booking[]): BookingBreakdown {
  const breakdown: BookingBreakdown = {
    pending: 0, confirmed: 0, completed: 0, cancelled: 0, rejected: 0,
  }

  for (const booking of bookings) {
    switch (booking.status) {
      case 'PENDING': breakdown.pending++; break
      case 'CONFIRMED': breakdown.confirmed++; break
      case 'COMPLETED': breakdown.completed++; break
      case 'CANCELLED': breakdown.cancelled++; break
      case 'REJECTED': breakdown.rejected++; break
    }
  }

  return breakdown
}

export function deriveRevenue(bookings: Booking[]): number {
  return bookings
    .filter((booking) => REVENUE_STATUSES.includes(booking.status))
    .reduce((total, booking) => total + bookingAmount(booking), 0)
}

/** Distinct customers in the set, keyed by whatever identifier the booking carries. */
export function deriveCustomerCount(bookings: Booking[]): number {
  const seen = new Set<string>()
  for (const booking of bookings) {
    const key = customerKey(booking)
    if (key) seen.add(key)
  }
  return seen.size
}

/**
 * Stable identity for a customer across bookings. Contact details are the most
 * reliable key available — the backend denormalizes them onto each booking and
 * there is no customer entity to join against.
 */
export function customerKey(booking: Booking): string | null {
  const contact = booking.customerContact?.trim().toLowerCase()
  if (contact) return `contact:${contact}`

  const email = booking.customerEmail?.trim().toLowerCase()
  if (email) return `email:${email}`

  const id = booking.userId ?? booking.customerId
  if (id !== undefined && id !== null && String(id).length > 0) return `id:${id}`

  return null
}

export function deriveRevenueByVenue(bookings: Booking[], venues: Venue[]): RevenueByVenue[] {
  const nameById = new Map(venues.map((venue) => [String(venue.id), venue.name]))
  const byVenue = new Map<string, RevenueByVenue>()

  for (const booking of bookings) {
    if (!REVENUE_STATUSES.includes(booking.status)) continue

    const venueId = String(booking.venueId)
    const row = byVenue.get(venueId) ?? {
      venueId,
      venueName: booking.venueName || nameById.get(venueId) || `Venue #${venueId}`,
      revenue: 0,
      bookingCount: 0,
    }

    row.revenue += bookingAmount(booking)
    row.bookingCount += 1
    byVenue.set(venueId, row)
  }

  return [...byVenue.values()].sort((a, b) => b.revenue - a.revenue)
}

/** Days in the period on which the court is scheduled to open. */
function countOpenDays(period: Period, openWeekdays: WeekDay[]): number {
  if (!openWeekdays?.length) return 0

  const open = new Set(openWeekdays)
  const cursor = new Date(period.start.getFullYear(), period.start.getMonth(), period.start.getDate())
  const last = new Date(period.end.getFullYear(), period.end.getMonth(), period.end.getDate())

  let days = 0
  while (cursor <= last) {
    if (open.has(DAY_BY_INDEX[cursor.getDay()])) days++
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

/**
 * Real occupancy: minutes sold divided by minutes the court was open for sale.
 * Courts whose venue has no readable opening hours are omitted rather than
 * shown with a guessed capacity.
 */
export function deriveCourtUtilization(
  bookings: Booking[],
  courts: Court[],
  venues: Venue[],
  period: Period
): CourtUtilization[] {
  const venueById = new Map(venues.map((venue) => [String(venue.id), venue]))
  const soldMinutes = new Map<string, number>()
  const soldCount = new Map<string, number>()

  for (const booking of bookings) {
    if (!REVENUE_STATUSES.includes(booking.status)) continue

    const courtId = String(booking.courtId)
    soldMinutes.set(courtId, (soldMinutes.get(courtId) ?? 0) + bookingDurationMinutes(booking))
    soldCount.set(courtId, (soldCount.get(courtId) ?? 0) + 1)
  }

  const rows: CourtUtilization[] = []

  for (const court of courts) {
    const venue = venueById.get(String(court.venueId))
    const opens = parseTimeToMinutes(venue?.openingTime)
    const closes = parseTimeToMinutes(venue?.closingTime)
    if (opens === null || closes === null) continue

    const capacity = spanMinutes(opens, closes) * countOpenDays(period, court.openWeekdays)
    if (capacity <= 0) continue

    const courtId = String(court.id)
    rows.push({
      courtId,
      courtName: court.name || court.courtName || `Court #${courtId}`,
      venueName: venue?.name ?? `Venue #${court.venueId}`,
      utilizationRate: Math.min(1, (soldMinutes.get(courtId) ?? 0) / capacity),
      totalBookings: soldCount.get(courtId) ?? 0,
    })
  }

  return rows.sort((a, b) => b.utilizationRate - a.utilizationRate)
}

/**
 * Daily revenue series across the whole period, including days with no bookings
 * so the chart shows real gaps instead of silently compressing them.
 */
export function deriveRevenueSeries(
  bookings: Booking[],
  period: Period
): { label: string; amount: number; date: string }[] {
  const byDay = new Map<string, number>()

  for (const booking of bookings) {
    if (!REVENUE_STATUSES.includes(booking.status)) continue

    const date = new Date(booking.bookingDate)
    if (Number.isNaN(date.getTime())) continue

    const key = toDateKey(date)
    byDay.set(key, (byDay.get(key) ?? 0) + bookingAmount(booking))
  }

  const series: { label: string; amount: number; date: string }[] = []
  const cursor = new Date(period.start.getFullYear(), period.start.getMonth(), period.start.getDate())
  const last = new Date(period.end.getFullYear(), period.end.getMonth(), period.end.getDate())

  while (cursor <= last) {
    const key = toDateKey(cursor)
    series.push({
      label: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: byDay.get(key) ?? 0,
      date: key,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return series
}

/** Local-time YYYY-MM-DD. Avoids the UTC shift that `toISOString()` introduces. */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export interface Trend {
  value: number
  direction: 'up' | 'down'
}

/** Percentage change against the previous period. Null when there's no baseline to compare. */
export function deriveTrend(current: number, previous: number): Trend | undefined {
  if (previous <= 0) return undefined

  const change = ((current - previous) / previous) * 100
  return {
    value: Math.abs(Math.round(change * 10) / 10),
    direction: change >= 0 ? 'up' : 'down',
  }
}
