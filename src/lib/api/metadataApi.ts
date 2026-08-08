import { api } from '../api-client'
import type { CommonItem } from '@/types/models'

export async function getAmenities(): Promise<CommonItem[]> {
  const res = await api.get<CommonItem[]>('/common/amenities')
  if (res.error) throw new Error(res.error)
  return res.data || []
}

export async function getCities(): Promise<CommonItem[]> {
  const res = await api.get<CommonItem[]>('/common/cities')
  if (res.error) throw new Error(res.error)
  return res.data || []
}

export async function getSportTypes(): Promise<CommonItem[]> {
  const res = await api.get<CommonItem[]>('/common/sport-types')
  if (res.error) throw new Error(res.error)
  return res.data || []
}
