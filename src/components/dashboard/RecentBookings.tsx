import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge'
import { TableRowSkeleton } from '../ui/Skeleton'
import type { Booking } from '@/types/models'
import { ROUTES } from '@/lib/constants'

interface RecentBookingsProps {
  data?: Booking[]
  isLoading?: boolean
}

export function RecentBookings({ data, isLoading = false }: RecentBookingsProps) {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
        <h3 className="text-h4 font-semibold text-primary">Recent Bookings</h3>
        <Link 
          href={ROUTES.BOOKINGS}
          className="text-body-sm font-medium text-brand hover:text-brand-hover flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-body">
          <thead className="bg-surface-variant border-b border-border text-secondary text-caption font-semibold uppercase tracking-wider hidden sm:table-header-group">
            <tr>
              <th className="p-4 pl-6">Customer</th>
              <th className="p-4">Court & Time</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
            ) : data && data.length > 0 ? (
              data.map((booking) => (
                <tr key={booking.id} className="hover:bg-surface-variant/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-primary">{booking.customerName}</span>
                      <span className="text-caption text-secondary sm:hidden mt-0.5">{booking.bookingReference}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-body-sm font-medium text-primary">{booking.courtName}</span>
                      <span className="text-caption text-secondary">
                        {new Date(booking.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {booking.startTime}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <span className="font-medium text-primary">PKR {booking.amount.toLocaleString()}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-secondary">
                  No recent bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
