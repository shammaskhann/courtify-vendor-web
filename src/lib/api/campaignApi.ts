import { api } from '@/lib/api-client'
import type { Campaign, PaginatedResponse } from '@/types/models'

export interface CreateCampaignInput {
  title: string
  messageBody: string
  targetAudience: 'ALL' | 'BY_CITY' | 'BY_RADIUS'
  targetData?: any
  additionalData?: Record<string, string>
}

export async function createCampaign(data: CreateCampaignInput): Promise<Campaign> {
  const res = await api.post<Campaign>('/campaigns', data)
  if (res.error) throw new Error(res.error)
  return res.data as Campaign
}

export async function getCampaigns(params: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Campaign>> {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.append('page', params.page.toString())
  if (params.size !== undefined) query.append('size', params.size.toString())

  const res = await api.get<PaginatedResponse<Campaign>>(`/campaigns?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  return res.data as PaginatedResponse<Campaign>
}

export async function launchCampaign(id: string | number): Promise<Campaign> {
  const res = await api.post<Campaign>(`/campaigns/${id}/launch`, {})
  if (res.error) throw new Error(res.error)
  return res.data as Campaign
}

export async function getCampaignStatus(id: string | number): Promise<Campaign> {
  const res = await api.get<Campaign>(`/campaigns/${id}/status`)
  if (res.error) throw new Error(res.error)
  return res.data as Campaign
}
