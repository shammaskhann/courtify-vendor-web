import { api } from '@/lib/api-client'

/**
 * Vendor settings.
 *
 * These endpoints are not implemented on the backend yet. The forms call them
 * for real rather than simulating success, so a missing endpoint shows up as an
 * error the owner can see instead of a save that silently did nothing.
 */

export interface VendorProfileInput {
  businessName: string
  supportEmail: string
  contactNo: string
  registrationNumber?: string
  website?: string
}

export async function updateVendorProfile(data: VendorProfileInput): Promise<void> {
  const res = await api.patch('/court-owner/profile', data)
  if (res.error) throw new Error(res.error)
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export async function changePassword(data: ChangePasswordInput): Promise<void> {
  const res = await api.post('/auth/change-password', data)
  if (res.error) throw new Error(res.error)
}

export interface NotificationPreferences {
  newBookings: boolean
  cancellations: boolean
  payments: boolean
  marketing: boolean
}

export async function updateNotificationPreferences(data: NotificationPreferences): Promise<void> {
  const res = await api.put('/court-owner/notification-preferences', data)
  if (res.error) throw new Error(res.error)
}
