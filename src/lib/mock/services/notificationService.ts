import { mockNotifications } from '../data/notifications'
import { mockDelay, mockError } from '../utils'
import type { Notification } from '@/types/models'

let notifications = [...mockNotifications]

export async function getNotifications(params: { unreadOnly?: boolean } = {}): Promise<Notification[]> {
  await mockDelay()
  mockError()
  let filtered = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  if (params.unreadOnly) filtered = filtered.filter(n => !n.isRead)
  return filtered
}

export async function markAsRead(id: string): Promise<Notification> {
  await mockDelay(200, 400)
  const idx = notifications.findIndex(n => n.id === id)
  if (idx === -1) throw new Error('Notification not found')
  notifications[idx] = { ...notifications[idx], isRead: true }
  return notifications[idx]
}

export async function markAllAsRead(): Promise<{ success: boolean }> {
  await mockDelay()
  mockError()
  notifications = notifications.map(n => ({ ...n, isRead: true }))
  return { success: true }
}

export function getUnreadCount(): number {
  return notifications.filter(n => !n.isRead).length
}
