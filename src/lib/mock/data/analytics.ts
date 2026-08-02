import type { AnalyticsSummary } from '@/types/models'
import { mockBookings } from './bookings'

export const mockAnalytics: AnalyticsSummary = {
  summary: {
    total_courts: 14,
    total_bookings: 842,
    total_revenue: 1245000,
    occupancy_rate: 68,
  },
  revenue_overview: [
    { label: 'Mon', amount: 12000, date: '2026-07-27' },
    { label: 'Tue', amount: 15000, date: '2026-07-28' },
    { label: 'Wed', amount: 18000, date: '2026-07-29' },
    { label: 'Thu', amount: 22000, date: '2026-07-30' },
    { label: 'Fri', amount: 35000, date: '2026-07-31' },
    { label: 'Sat', amount: 48000, date: '2026-08-01' },
    { label: 'Sun', amount: 42000, date: '2026-08-02' },
  ],
  recent_bookings: mockBookings.slice(0, 8),
}
