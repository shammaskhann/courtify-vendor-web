import { api } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/models'

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  /** Pre-formatted relative time, when the backend supplies one. */
  time?: string;
  /** ISO timestamp — used to format a relative time when `time` is absent. */
  createdAt?: string;
}

export async function getNotifications(params: { page?: number; pageSize?: number } = {}): Promise<PaginatedResponse<AppNotification>> {
  const query = new URLSearchParams()
  if (params.page) query.append('page', params.page.toString())
  if (params.pageSize) query.append('pageSize', params.pageSize.toString())

  const res = await api.get<PaginatedResponse<AppNotification>>(`/notifications?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  return res.data as PaginatedResponse<AppNotification>
}

export async function markAsRead(id: string): Promise<{ success: boolean }> {
  const res = await api.put<{ success: boolean }>(`/notifications/${id}/read`, {})
  if (res.error) throw new Error(res.error)
  return res.data as { success: boolean }
}

export async function markAllAsRead(): Promise<{ success: boolean }> {
  const res = await api.put<{ success: boolean }>('/notifications/read-all', {})
  if (res.error) throw new Error(res.error)
  return res.data as { success: boolean }
}

export async function getUnreadCount(): Promise<number> {
  const res = await api.get<{ count: number }>('/notifications/unread-count')
  if (res.error) return 0
  return res.data?.count || 0
}
