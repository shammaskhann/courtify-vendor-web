'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { BookingDetailSlideOver } from '@/components/bookings/BookingDetailSlideOver'
import { getBookings, updateBookingStatus } from '@/lib/api/bookingApi'
import { getVenues } from '@/lib/api/venueApi'
import type { Booking, Venue } from '@/types/models'
import { PAYMENT_STATUSES } from '@/types/models'
import { useSearchParams, useRouter } from 'next/navigation'

export default function BookingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const venueIdParam = searchParams.get('venueId')

  const [bookings, setBookings] = useState<Booking[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  // Pagination & Filtering
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, any>>(
    venueIdParam ? { venueId: venueIdParam } : {}
  )
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const pageSize = 15

  // Details SlideOver
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Quick Actions
  const [updatingId, setUpdatingId] = useState<string | number | null>(null)

  const handleQuickStatusChange = async (e: React.MouseEvent, id: string | number, newStatus: Booking['status']) => {
    e.stopPropagation()
    try {
      setUpdatingId(id)
      await updateBookingStatus(id, newStatus)
      await fetchData()
    } catch (error) {
      console.error('Failed to update booking status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const combinedFilters = { ...filters }
      if (activeTab !== 'ALL') {
        combinedFilters.status = activeTab
      }

      const [bookingsRes, venuesRes] = await Promise.all([
        getBookings({ page, pageSize: pageSize, ...combinedFilters }),
        getVenues({ pageSize: 100 })
      ])
      setBookings(bookingsRes.data)
      setTotal(bookingsRes.total)
      setVenues(venuesRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, filters, activeTab])

  // Update URL visually if param changes
  useEffect(() => {
    if (venueIdParam && filters.venueId !== venueIdParam) {
      router.replace('/bookings', undefined)
    }
  }, [filters, venueIdParam, router])

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setPage(1)
  }

  const handleRowClick = (booking: Booking) => {
    setDetailBooking(booking)
    setIsDetailOpen(true)
  }

  const venueOptions = venues.map(v => ({ label: v.name, value: v.id }))

  const tabs = [
    { label: 'All Bookings', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ]

  const columns: import('@/components/ui/DataTable').ColumnDef<Booking>[] = [
    {
      header: 'Customer',
      render: (booking: Booking) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{booking.customerName || `User #${booking.userId || booking.customerId || 'Unknown'}`}</span>
          <span className="text-caption text-secondary">{booking.customerContact || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Venue & Court',
      render: (booking: Booking) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{booking.venueName || `Venue #${booking.venueId || 'Unknown'}`}</span>
          <span className="text-caption text-secondary">{booking.courtName || `Court #${booking.courtId || 'Unknown'}`}</span>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      render: (booking: Booking) => (
        <div className="flex flex-col">
          <span className="text-body-sm font-medium text-primary">
            {new Date(booking.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-caption text-secondary">
            {booking.startTime} ({booking.durationMinutes}m)
          </span>
        </div>
      ),
    },
    {
      header: 'Amount',
      align: 'right' as const,
      render: (booking: Booking) => (
        <div className="flex flex-col items-end">
          <span className="font-medium text-primary">PKR {(booking.amount ?? booking.totalAmount ?? 0).toLocaleString()}</span>
          <StatusBadge status={booking.paymentStatus} className="mt-1 scale-90 origin-right" />
        </div>
      ),
    },
    {
      header: 'Status',
      align: 'right' as const,
      render: (booking: Booking) => (
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={booking.status} />
        </div>
      ),
    },
    {
      header: '', // Actions
      align: 'right' as const,
      render: (booking: Booking) => {
        if (booking.status === 'PENDING') {
          return (
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleQuickStatusChange(e, booking.id, 'REJECTED')}
                disabled={updatingId === booking.id}
                className="px-2 py-1 text-[11px] font-medium text-error hover:bg-error-bg rounded"
              >
                Reject
              </button>
              <button
                onClick={(e) => handleQuickStatusChange(e, booking.id, 'CONFIRMED')}
                disabled={updatingId === booking.id}
                className="px-2 py-1 text-[11px] font-medium bg-brand text-white hover:bg-brand-hover rounded"
              >
                Confirm
              </button>
            </div>
          )
        }
        if (booking.status === 'CONFIRMED') {
          return (
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleQuickStatusChange(e, booking.id, 'COMPLETED')}
                disabled={updatingId === booking.id}
                className="px-2 py-1 text-[11px] font-medium bg-success text-white hover:bg-success/90 rounded"
              >
                Mark Complete
              </button>
            </div>
          )
        }
        return null
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <PageHeader
        title="Bookings"
        subtitle="Manage all your customer reservations and schedules."
      />

      <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col h-full">
        {/* Tabs */}
        <div className="flex items-center overflow-x-auto border-b border-border hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-6 py-4 text-body-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.value
                  ? 'border-brand text-primary'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border bg-surface-variant/30">
          <FilterBar
            configs={[
              { key: 'search', label: 'Search', type: 'search', placeholder: 'Search by name, ref...' },
              { key: 'venueId', label: 'Venue', type: 'select', options: venueOptions },
              { key: 'paymentStatus', label: 'Payment', type: 'select', options: PAYMENT_STATUSES.map(s => ({ label: s, value: s })) },
              { key: 'dateRange', label: 'Date', type: 'select', options: [
                { label: 'Today', value: 'today' },
                { label: 'Tomorrow', value: 'tomorrow' },
                { label: 'Next 7 Days', value: 'next_7' },
                { label: 'This Month', value: 'this_month' },
              ]},
            ]}
            onFilterChange={handleFilterChange}
            className="border-none shadow-none bg-transparent p-0"
          />
        </div>

        {/* Table */}
        <div className="flex-1">
          <DataTable
            data={bookings}
            columns={columns}
            isLoading={isLoading}
            keyExtractor={(b) => String(b.id)}
            onRowClick={handleRowClick}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            emptyStateTitle="No bookings found"
            emptyStateDescription="There are no bookings matching your current filters."
            className="border-0 shadow-none rounded-none"
          />
        </div>
      </div>

      <BookingDetailSlideOver
        booking={detailBooking}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onStatusChange={fetchData}
      />
    </div>
  )
}
