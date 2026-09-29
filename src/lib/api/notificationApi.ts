import { api } from '@/lib/api-client'
import type { PaginatedResponse, Notification } from '@/types/models'

export async function getNotifications(params: { page?: number; pageSize?: number } = {}): Promise<PaginatedResponse<Notification>> {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.append('page', params.page.toString())
  if (params.pageSize !== undefined) query.append('size', params.pageSize.toString())

  const res = await api.get<PaginatedResponse<Notification>>(`/notifications?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  return res.data as PaginatedResponse<Notification>
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
