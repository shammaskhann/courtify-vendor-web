import { mockDeals } from '../data/deals'
import { mockDelay, mockError, paginate } from '../utils'
import type { Deal, DealType, PaginatedResponse } from '@/types/models'

let deals = [...mockDeals]

export async function getDeals(params: {
  search?: string; dealType?: DealType; isActive?: boolean; venueId?: string;
  page?: number; pageSize?: number
} = {}): Promise<PaginatedResponse<Deal>> {
  await mockDelay()
  mockError()
  const { search, dealType, isActive, venueId, page = 1, pageSize = 10 } = params
  let filtered = [...deals]
  if (search) { const q = search.toLowerCase(); filtered = filtered.filter(d => d.name.toLowerCase().includes(q) || d.promoCode.toLowerCase().includes(q)) }
  if (dealType) filtered = filtered.filter(d => d.dealType === dealType)
  if (isActive !== undefined) filtered = filtered.filter(d => d.isActive === isActive)
  if (venueId) filtered = filtered.filter(d => d.venueId === venueId || d.venueId === null)
  return paginate(filtered, page, pageSize)
}

export async function getDealById(id: string): Promise<Deal | null> {
  await mockDelay(300, 600)
  return deals.find(d => d.id === id) || null
}

export async function createDeal(data: Omit<Deal, 'id' | 'usesCount' | 'createdAt'>): Promise<Deal> {
  await mockDelay()
  mockError()
  const deal: Deal = { ...data, id: `deal-${Date.now()}`, usesCount: 0, createdAt: new Date().toISOString() }
  deals = [deal, ...deals]
  return deal
}

export async function updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
  await mockDelay()
  mockError()
  const idx = deals.findIndex(d => d.id === id)
  if (idx === -1) throw new Error('Deal not found')
  deals[idx] = { ...deals[idx], ...data }
  return deals[idx]
}

export async function toggleDealActive(id: string): Promise<Deal> {
  await mockDelay(300, 600)
  mockError()
  const idx = deals.findIndex(d => d.id === id)
  if (idx === -1) throw new Error('Deal not found')
  deals[idx] = { ...deals[idx], isActive: !deals[idx].isActive }
  return deals[idx]
}

export async function deleteDeal(id: string): Promise<{ success: boolean }> {
  await mockDelay()
  mockError()
  deals = deals.filter(d => d.id !== id)
  return { success: true }
}
