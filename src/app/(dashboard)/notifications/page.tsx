'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Bell, CalendarCheck, Clock, ShieldAlert, Tag, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Mock static data for notifications
const initialNotifications = [
  { id: '1', type: 'BOOKING_NEW', title: 'New Booking Received', message: 'Hassan Ali booked Futsal Court A for tomorrow at 8:00 PM.', time: '10 mins ago', isRead: false },
  { id: '2', type: 'PAYMENT_RECEIVED', title: 'Payment Confirmed', message: 'Payment of PKR 2,500 received for Booking #BKG-847.', time: '1 hour ago', isRead: false },
  { id: '3', type: 'BOOKING_STATUS_CHANGE', title: 'Booking Cancelled', message: 'Booking #BKG-992 was cancelled by the customer.', time: '3 hours ago', isRead: true },
  { id: '4', type: 'DEAL_EXPIRING', title: 'Deal Expiring Soon', message: 'The "Summer Special 20%" deal expires in 2 days.', time: '1 day ago', isRead: true },
  { id: '5', type: 'SYSTEM', title: 'Platform Update', message: 'Courtify Vendor app has been updated to version 1.2.0.', time: '2 days ago', isRead: true },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'BOOKING_NEW': return <CalendarCheck size={18} className="text-brand" />
      case 'BOOKING_STATUS_CHANGE': return <Clock size={18} className="text-warning-text" />
      case 'PAYMENT_RECEIVED': return <CreditCard size={18} className="text-success-text" />
      case 'DEAL_EXPIRING': return <Tag size={18} className="text-error" />
      case 'SYSTEM': return <ShieldAlert size={18} className="text-primary" />
      default: return <Bell size={18} className="text-secondary" />
    }
  }

  const getIconBg = (type: string) => {
    switch(type) {
      case 'BOOKING_NEW': return 'bg-brand/10 border-brand/20'
      case 'BOOKING_STATUS_CHANGE': return 'bg-warning-text/10 border-warning-text/20'
      case 'PAYMENT_RECEIVED': return 'bg-success-text/10 border-success-text/20'
      case 'DEAL_EXPIRING': return 'bg-error/10 border-error/20'
      case 'SYSTEM': return 'bg-surface-variant border-border'
      default: return 'bg-surface-variant border-border'
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8 h-full max-w-4xl mx-auto w-full">
      <PageHeader
        title="Notifications"
        subtitle={`You have ${unreadCount} unread notifications.`}
        actions={
          <Button variant="secondary" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark all as read
          </Button>
        }
      />

      <div className="bg-surface border border-border rounded-xl shadow-sm divide-y divide-border flex flex-col">
        {notifications.length === 0 ? (
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
              onClick={() => markAsRead(notification.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${getIconBg(notification.type)}`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-body font-medium truncate ${notification.isRead ? 'text-primary' : 'text-primary font-semibold'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-[11px] text-secondary shrink-0 whitespace-nowrap ml-4">
                    {notification.time}
                  </span>
                </div>
                <p className={`text-body-sm text-secondary ${!notification.isRead && 'text-primary/90'}`}>
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
