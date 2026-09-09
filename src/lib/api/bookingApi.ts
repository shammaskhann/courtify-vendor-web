import { api } from '@/lib/api-client'
import type { Booking, BookingStatus, PaymentStatus, PaginatedResponse } from '@/types/models'

export async function getBookings(params: {
  venueId?: string; status?: BookingStatus | 'ALL'; search?: string;
  startDate?: string; endDate?: string; paymentStatus?: PaymentStatus;
  page?: number; pageSize?: number
} = {}): Promise<PaginatedResponse<Booking>> {
  const query = new URLSearchParams()
  if (params.search) query.append('keyword', params.search)
  if (params.startDate) query.append('fromDate', params.startDate)
  if (params.endDate) query.append('toDate', params.endDate)

  let endpoint = ''
  if (params.venueId) {
    endpoint = `/vendor-booking/venue/${params.venueId}`
  } else {
    const statusPath = params.status && params.status !== 'ALL' ? params.status : 'ALL'
    endpoint = `/vendor-booking/status/${statusPath}`
  }
    
  const res = await api.get<PaginatedResponse<Booking> | Booking[]>(`${endpoint}?${query.toString()}`)
  
  if (res.error) throw new Error(res.error)
  
  const data = res.data
  // Ensure we mock pagination correctly if the backend returns a flat array
  return {
    data: Array.isArray(data) ? data : (data as any)?.content || [],
    total: Array.isArray(data) ? data.length : (data as any)?.totalElements || 0,
    page: (data as any)?.page || params.page || 1,
    pageSize: (data as any)?.size || params.pageSize || 10
  }
}

export async function getBookingsByStatus(status: BookingStatus | 'ALL'): Promise<{ bookings: Booking[]; total: number }> {
  const endpoint = `/vendor-booking/status/${status}`
  const res = await api.get<Booking[] | PaginatedResponse<Booking>>(endpoint)
  
  if (res.error) throw new Error(res.error)
  
  if (Array.isArray(res.data)) {
    return { bookings: res.data, total: res.data.length }
  } else if (res.data) {
    const data = res.data as any
    return { bookings: data.content || data.data || [], total: data.totalElements || data.total || 0 }
  }
  return { bookings: [], total: 0 }
}

export async function updateBookingStatus(bookingId: string | number, status: BookingStatus, note?: string): Promise<Booking> {
  const res = await api.put<Booking>(`/vendor-booking/${bookingId}/status`, { status, notes: note })
  if (res.error) throw new Error(res.error)
  return res.data as Booking
}

export interface ManualBookingInput {
  venueId: number
  courtId: number
  bookingDate: string
  startTime: string
  endTime: string
  customerName: string
  customerContact: string
  customerEmail?: string
  amount: number
  paymentStatus: PaymentStatus
  notes?: string
}

/**
 * Create a booking on the customer's behalf, for phone and walk-in trade.
 *
 * Requires a vendor-side create endpoint. If the backend does not accept POST on
 * `/vendor-booking` yet, the error surfaces in the form rather than being swallowed.
 */
export async function createManualBooking(data: ManualBookingInput): Promise<Booking> {
  const res = await api.post<Booking>('/vendor-booking', data)
  if (res.error) throw new Error(res.error)
  return res.data as Booking
}

export async function verifyQr(qrToken: string): Promise<Booking> {
  const res = await api.post<Booking>('/vendor-booking/verify-qr', { qrToken })
  if (res.error) throw new Error(res.error)
  return res.data as Booking
}

export async function getBookingCounts(): Promise<Record<BookingStatus | 'ALL', number>> {
  // Using the proposed endpoint /vendor-booking/counts
  const res = await api.get<Record<BookingStatus | 'ALL', number>>('/vendor-booking/counts')
  if (res.error) {
    console.error('Failed to fetch booking counts, falling back to 0', res.error)
    return { ALL: 0, PENDING: 0, CONFIRMED: 0, COMPLETED: 0, REJECTED: 0, CANCELLED: 0 }
  }
  return res.data as Record<BookingStatus | 'ALL', number>
}
