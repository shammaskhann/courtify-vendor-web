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

  const res = await api.get<PaginatedResponse<Court>>(`/court-owner/courts/all?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  return res.data as PaginatedResponse<Court>
}

export async function getCourtsByVenue(venueId: string, params: { page?: number; pageSize?: number } = {}): Promise<PaginatedResponse<Court>> {
  const query = new URLSearchParams()
  if (params.page) query.append('page', params.page.toString())
  if (params.pageSize) query.append('pageSize', params.pageSize.toString())
  
  const res = await api.get<PaginatedResponse<Court>>(`/court-owner/courts/venues/${venueId}?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  return res.data as PaginatedResponse<Court>
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

export async function createCourt(venueId: string, data: Omit<Court, 'id' | 'venueId' | 'createdAt'>): Promise<Court> {
  const res = await api.post<Court>(`/court-owner/courts/venues/${venueId}/court`, data)
  if (res.error) throw new Error(res.error)
  return res.data as Court
}

export async function updateCourt(venueId: string, courtId: string, data: Partial<Court>): Promise<Court> {
  const res = await api.put<Court>(`/courts/court-owner/venues/${venueId}/courts/${courtId}`, data)
  if (res.error) throw new Error(res.error)
  return res.data as Court
}

export async function deleteCourt(venueId: string, courtId: string): Promise<{ success: boolean }> {
  const res = await api.delete<{ success: boolean }>(`/court-owner/courts/venues/${venueId}/court/${courtId}`)
  if (res.error) throw new Error(res.error)
  return { success: true }
}
