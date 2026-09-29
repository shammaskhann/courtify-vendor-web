'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Bell, CalendarCheck, Clock, ShieldAlert, Tag, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  getNotifications,
  markAsRead as markAsReadRequest,
  markAllAsRead as markAllAsReadRequest,
} from '@/lib/api/notificationApi'
import type { Notification as AppNotification } from '@/types/models'

function getIcon(type: string) {
  switch (type) {
    case 'BOOKING_NEW': return <CalendarCheck size={18} className="text-brand" />
    case 'BOOKING_STATUS_CHANGE': return <Clock size={18} className="text-warning-text" />
    case 'PAYMENT_RECEIVED': return <CreditCard size={18} className="text-success-text" />
    case 'DEAL_EXPIRING': return <Tag size={18} className="text-error" />
    case 'SYSTEM': return <ShieldAlert size={18} className="text-primary" />
    default: return <Bell size={18} className="text-secondary" />
  }
}

function getIconBg(type: string) {
  switch (type) {
    case 'BOOKING_NEW': return 'bg-brand/10 border-brand/20'
    case 'BOOKING_STATUS_CHANGE': return 'bg-warning-text/10 border-warning-text/20'
    case 'PAYMENT_RECEIVED': return 'bg-success-text/10 border-success-text/20'
    case 'DEAL_EXPIRING': return 'bg-error/10 border-error/20'
    default: return 'bg-surface-variant border-border'
  }
}

function formatTime(notification: AppNotification): string {
  if (notification.time) return notification.time
  if (!notification.createdAt) return ''

  const created = new Date(notification.createdAt)
  if (Number.isNaN(created.getTime())) return ''

  const minutes = Math.round((Date.now() - created.getTime()) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`

  return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await getNotifications({ page: 1, pageSize: 50 })
      setNotifications(res.data ?? [])
    } catch (err) {
      setError((err as Error).message || 'Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id)
    if (!target || target.isRead) return

    // Optimistic — reverted below if the request fails.
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )

    try {
      await markAsReadRequest(id)
    } catch {
      setNotifications((current) =>
        current.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    const previous = notifications

    setIsMarkingAll(true)
    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })))

    try {
      await markAllAsReadRequest()
    } catch (err) {
      setNotifications(previous)
      setError((err as Error).message || 'Failed to mark all as read')
    } finally {
      setIsMarkingAll(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8 h-full max-w-4xl mx-auto w-full">
      <PageHeader
        title="Notifications"
        subtitle={
          isLoading
            ? 'Loading your latest activity...'
            : `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`
        }
        actions={
          <Button
            variant="secondary"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isLoading}
            isLoading={isMarkingAll}
          >
            Mark all as read
          </Button>
        }
      />

      {error && (
        <div className="bg-error-bg text-error-text p-4 rounded-lg border border-error/20 flex items-center justify-between gap-4">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={fetchNotifications}>
            Retry
          </Button>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl shadow-sm divide-y divide-border flex flex-col">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full max-w-md" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-surface-variant rounded-full flex items-center justify-center mb-4 text-tertiary">
              <Bell size={24} />
            </div>
            <h3 className="text-h4 font-medium text-primary">All caught up!</h3>
            <p className="text-body text-secondary mt-1">You have no new notifications.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 flex gap-4 transition-colors hover:bg-surface-variant/50 cursor-pointer ${
                notification.isRead ? 'opacity-70' : 'bg-brand/5'
              }`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${getIconBg(notification.type)}`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-body truncate ${notification.isRead ? 'font-medium text-primary' : 'font-semibold text-primary'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-[11px] text-secondary shrink-0 whitespace-nowrap ml-4">
                    {formatTime(notification)}
                  </span>
                </div>
                <p className={`text-body-sm ${notification.isRead ? 'text-secondary' : 'text-primary/90'}`}>
                  {notification.message}
                </p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-brand shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
