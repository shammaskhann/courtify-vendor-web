import { api } from '@/lib/api-client'
import type { Deal, PaginatedResponse } from '@/types/models'

export async function getDeals(params: {
  search?: string; dealType?: string; isActive?: boolean; venueId?: string;
  page?: number; pageSize?: number
} = {}): Promise<PaginatedResponse<Deal>> {
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)
  if (params.dealType) query.append('dealType', params.dealType)
  if (params.isActive !== undefined) query.append('isActive', params.isActive.toString())
  if (params.venueId) query.append('venueId', params.venueId)
  if (params.page) query.append('page', params.page.toString())
  if (params.pageSize) query.append('pageSize', params.pageSize.toString())

  const endpoint = params.isActive === true ? '/court-owner/deals/active' : '/court-owner/deals'
  const res = await api.get<PaginatedResponse<Deal>>(`${endpoint}?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  return res.data as PaginatedResponse<Deal>
}

export async function getDealById(id: string): Promise<Deal | null> {
  const res = await api.get<Deal>(`/court-owner/deals/${id}`)
  if (res.error) {
    if (res.statusCode === 404) return null
    throw new Error(res.error)
  }
  return res.data
}

export async function createDeal(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): Promise<Deal> {
  const res = await api.post<Deal>('/court-owner/deals', data)
  if (res.error) throw new Error(res.error)
  return res.data as Deal
}

export async function updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
  const res = await api.put<Deal>(`/court-owner/deals/${id}`, data)
  if (res.error) throw new Error(res.error)
  return res.data as Deal
}

export async function toggleDealActive(id: string): Promise<{ success: boolean }> {
  const res = await api.put<{ success: boolean }>(`/court-owner/deals/${id}/toggle`, {})
  if (res.error) throw new Error(res.error)
  return res.data as { success: boolean }
}

export async function deleteDeal(id: string): Promise<{ success: boolean }> {
  const res = await api.delete<{ success: boolean }>(`/court-owner/deals/${id}`)
  if (res.error) throw new Error(res.error)
  return { success: true }
}
