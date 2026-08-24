import { api } from '@/lib/api-client'

/**
 * Vendor settings.
 *
 * These endpoints are not implemented on the backend yet. The forms call them
 * for real rather than simulating success, so a missing endpoint shows up as an
 * error the owner can see instead of a save that silently did nothing.
 */

export interface VendorProfileInput {
  name: string
  isNotificationsEnabled: boolean
}

export interface UserProfile {
  id: number
  name: string
  email: string
  contact: string
  isNotificationsEnabled: boolean
  role: string
}

export async function getVendorProfile(): Promise<UserProfile> {
  const res = await api.get<UserProfile>('/court-owner/profile')
  if (res.error) throw new Error(res.error)
  return res.data as UserProfile
}

export async function updateVendorProfile(data: VendorProfileInput): Promise<void> {
  const res = await api.patch('/court-owner/profile', data)
  if (res.error) throw new Error(res.error)
}

export interface ChangePasswordInput {
  oldPassword: string
  newPassword: string
}

export async function changePassword(data: ChangePasswordInput): Promise<void> {
  const res = await api.post('/auth/password/update', data)
  if (res.error) throw new Error(res.error)
}

export interface NotificationPreferencesInput {
  pushEnabled: boolean
  chatAlerts: boolean
  bookingAlerts: boolean
  marketingAlerts: boolean
}

export async function updateNotificationPreferences(data: NotificationPreferencesInput): Promise<void> {
  const res = await api.put('/court-owner/notification-preferences', data)
  if (res.error) throw new Error(res.error)
}
