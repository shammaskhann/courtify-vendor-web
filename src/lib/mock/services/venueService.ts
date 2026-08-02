import { mockVenues } from '../data/venues'
import { mockDelay, mockError, paginate } from '../utils'
import type { Venue, PaginatedResponse } from '@/types/models'

let venues = [...mockVenues]

export async function getVenues(params: {
  search?: string; city?: string; page?: number; pageSize?: number
} = {}): Promise<PaginatedResponse<Venue>> {
  await mockDelay()
  mockError()
  const { search, city, page = 1, pageSize = 10 } = params
  let filtered = [...venues]
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(v => v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q) || v.address.toLowerCase().includes(q))
  }
  if (city) filtered = filtered.filter(v => v.city === city)
  return paginate(filtered, page, pageSize)
}

export async function getVenueById(id: string): Promise<Venue | null> {
  await mockDelay(300, 600)
  mockError()
  return venues.find(v => v.id === id) || null
}

export async function createVenue(data: Omit<Venue, 'id' | 'courtCount' | 'createdAt' | 'updatedAt'>): Promise<Venue> {
  await mockDelay()
  mockError()
  const venue: Venue = {
    ...data, id: `venue-${Date.now()}`, courtCount: 0,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  venues = [venue, ...venues]
  return venue
}

export async function updateVenue(id: string, data: Partial<Venue>): Promise<Venue> {
  await mockDelay()
  mockError()
  const idx = venues.findIndex(v => v.id === id)
  if (idx === -1) throw new Error('Venue not found')
  venues[idx] = { ...venues[idx], ...data, updatedAt: new Date().toISOString() }
  return venues[idx]
}

export async function deleteVenue(id: string): Promise<{ success: boolean }> {
  await mockDelay()
  mockError()
  venues = venues.filter(v => v.id !== id)
  return { success: true }
}
