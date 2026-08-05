import { api } from '@/lib/api-client'
import type { PaginatedResponse, Booking, AdminUser, AdminVenue, Court, CommonItem } from '@/types/models'

// ── Venues ───────────────────────────────────────────────────────────────

export async function getAdminVenues(page = 0, size = 20, sortBy = 'createdAt', direction = 'desc'): Promise<PaginatedResponse<AdminVenue>> {
  const res = await api.get<any>(`/admin/venues?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`)
  if (res.error) throw new Error(res.error)
  const data = res.data
  return {
    data: data?.content || [],
    total: data?.totalElements || 0,
    page: data?.page || page,
    pageSize: data?.size || size
  }
}

export async function getPendingVenues(page = 0, size = 50): Promise<PaginatedResponse<AdminVenue>> {
  const res = await api.get<any>(`/admin/venues/pending?page=${page}&size=${size}`)
  if (res.error) throw new Error(res.error)
  const data = res.data
  return {
    data: data?.content || [],
    total: data?.totalElements || 0,
    page: data?.page || page,
    pageSize: data?.size || size
  }
}

export async function getVenueById(id: string): Promise<AdminVenue> {
  const res = await api.get<AdminVenue>(`/admin/venues/${id}`)
  if (res.error) throw new Error(res.error)
  return res.data as AdminVenue
}

export async function approveVenue(id: string | number): Promise<void> {
  const res = await api.put(`/admin/venues/${id}/approve`, {})
  if (res.error) throw new Error(res.error)
}

export async function disableVenue(id: string | number): Promise<void> {
  const res = await api.put(`/admin/venues/${id}/disable`, {})
  if (res.error) throw new Error(res.error)
}

export async function enableVenue(id: string | number): Promise<void> {
  const res = await api.put(`/admin/venues/${id}/enable`, {})
  if (res.error) throw new Error(res.error)
}

// ── Courts ────────────────────────────────────────────────────────────────

export async function getAdminCourtsByVenue(venueId: string | number): Promise<PaginatedResponse<Court>> {
  const res = await api.get<any>(`/admin/venues/${venueId}/courts`)
  if (res.error) throw new Error(res.error)
  const data = res.data
  return {
    data: data?.content || [],
    total: data?.totalElements || 0,
    page: data?.page || 0,
    pageSize: data?.size || 20
  }
}

export async function getPendingCourts(page = 0, size = 50): Promise<PaginatedResponse<Court>> {
  const res = await api.get<any>(`/admin/venues/courts/pending?page=${page}&size=${size}`)
  if (res.error) throw new Error(res.error)
  const data = res.data
  return {
    data: data?.content || [],
    total: data?.totalElements || 0,
    page: data?.page || page,
    pageSize: data?.size || size
  }
}

export async function approveCourt(id: string | number): Promise<void> {
  const res = await api.put(`/admin/venues/courts/${id}/approve`, {})
  if (res.error) throw new Error(res.error)
}

export async function disableCourt(id: string | number): Promise<void> {
  const res = await api.put(`/admin/venues/courts/${id}/disable`, {})
  if (res.error) throw new Error(res.error)
}

export async function enableCourt(id: string | number): Promise<void> {
  const res = await api.put(`/admin/venues/courts/${id}/enable`, {})
  if (res.error) throw new Error(res.error)
}

// ── Users ─────────────────────────────────────────────────────────────────

export async function getUsersByRole(role = 'all'): Promise<PaginatedResponse<AdminUser>> {
  const res = await api.get<any>(`/admin/user/getAll?role=${role}`)
  if (res.error) throw new Error(res.error)
  const data = res.data || []
  return {
    data: Array.isArray(data) ? data : data?.content || [],
    total: Array.isArray(data) ? data.length : data?.totalElements || 0,
    page: 1,
    pageSize: Array.isArray(data) ? Math.max(data.length, 10) : data?.size || 10
  }
}

export async function addAdmin(data: any): Promise<void> {
  const res = await api.post(`/admin/create`, data)
  if (res.error) throw new Error(res.error)
}

export async function approveUser(id: string | number): Promise<void> {
  const res = await api.get(`/admin/user/approve?id=${id}`)
  if (res.error) throw new Error(res.error)
}

export async function unapproveUser(id: string | number): Promise<void> {
  const res = await api.get(`/admin/user/unapprove?id=${id}`)
  if (res.error) throw new Error(res.error)
}

export async function enableUser(id: string | number): Promise<void> {
  const res = await api.get(`/admin/user/enable?id=${id}`)
  if (res.error) throw new Error(res.error)
}

export async function disableUser(id: string | number): Promise<void> {
  const res = await api.get(`/admin/user/disable?id=${id}`)
  if (res.error) throw new Error(res.error)
}

export async function markUserAsVerified(id: string | number): Promise<void> {
  const res = await api.get(`/admin/user/markAsVerified?id=${id}`)
  if (res.error) throw new Error(res.error)
}

// ── Bookings ──────────────────────────────────────────────────────────────

export async function getAdminBookingsByVenue(venueId: string | number): Promise<PaginatedResponse<Booking> | Booking[]> {
  const res = await api.get<PaginatedResponse<Booking> | Booking[]>(`/bookings/venue/${venueId}`)
  if (res.error) throw new Error(res.error)
  return res.data as (PaginatedResponse<Booking> | Booking[])
}

// ── Common / Reference Data ───────────────────────────────────────────────

export async function getAmenities(): Promise<CommonItem[]> {
  const res = await api.get<CommonItem[]>('/common/amenities')
  if (res.error) throw new Error(res.error)
  return res.data as CommonItem[]
}

export async function addAmenity(data: { name: string }): Promise<CommonItem> {
  const res = await api.post<CommonItem>('/common/amenities', data)
  if (res.error) throw new Error(res.error)
  return res.data as CommonItem
}

export async function deleteAmenity(id: string | number): Promise<void> {
  const res = await api.delete(`/common/amenities/${id}`)
  if (res.error) throw new Error(res.error)
}

export async function getCities(): Promise<CommonItem[]> {
  const res = await api.get<CommonItem[]>('/common/cities')
  if (res.error) throw new Error(res.error)
  return res.data as CommonItem[]
}

export async function addCity(data: { name: string }): Promise<CommonItem> {
  const res = await api.post<CommonItem>('/common/cities', data)
  if (res.error) throw new Error(res.error)
  return res.data as CommonItem
}

export async function deleteCity(id: string | number): Promise<void> {
  const res = await api.delete(`/common/cities/${id}`)
  if (res.error) throw new Error(res.error)
}

export async function getSportTypes(): Promise<CommonItem[]> {
  const res = await api.get<CommonItem[]>('/common/sport-types')
  if (res.error) throw new Error(res.error)
  return res.data as CommonItem[]
}

export async function addSportType(data: { name: string }): Promise<CommonItem> {
  const res = await api.post<CommonItem>('/common/sport-types', data)
  if (res.error) throw new Error(res.error)
  return res.data as CommonItem
}

export async function deleteSportType(id: string | number): Promise<void> {
  const res = await api.delete(`/common/sport-types/${id}`)
  if (res.error) throw new Error(res.error)
}
