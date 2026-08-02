import { mockCourts } from '../data/courts'
import { mockDelay, mockError, paginate } from '../utils'
import type { Court, PaginatedResponse, SportType, PricingType } from '@/types/models'

let courts = [...mockCourts]

export async function getCourts(params: {
  search?: string; venueId?: string; sportType?: SportType; pricingType?: PricingType;
  isDisabled?: boolean; page?: number; pageSize?: number
} = {}): Promise<PaginatedResponse<Court>> {
  await mockDelay()
  mockError()
  const { search, venueId, sportType, pricingType, isDisabled, page = 1, pageSize = 10 } = params
  let filtered = [...courts]
  if (search) { const q = search.toLowerCase(); filtered = filtered.filter(c => c.name.toLowerCase().includes(q)) }
  if (venueId) filtered = filtered.filter(c => c.venueId === venueId)
  if (sportType) filtered = filtered.filter(c => c.sportType.includes(sportType))
  if (pricingType) filtered = filtered.filter(c => c.pricingType === pricingType)
  if (isDisabled !== undefined) filtered = filtered.filter(c => c.isDisabled === isDisabled)
  return paginate(filtered, page, pageSize)
}

export async function getCourtsByVenue(venueId: string, params: { page?: number; pageSize?: number } = {}): Promise<PaginatedResponse<Court>> {
  return getCourts({ venueId, ...params })
}

export async function getCourtById(id: string): Promise<Court | null> {
  await mockDelay(300, 600)
  return courts.find(c => c.id === id) || null
}

export async function createCourt(venueId: string, data: Omit<Court, 'id' | 'venueId' | 'createdAt'>): Promise<Court> {
  await mockDelay()
  mockError()
  const court: Court = { ...data, id: `court-${Date.now()}`, venueId, createdAt: new Date().toISOString() }
  courts = [court, ...courts]
  return court
}

export async function updateCourt(venueId: string, courtId: string, data: Partial<Court>): Promise<Court> {
  await mockDelay()
  mockError()
  const idx = courts.findIndex(c => c.id === courtId && c.venueId === venueId)
  if (idx === -1) throw new Error('Court not found')
  courts[idx] = { ...courts[idx], ...data }
  return courts[idx]
}

export async function deleteCourt(venueId: string, courtId: string): Promise<{ success: boolean }> {
  await mockDelay()
  mockError()
  courts = courts.filter(c => !(c.id === courtId && c.venueId === venueId))
  return { success: true }
}
