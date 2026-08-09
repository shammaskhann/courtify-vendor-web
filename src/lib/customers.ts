import type { Booking } from '@/types/models'
import { bookingAmount, customerKey } from '@/lib/analytics-derive'

/**
 * Player CRM, derived from bookings.
 *
 * There is no customer entity on the backend — contact details are denormalized
 * onto each booking — so customers are reconstructed by grouping bookings on the
 * most stable identifier each one carries. Swap this for a real endpoint when one
 * exists; `CustomerSummary` is the shape the UI depends on.
 */

/** A customer with no booking in this many days counts as lapsed. */
export const LAPSED_AFTER_DAYS = 30

export interface CustomerSummary {
  key: string
  name: string
  email?: string
  contact?: string
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  totalSpent: number
  firstBookingDate: string
  lastBookingDate: string
  daysSinceLastBooking: number
  isLapsed: boolean
  topVenueName?: string
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

export function deriveCustomers(bookings: Booking[], now = new Date()): CustomerSummary[] {
  interface Accumulator {
    key: string
    name: string
    email?: string
    contact?: string
    totalBookings: number
    completedBookings: number
    cancelledBookings: number
    totalSpent: number
    first: Date
    last: Date
    venueCounts: Map<string, number>
  }

  const byCustomer = new Map<string, Accumulator>()

  for (const booking of bookings) {
    const key = customerKey(booking)
    if (!key) continue

    const date = new Date(booking.bookingDate)
    if (Number.isNaN(date.getTime())) continue

    const existing = byCustomer.get(key)
    const entry: Accumulator = existing ?? {
      key,
      name: booking.customerName?.trim() || `Customer ${key.split(':')[1]}`,
      email: booking.customerEmail?.trim() || undefined,
      contact: booking.customerContact?.trim() || undefined,
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalSpent: 0,
      first: date,
      last: date,
      venueCounts: new Map(),
    }

    // Later bookings may carry details an earlier one lacked.
    if (!entry.email && booking.customerEmail) entry.email = booking.customerEmail.trim()
    if (!entry.contact && booking.customerContact) entry.contact = booking.customerContact.trim()

    entry.totalBookings += 1
    if (booking.status === 'COMPLETED') entry.completedBookings += 1
    if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') entry.cancelledBookings += 1
    if (booking.status === 'COMPLETED' || booking.status === 'CONFIRMED') {
      entry.totalSpent += bookingAmount(booking)
    }

    if (date < entry.first) entry.first = date
    if (date > entry.last) entry.last = date

    const venueName = booking.venueName || `Venue #${booking.venueId}`
    entry.venueCounts.set(venueName, (entry.venueCounts.get(venueName) ?? 0) + 1)

    byCustomer.set(key, entry)
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return [...byCustomer.values()]
    .map((entry) => {
      const lastDay = new Date(entry.last.getFullYear(), entry.last.getMonth(), entry.last.getDate())
      const daysSinceLastBooking = Math.max(
        0,
        Math.round((startOfToday.getTime() - lastDay.getTime()) / MS_PER_DAY)
      )

      const topVenue = [...entry.venueCounts.entries()].sort((a, b) => b[1] - a[1])[0]

      return {
        key: entry.key,
        name: entry.name,
        email: entry.email,
        contact: entry.contact,
        totalBookings: entry.totalBookings,
        completedBookings: entry.completedBookings,
        cancelledBookings: entry.cancelledBookings,
        totalSpent: entry.totalSpent,
        firstBookingDate: entry.first.toISOString(),
        lastBookingDate: entry.last.toISOString(),
        daysSinceLastBooking,
        isLapsed: daysSinceLastBooking >= LAPSED_AFTER_DAYS,
        topVenueName: topVenue?.[0],
      }
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
}

/**
 * Build a wa.me link from a Pakistani contact number.
 * Returns null when there aren't enough digits to dial.
 */
export function toWhatsAppLink(contact?: string): string | null {
  if (!contact) return null

  const digits = contact.replace(/\D/g, '')
  if (digits.length < 10) return null

  let normalized = digits
  if (normalized.startsWith('0')) {
    normalized = `92${normalized.slice(1)}`
  } else if (!normalized.startsWith('92')) {
    normalized = `92${normalized}`
  }

  return `https://wa.me/${normalized}`
}
