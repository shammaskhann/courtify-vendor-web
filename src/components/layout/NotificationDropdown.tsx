import { useState, useRef, useEffect } from 'react'
import { Bell, MessageCircle, Calendar, Info, AlertTriangle, Radio, Check, Loader2 } from 'lucide-react'
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/lib/api/notificationApi'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { Notification as AppNotification } from '@/types/models'
import { useInView } from 'react-intersection-observer'
import { toast } from 'react-hot-toast'

const ICONS = {
  CHAT: MessageCircle,
  BOOKING: Calendar,
  INFO: Info,
  SYSTEM: AlertTriangle,
  BROADCAST: Radio,
  BOOKING_NEW: Calendar,
  BOOKING_STATUS_CHANGE: Calendar,
  DEAL_EXPIRING: AlertTriangle,
  VENUE_REVIEW: MessageCircle,
  PAYMENT_RECEIVED: Info
}

const COLORS = {
  CHAT: 'text-blue-500 bg-blue-500/10',
  BOOKING: 'text-brand bg-brand/10',
  INFO: 'text-gray-400 bg-gray-500/10',
  SYSTEM: 'text-orange-500 bg-orange-500/10',
  BROADCAST: 'text-purple-500 bg-purple-500/10',
  BOOKING_NEW: 'text-brand bg-brand/10',
  BOOKING_STATUS_CHANGE: 'text-brand bg-brand/10',
  DEAL_EXPIRING: 'text-orange-500 bg-orange-500/10',
  VENUE_REVIEW: 'text-blue-500 bg-blue-500/10',
  PAYMENT_RECEIVED: 'text-green-500 bg-green-500/10'
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { ref: loadMoreRef, inView } = useInView()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000
  })

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 0 }) => getNotifications({ page: pageParam, pageSize: 10 }),
    getNextPageParam: (lastPage) => (lastPage as any).last ? undefined : lastPage.page + 1,
    initialPageParam: 0,
    enabled: isOpen,
  })

  // Real-time polling for new notifications
  const { data: latestData } = useQuery({
    queryKey: ['notifications-latest'],
    queryFn: () => getNotifications({ page: 0, pageSize: 5 }),
    refetchInterval: 30000 // Poll every 30 seconds
  })

  const seenIds = useRef<Set<string>>(new Set())
  const isInitialLoad = useRef(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (!latestData) return
    const newNotifications = latestData.data || (latestData as any).content || []
    
    if (isInitialLoad.current) {
      newNotifications.forEach((n: AppNotification) => seenIds.current.add(n.id))
      isInitialLoad.current = false
      return
    }

    let hasNewUnread = false

    newNotifications.forEach((n: AppNotification) => {
      if (!seenIds.current.has(n.id)) {
        seenIds.current.add(n.id)
        
        if (!n.isRead) {
          hasNewUnread = true
          const Icon = ICONS[n.type as keyof typeof ICONS] || Bell
          const colorClass = COLORS[n.type as keyof typeof COLORS] || 'text-primary bg-surface-variant'

          // Web App Toast Popup
          toast.custom((t) => (
            <div
              className={cn(
                "max-w-sm w-full bg-surface border border-border shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 transition-all",
                t.visible ? 'animate-enter' : 'animate-leave'
              )}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", colorClass)}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-primary">
                      {n.title}
                    </p>
                    <p className="mt-1 text-sm text-secondary line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-border">
                <button
                  onClick={() => {
                    toast.dismiss(t.id)
                    handleNotificationClick(n)
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-brand hover:text-brand-hover focus:outline-none"
                >
                  View
                </button>
              </div>
            </div>
          ), { duration: 5000, position: 'top-right' })

          // Browser Push Notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(n.title, { body: n.message })
          }
        }
      }
    })

    if (hasNewUnread) {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  }, [latestData, queryClient])

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const notifications = data?.pages.flatMap(p => p.data || (p as any).content) || []

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    }
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    }
  })

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id)
    }
    setIsOpen(false)

    if (notification.type === 'CHAT' && notification.relatedId) {
      router.push(`/messages?threadId=${notification.relatedId}`)
    } else if ((notification.type === 'BOOKING' || notification.type === 'BOOKING_NEW' || notification.type === 'BOOKING_STATUS_CHANGE') && notification.relatedId) {
      router.push(`/bookings/${notification.relatedId}`)
    } else if (notification.type === 'VENUE_REVIEW') {
      router.push(`/courts`)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative inline-flex items-center justify-center',
          'h-10 w-10 rounded-md text-secondary hover:text-primary hover:bg-surface-variant',
          'transition-all duration-base',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
        )}
        aria-label="Notifications"
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-error ring-2 ring-background" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-border flex items-center justify-between bg-surface-variant">
            <h3 className="font-semibold text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs font-medium text-brand hover:text-brand-hover transition-colors flex items-center gap-1"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-secondary text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-secondary text-sm flex flex-col items-center">
                <Bell size={24} className="mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => {
                  const Icon = ICONS[n.type as keyof typeof ICONS] || Bell
                  const colorClass = COLORS[n.type as keyof typeof COLORS] || 'text-primary bg-surface-variant'

                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        "w-full text-left p-4 hover:bg-surface-variant transition-colors flex gap-4 relative group",
                        !n.isRead && "bg-brand/5 hover:bg-brand/10"
                      )}
                    >
                      {!n.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />
                      )}
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", colorClass)}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium mb-0.5", !n.isRead ? "text-primary" : "text-secondary")}>
                          {n.title}
                        </p>
                        <p className="text-xs text-secondary line-clamp-2 mb-1">
                          {n.message}
                        </p>
                        <p className="text-[10px] font-medium opacity-60">
                          {n.time || new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </button>
                  )
                })}
                {hasNextPage && (
                  <div ref={loadMoreRef} className="p-4 flex justify-center">
                    {isFetchingNextPage ? <Loader2 size={16} className="animate-spin text-secondary" /> : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
