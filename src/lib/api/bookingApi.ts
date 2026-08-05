import { api } from '@/lib/api-client'
import type { Booking, BookingStatus, PaymentStatus, PaginatedResponse } from '@/types/models'

export async function getBookings(params: {
  venueId?: string; status?: BookingStatus; search?: string;
  startDate?: string; endDate?: string; paymentStatus?: PaymentStatus;
  page?: number; pageSize?: number
} = {}): Promise<PaginatedResponse<Booking>> {
  const query = new URLSearchParams()
  if (params.venueId) query.append('venueId', params.venueId)
  if (params.status) query.append('status', params.status)
  if (params.search) query.append('search', params.search)
  if (params.startDate) query.append('startDate', params.startDate)
  if (params.endDate) query.append('endDate', params.endDate)
  if (params.paymentStatus) query.append('paymentStatus', params.paymentStatus)
  if (params.page) query.append('page', params.page.toString())
  if (params.pageSize) query.append('pageSize', params.pageSize.toString())

  // If venueId is provided, use the venue endpoint
  // Otherwise use the status endpoint (defaulting to ALL if not provided)
  const endpoint = params.venueId 
    ? `/vendor-booking/venue/${params.venueId}` 
    : `/vendor-booking/${params.status || 'ALL'}`
    
  const res = await api.get<PaginatedResponse<Booking> | Booking[]>(`${endpoint}?${query.toString()}`)
  
  if (res.error) throw new Error(res.error)
  
  const data = res.data
  return {
    data: Array.isArray(data) ? data : data?.content || [],
    total: Array.isArray(data) ? data.length : data?.totalElements || 0,
    page: data?.page || params.page || 1,
    pageSize: data?.size || params.pageSize || 10
  }
}

export async function getBookingsByStatus(status: BookingStatus): Promise<{ bookings: Booking[]; total: number }> {
  // Assuming backend returns an array or PaginatedResponse, mapping it here.
  const endpoint = `/vendor-booking/${status.toLowerCase()}`
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

export async function updateBookingStatus(bookingId: string, status: BookingStatus, note?: string): Promise<Booking> {
  const res = await api.put<Booking>(`/vendor-booking/${bookingId}/status`, { status, notes: note })
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
