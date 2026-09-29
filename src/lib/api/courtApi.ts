import { api } from '@/lib/api-client'
import type { Court, PaginatedResponse, SportType, PricingType } from '@/types/models'

export async function getCourts(params: {
  search?: string; venueId?: string; sportType?: SportType; pricingType?: PricingType;
  isDisabled?: boolean; page?: number; pageSize?: number
} = {}): Promise<PaginatedResponse<Court>> {
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)
  if (params.venueId) query.append('venueId', params.venueId)
  if (params.sportType) query.append('sportType', params.sportType)
  if (params.pricingType) query.append('pricingType', params.pricingType)
  if (params.isDisabled !== undefined) query.append('isDisabled', params.isDisabled.toString())
  if (params.page) query.append('page', params.page.toString())
  if (params.pageSize) query.append('pageSize', params.pageSize.toString())

  const res = await api.get<PaginatedResponse<Court> | Court[]>(`/court-owner/courts/all?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  
  const data = res.data
  return {
    data: Array.isArray(data) ? data : (data as any)?.content || [],
    total: Array.isArray(data) ? data.length : (data as any)?.totalElements || 0,
    page: (data as any)?.page || params.page || 1,
    pageSize: (data as any)?.size || params.pageSize || 10
  }
}

export async function getCourtsByVenue(venueId: string, params: { page?: number; pageSize?: number } = {}): Promise<PaginatedResponse<Court>> {
  const query = new URLSearchParams()
  if (params.page) query.append('page', params.page.toString())
  if (params.pageSize) query.append('pageSize', params.pageSize.toString())
  
  const res = await api.get<PaginatedResponse<Court> | Court[]>(`/court-owner/courts/venues/${venueId}?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  
  const data = res.data
  return {
    data: Array.isArray(data) ? data : (data as any)?.content || [],
    total: Array.isArray(data) ? data.length : (data as any)?.totalElements || 0,
    page: (data as any)?.page || params.page || 1,
    pageSize: (data as any)?.size || params.pageSize || 10
  }
}

export async function getCourtById(id: string): Promise<Court | null> {
  // Assuming the backend creates an endpoint that looks like this based on requirements update.
  // We can't know the venueId here easily if the UI only passes courtId, so hopefully backend supports /courts/{id}
  // If the backend strictly requires venueId, we might need to adjust this later. 
  // Let's assume a generic GET /court-owner/courts/{id} for now, or we just throw if not provided.
  // Actually, the requirements I added earlier specified: GET /court-owner/courts/venues/{venueId}/court/{courtId}
  // But our mock signature only takes `id: string`. Let's use a query param or an overarching endpoint:
  const res = await api.get<Court>(`/court-owner/courts/${id}`)
  if (res.error) {
    if (res.statusCode === 404) return null
    throw new Error(res.error)
  }
  return res.data
}

/** Envelope shapes `GET /public/courts/{id}` may return. */
type PublicCourtResponse =
  | Court
  | Court[]
  | { data?: Court }
  | { data?: Court[] }
  | { content?: Court[] }

/** Narrows the several envelope shapes this endpoint has been seen to return. */
function unwrapCourt(payload: PublicCourtResponse | null | undefined): Court | null {
  if (!payload) return null
  if (Array.isArray(payload)) return payload[0] ?? null
  const record = payload as Record<string, unknown>

  if (Array.isArray(record.content)) return (record.content[0] as Court) ?? null
  if (Array.isArray(record.data)) return (record.data[0] as Court) ?? null
  if (record.data && typeof record.data === 'object') return record.data as Court
  if (record.id !== undefined) return payload as Court
  return null
}

/**
 * Public court lookup — no role required. Admin surfaces use
 * `getAdminCourtById` instead, which requires the ADMIN role.
 *
 * The response carries the moderation flags `isApproved` / `isDisabled`.
 */
export async function getPublicCourtById(id: string | number): Promise<Court> {
  const res = await api.get<PublicCourtResponse>(`/public/courts/${id}`)
  if (res.error) {
    const err = new Error(res.error) as Error & { statusCode?: number }
    err.statusCode = res.statusCode
    throw err
  }
  const court = unwrapCourt(res.data)
  if (!court) throw new Error('Court not found')
  return court
}

export async function createCourt(venueId: string, data: Omit<Court, 'id' | 'venueId' | 'createdAt'>): Promise<Court> {
  const res = await api.post<Court>(`/court-owner/courts/venues/${venueId}/court`, data)
  if (res.error) throw new Error(res.error)
  return res.data as Court
}

export async function updateCourt(venueId: string, courtId: string, data: Partial<Court>): Promise<Court> {
  const res = await api.put<Court>(`/court-owner/courts/${courtId}/venue/${venueId}`, data)
  if (res.error) throw new Error(res.error)
  return res.data as Court
}

export async function deleteCourt(venueId: string, courtId: string): Promise<{ success: boolean }> {
  const res = await api.delete<{ success: boolean }>(`/court-owner/courts/venues/${venueId}/court/${courtId}`)
  if (res.error) throw new Error(res.error)
  return { success: true }
}

export async function toggleCourtMaintenance(courtId: string, isMaintenance: boolean): Promise<boolean> {
  const res = await api.patch<{ success: boolean; data: boolean }>(`/court-owner/courts/${courtId}/toggle-maintenance?isMaintenance=${isMaintenance}`, {})
  if (res.error) throw new Error(res.error)
  return res.data?.data || false
}

export async function getCourtOccupiedSlotsRange(courtId: string, startDate: string, endDate: string): Promise<Record<string, { startTime: string, endTime: string }[]>> {
  const res = await api.get<Record<string, { startTime: string, endTime: string }[]>>(`/vendor-booking/court/${courtId}/occupied-slots?startDate=${startDate}&endDate=${endDate}`)
  if (res.error) throw new Error(res.error)
  return res.data as Record<string, { startTime: string, endTime: string }[]>
}
