import { api } from '@/lib/api-client'
import type { Venue, PaginatedResponse } from '@/types/models'

export async function getVenues(params: {
  search?: string; city?: string; page?: number; pageSize?: number
} = {}): Promise<PaginatedResponse<Venue>> {
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)
  if (params.city) query.append('city', params.city)
  if (params.page) query.append('page', params.page.toString())
  if (params.pageSize) query.append('pageSize', params.pageSize.toString())

  const res = await api.get<PaginatedResponse<Venue> | Venue[]>(`/court-owner/venues/my?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  
  const data = res.data
  return {
    data: Array.isArray(data) ? data : data?.content || [],
    total: Array.isArray(data) ? data.length : data?.totalElements || 0,
    page: data?.page || params.page || 1,
    pageSize: data?.size || params.pageSize || 10
  }
}

export async function getVenueById(id: string): Promise<Venue | null> {
  const res = await api.get<Venue>(`/court-owner/venues/my/${id}`)
  if (res.error) {
    if (res.statusCode === 404) return null
    throw new Error(res.error)
  }
  return res.data
}

export async function createVenue(data: Omit<Venue, 'id' | 'courtCount' | 'createdAt' | 'updatedAt'>): Promise<Venue> {
  const res = await api.post<Venue>('/court-owner/venues', data)
  if (res.error) throw new Error(res.error)
  return res.data as Venue
}

export async function updateVenue(id: string, data: Partial<Venue>): Promise<Venue> {
  const res = await api.put<Venue>(`/court-owner/venues/my/${id}`, data)
  if (res.error) throw new Error(res.error)
  return res.data as Venue
}

export async function deleteVenue(id: string): Promise<{ success: boolean }> {
  const res = await api.delete<{ success: boolean }>(`/court-owner/venues/my/${id}`)
  if (res.error) throw new Error(res.error)
  return { success: true }
}
