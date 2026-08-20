import { api } from '@/lib/api-client'
import type { ChatThreadDto, ChatMessageDto, PageResponse } from '@/types/models'

const BASE = '/v1/chat/threads'

export async function initiateThread(threadType: string, referenceId: number | string, participantId: number | string): Promise<ChatThreadDto> {
  const res = await api.post<ChatThreadDto>('/v1/chat/threads/initiate', {
    threadType,
    referenceId: Number(referenceId),
    participantId: Number(participantId)
  })
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function getThreads(): Promise<ChatThreadDto[]> {
  const res = await api.get<ChatThreadDto[]>(BASE)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function getMessages(threadId: number | string, page = 0, size = 50): Promise<PageResponse<ChatMessageDto>> {
  // The API returns pageNumber and pageSize, we map it to match PageResponse interface
  const res = await api.get<any>(`${BASE}/${threadId}/messages?page=${page}&size=${size}`)
  if (res.error) throw new Error(res.error)
  const d = res.data!
  return {
    content: d.content,
    page: d.pageNumber ?? page,
    size: d.pageSize ?? size,
    totalElements: d.totalElements,
    totalPages: d.totalPages,
    last: d.last
  }
}

export async function sendMessage(threadId: number | string, content: string, messageType: string = 'TEXT', attachmentUrl?: string): Promise<void> {
  const res = await api.post(`${BASE}/${threadId}/messages`, { content, messageType, attachmentUrl })
  if (res.error) throw new Error(res.error)
}

export async function markThreadAsRead(threadId: number | string): Promise<void> {
  const res = await api.put(`${BASE}/${threadId}/read`, {})
  if (res.error) throw new Error(res.error)
}
