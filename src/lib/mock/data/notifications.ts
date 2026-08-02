import type { Notification } from '@/types/models'

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001', type: 'BOOKING_NEW', title: 'New Booking Received',
    message: 'Ali Ahmed booked Court A at Alpha Sports Club for Jul 28, 10:00 AM - 11:00 AM.',
    isRead: false, relatedId: 'booking-001', relatedType: 'booking',
    createdAt: '2026-07-28T09:30:00Z',
  },
  {
    id: 'notif-002', type: 'PAYMENT_RECEIVED', title: 'Payment Received',
    message: 'Payment of PKR 1,500 received for booking BK-2026-0009.',
    isRead: false, relatedId: 'booking-009', relatedType: 'booking',
    createdAt: '2026-07-28T09:15:00Z',
  },
  {
    id: 'notif-003', type: 'BOOKING_NEW', title: 'New Booking Received',
    message: 'Sara Khan booked Squash Court 1 at Lahore Racquet Arena for Jul 29, 2:00 PM - 3:00 PM.',
    isRead: false, relatedId: 'booking-002', relatedType: 'booking',
    createdAt: '2026-07-28T08:45:00Z',
  },
  {
    id: 'notif-004', type: 'DEAL_EXPIRING', title: 'Deal Expiring Soon',
    message: 'Your deal "Flat 500 Off" expires on Aug 15, 2026. It has reached its maximum uses.',
    isRead: false, relatedId: 'deal-003', relatedType: 'deal',
    createdAt: '2026-07-28T08:00:00Z',
  },
  {
    id: 'notif-005', type: 'SYSTEM', title: 'Platform Update',
    message: 'Courtify has been updated to version 2.1. Check out new analytics features and improved booking management.',
    isRead: false, relatedId: null, relatedType: null,
    createdAt: '2026-07-28T07:00:00Z',
  },
  {
    id: 'notif-006', type: 'BOOKING_STATUS_CHANGE', title: 'Booking Cancelled',
    message: 'Booking BK-2026-0038 by Hassan Raza has been cancelled by the customer.',
    isRead: true, relatedId: 'booking-038', relatedType: 'booking',
    createdAt: '2026-07-27T18:30:00Z',
  },
  {
    id: 'notif-007', type: 'PAYMENT_RECEIVED', title: 'Payment Received',
    message: 'Payment of PKR 2,500 received for booking BK-2026-0015.',
    isRead: true, relatedId: 'booking-015', relatedType: 'booking',
    createdAt: '2026-07-27T16:00:00Z',
  },
  {
    id: 'notif-008', type: 'VENUE_REVIEW', title: 'New Review on Alpha Sports Club',
    message: 'A customer left a 5-star review: "Excellent facilities and very well maintained courts!"',
    isRead: true, relatedId: 'venue-001', relatedType: 'venue',
    createdAt: '2026-07-27T14:00:00Z',
  },
  {
    id: 'notif-009', type: 'BOOKING_NEW', title: 'New Booking Received',
    message: 'Fatima Noor booked Tennis Main at Islamabad Sports Complex for Jul 30, 4:00 PM - 5:00 PM.',
    isRead: true, relatedId: 'booking-004', relatedType: 'booking',
    createdAt: '2026-07-27T10:00:00Z',
  },
  {
    id: 'notif-010', type: 'SYSTEM', title: 'Scheduled Maintenance',
    message: 'Courtify will undergo scheduled maintenance on Aug 5, 2026 from 2:00 AM to 4:00 AM PKT. Some features may be temporarily unavailable.',
    isRead: true, relatedId: null, relatedType: null,
    createdAt: '2026-07-26T12:00:00Z',
  },
  {
    id: 'notif-011', type: 'DEAL_EXPIRING', title: 'Deal Expired',
    message: 'Your deal "Lahore Special" has expired as of Jul 15, 2026.',
    isRead: true, relatedId: 'deal-004', relatedType: 'deal',
    createdAt: '2026-07-16T00:00:00Z',
  },
  {
    id: 'notif-012', type: 'BOOKING_STATUS_CHANGE', title: 'Booking Completed',
    message: 'Booking BK-2026-0025 has been marked as completed.',
    isRead: true, relatedId: 'booking-025', relatedType: 'booking',
    createdAt: '2026-07-25T20:00:00Z',
  },
  {
    id: 'notif-013', type: 'PAYMENT_RECEIVED', title: 'Bulk Payment Summary',
    message: 'You received 5 payments totaling PKR 8,200 today.',
    isRead: true, relatedId: null, relatedType: null,
    createdAt: '2026-07-25T18:00:00Z',
  },
  {
    id: 'notif-014', type: 'VENUE_REVIEW', title: 'New Review on Lahore Racquet Arena',
    message: 'A customer left a 4-star review: "Good squash courts but parking can be limited on weekends."',
    isRead: true, relatedId: 'venue-002', relatedType: 'venue',
    createdAt: '2026-07-24T15:00:00Z',
  },
  {
    id: 'notif-015', type: 'BOOKING_NEW', title: 'New Booking Received',
    message: 'Bilal Hussain booked Padel Glass Court at Islamabad Sports Complex for Aug 1, 6:00 PM - 7:00 PM.',
    isRead: true, relatedId: 'booking-007', relatedType: 'booking',
    createdAt: '2026-07-24T09:00:00Z',
  },
]
