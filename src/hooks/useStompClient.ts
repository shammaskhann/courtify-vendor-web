import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { authStorage } from '@/lib/auth-storage'
import { siteConfig } from '@/config/site'
import type { ChatMessageDto } from '@/types/models'

interface UseStompClientProps {
  userId?: number | string
  threadId?: number | string
  onMessage?: (msg: ChatMessageDto) => void
  onGlobalMessage?: (msg: ChatMessageDto) => void
  onRead?: (payload: { threadId: number, readBy: number }) => void
}

export function useStompClient({ userId, threadId, onMessage, onGlobalMessage, onRead }: UseStompClientProps) {
  const clientRef = useRef<Client | null>(null)
  const onMessageRef = useRef(onMessage)
  const onGlobalMessageRef = useRef(onGlobalMessage)
  const onReadRef = useRef(onRead)

  // Keep refs updated so we don't need to re-run effect on callback change
  useEffect(() => {
    onMessageRef.current = onMessage
    onGlobalMessageRef.current = onGlobalMessage
    onReadRef.current = onRead
  }, [onMessage, onGlobalMessage, onRead])

  useEffect(() => {
    if (!userId) return

    const baseUrl = siteConfig.apiBaseUrl || 'http://localhost:4000/api'
    // For Ngrok tunnels, SockJS often fails because of the HTTP intercept warning page.
    // Raw WebSockets bypass this HTTP-level intercept gracefully.
    const wsUrl = baseUrl.replace(/^http/, 'ws').endsWith('/api') 
      ? baseUrl.replace(/^http/, 'ws').replace(/\/api$/, '/api/ws') 
      : `${baseUrl.replace(/^http/, 'ws')}/ws`

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${authStorage.getToken()}`
      },
      debug: (_str) => {
        // console.log(_str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = () => {
      client.subscribe(`/topic/user.${userId}.chats`, (message) => {
        if (message.body && onGlobalMessageRef.current) {
          onGlobalMessageRef.current(JSON.parse(message.body))
        }
      })

      if (threadId) {
        client.subscribe(`/topic/thread.${threadId}`, (message) => {
          if (message.body && onMessageRef.current) {
            onMessageRef.current(JSON.parse(message.body))
          }
        })
        client.subscribe(`/topic/thread.${threadId}.read`, (message) => {
          if (message.body && onReadRef.current) {
            onReadRef.current(JSON.parse(message.body))
          }
        })
      }
    }

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [userId, threadId])

  return clientRef.current
}
