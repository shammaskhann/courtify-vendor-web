import { mockBookings } from '../data/bookings'
import { mockDelay, mockError, paginate } from '../utils'
import type { Booking, BookingStatus, PaymentStatus, PaginatedResponse } from '@/types/models'

let bookings = [...mockBookings]

export async function getBookings(params: {
  venueId?: string; status?: BookingStatus; search?: string;
  startDate?: string; endDate?: string; paymentStatus?: PaymentStatus;
  page?: number; pageSize?: number
} = {}): Promise<PaginatedResponse<Booking>> {
  await mockDelay()
  mockError()
  const { venueId, status, search, startDate, endDate, paymentStatus, page = 1, pageSize = 10 } = params
  let filtered = [...bookings]
  if (venueId) filtered = filtered.filter(b => b.venueId === venueId)
  if (status) filtered = filtered.filter(b => b.status === status)
  if (paymentStatus) filtered = filtered.filter(b => b.paymentStatus === paymentStatus)
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(b =>
      b.customerName.toLowerCase().includes(q) || b.bookingReference.toLowerCase().includes(q) || b.courtName.toLowerCase().includes(q)
    )
  }
  if (startDate) filtered = filtered.filter(b => b.bookingDate >= startDate)
  if (endDate) filtered = filtered.filter(b => b.bookingDate <= endDate)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return paginate(filtered, page, pageSize)
}

export async function getBookingsByStatus(status: BookingStatus): Promise<{ bookings: Booking[]; total: number }> {
  await mockDelay()
  mockError()
  const filtered = bookings.filter(b => b.status === status)
  return { bookings: filtered, total: filtered.length }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus, note?: string): Promise<Booking> {
  await mockDelay()
  mockError()
  const idx = bookings.findIndex(b => b.id === bookingId)
  if (idx === -1) throw new Error('Booking not found')
  bookings[idx] = { ...bookings[idx], status, updatedAt: new Date().toISOString(), notes: note || bookings[idx].notes }
  return bookings[idx]
}

export async function verifyQr(qrToken: string): Promise<Booking> {
  await mockDelay(400, 800)
  const booking = bookings.find(b => b.qrToken === qrToken)
  if (!booking) throw new Error('No booking found with this QR code. Please check the code and try again.')
  return booking
}

export function getBookingCounts(): Record<BookingStatus | 'ALL', number> {
  return {
    ALL: bookings.length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
    COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
    REJECTED: bookings.filter(b => b.status === 'REJECTED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
  }
}
