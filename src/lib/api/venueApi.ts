import { api } from '@/lib/api-client'
import type { Venue, PaginatedResponse } from '@/types/models'

export async function getVenues(params: {
  search?: string; city?: string; status?: string; page?: number; pageSize?: number
} = {}): Promise<PaginatedResponse<Venue>> {
  const query = new URLSearchParams()
  
  const hasFilters = !!(params.search || params.city || params.status)

  if (hasFilters) {
    if (params.search) query.append('name', params.search)
    if (params.city) query.append('city', params.city)
    if (params.status) query.append('status', params.status)
      
    const res = await api.get<Venue[]>(`/court-owner/venues/search?${query.toString()}`)
    if (res.error) throw new Error(res.error)
    
    return {
      data: res.data || [],
      total: res.data?.length || 0,
      page: 1,
      pageSize: res.data?.length || 10
    }
  }

  if (params.page) query.append('page', params.page.toString())
  if (params.pageSize) query.append('pageSize', params.pageSize.toString())

  const res = await api.get<PaginatedResponse<Venue> | Venue[]>(`/court-owner/venues/my?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  
  const data = res.data
  return {
    data: Array.isArray(data) ? data : (data as any)?.content || [],
    total: Array.isArray(data) ? data.length : (data as any)?.totalElements || 0,
    page: (data as any)?.page || params.page || 1,
    pageSize: (data as any)?.size || params.pageSize || 10
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
  const res = await api.patch<Venue>(`/court-owner/venues/my/${id}`, data)
  if (res.error) throw new Error(res.error)
  return res.data as Venue
}

export async function deleteVenue(id: string): Promise<{ success: boolean }> {
  const res = await api.delete<{ success: boolean }>(`/court-owner/venues/my/${id}`)
  if (res.error) throw new Error(res.error)
  return { success: true }
}
