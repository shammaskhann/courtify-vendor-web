'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Search } from 'lucide-react'
import { getAdminBookingsByVenue } from '@/lib/api/adminApi'
import type { Booking } from '@/types/models'

type BookingFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export default function AdminBookingsPage() {
  const [venueId, setVenueId] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [filter, setFilter] = useState<BookingFilter>('ALL')
  const [search, setSearch] = useState('')

  const handleSearchVenue = async () => {
    if (!venueId.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const resp = await getAdminBookingsByVenue(venueId)
      const data = Array.isArray(resp) ? resp : (resp as any).content || (resp as any).data || []
      setBookings(data)
    } catch (err) {
      console.error(String(err))
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = bookings.filter(b => {
    if (filter !== 'ALL' && b.status !== filter) return false
    const q = search.toLowerCase()
    if (!q) return true
    return (
      b.bookingReference.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.courtName.toLowerCase().includes(q)
    )
  })

  const filterTabs: { label: string, value: BookingFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ]

  const columns = [
    {
      header: 'Customer',
      render: (booking: Booking) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{booking.customerName}</span>
          <span className="text-caption text-secondary">{booking.customerContact}</span>
        </div>
      ),
    },
    {
      header: 'Venue & Court',
      render: (booking: Booking) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{booking.venueName || '-'}</span>
          <span className="text-caption text-secondary">{booking.courtName}</span>
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
          <span className="font-medium text-primary">PKR {booking.amount.toLocaleString()}</span>
          <StatusBadge status={booking.paymentStatus} className="mt-1 scale-90 origin-right" />
        </div>
      ),
    },
    {
      header: 'Status',
      align: 'right' as const,
      render: (booking: Booking) => (
        <StatusBadge status={booking.status} />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Admin Bookings Lookup"
        subtitle="Search bookings by Venue ID"
      />

      {/* Lookup Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex items-end gap-4 max-w-2xl">
        <div className="flex-1 space-y-1">
          <label htmlFor="venueId" className="text-sm font-medium text-body">Venue ID</label>
          <input
            id="venueId"
            type="text"
            placeholder="e.g. 1"
            className="field-input w-full"
            value={venueId}
            onChange={e => setVenueId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchVenue()}
          />
        </div>
        <Button onClick={handleSearchVenue} disabled={loading || !venueId.trim()}>
          <Search size={16} className="mr-2" />
          {loading ? 'Searching...' : 'Search Venue Bookings'}
        </Button>
      </div>

      {searched && !loading && (
        <>
          <div className="flex bg-surface-variant p-1 rounded-lg w-max">
            {filterTabs.map(t => (
              <button
                key={t.value}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === t.value ? 'bg-surface shadow-sm text-primary' : 'text-secondary hover:text-primary'}`}
                onClick={() => setFilter(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <FilterBar
            configs={[{ key: 'search', label: 'Search', type: 'search', placeholder: 'Search by reference, customer, or court...' }]}
            onFilterChange={(f) => setSearch(f.search || '')}
          />

          <div className="bg-surface rounded-xl border border-border overflow-hidden mt-4">
            <DataTable
              columns={columns}
              data={filtered}
              isLoading={loading}
              keyExtractor={(b) => b.id.toString()}
              emptyStateTitle="No bookings found"
              emptyStateDescription="Try adjusting your filters or search term."
            />
          </div>
        </>
      )}
    </div>
  )
}
