'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { getAllBookings, updateBookingStatus, deleteBooking } from '@/lib/api/adminApi'
import { Trash2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Booking } from '@/types/models'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [confirm, setConfirm] = useState<{ open: boolean; booking?: Booking; action?: 'DELETE' | string }>({ open: false })

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const resp = await getAllBookings({ page, size: 20, ...filters })
      setBookings(resp.data || [])
      setTotalPages(Math.max(1, Math.ceil(resp.total / 20)))
      setTotalElements(resp.total)
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [page, filters])

  const handleAction = async () => {
    if (!confirm.booking || !confirm.action) return
    try {
      if (confirm.action === 'DELETE') {
        await deleteBooking(confirm.booking.id)
        toast.success('Booking permanently deleted.')
      } else {
        await updateBookingStatus(confirm.booking.id, confirm.action)
        toast.success(`Booking status updated to ${confirm.action}.`)
      }
      setConfirm({ open: false })
      fetchBookings()
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    }
  }

  const columns = [
    {
      header: 'ID',
      accessor: (b: Booking) => (
        <span className="font-medium text-primary">#{b.id}</span>
      )
    },
    {
      header: 'Venue & Court',
      accessor: (booking: Booking) => {
        const displayString = booking.courtName || booking.venueName || '-';
        return (
          <div className="flex items-center max-w-[250px]">
            <span className="font-medium text-primary truncate" title={displayString}>
              {displayString}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Date & Time',
      accessor: (booking: Booking) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">
            {new Date(booking.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-xs text-secondary">
            {booking.startTime} ({booking.durationMinutes}m)
          </span>
        </div>
      ),
    },
    {
      header: 'Amount',
      align: 'right' as const,
      accessor: (booking: Booking) => (
        <div className="flex flex-col items-end">
          <span className="font-medium text-primary">PKR {(booking.amount ?? booking.totalAmount ?? 0).toLocaleString()}</span>
          <StatusBadge status={booking.paymentStatus} className="mt-1 scale-90 origin-right" />
        </div>
      ),
    },
    {
      header: 'Status',
      align: 'center' as const,
      accessor: (booking: Booking) => (
        <StatusBadge status={booking.status} />
      ),
    },
    {
      header: 'Actions',
      align: 'right' as const,
      accessor: (b: Booking) => (
        <div className="flex items-center justify-end gap-1">
          {b.status === 'PENDING' && (
            <Button variant="ghost" size="sm" className="p-1 h-8 text-success hover:bg-success/10" title="Confirm" onClick={() => setConfirm({ open: true, booking: b, action: 'CONFIRMED' })}>
              <CheckCircle size={16} />
            </Button>
          )}
          {b.status !== 'CANCELLED' && b.status !== 'REJECTED' && (
            <Button variant="ghost" size="sm" className="p-1 h-8 text-warning hover:bg-warning/10" title="Cancel/Reject" onClick={() => setConfirm({ open: true, booking: b, action: 'CANCELLED' })}>
              <XCircle size={16} />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="p-1 h-8 text-error hover:bg-error/10" title="Delete" onClick={() => setConfirm({ open: true, booking: b, action: 'DELETE' })}>
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="All Bookings"
        subtitle="Global search and management of platform bookings."
      />

      <FilterBar
        configs={[
          { key: 'keyword', label: 'Search', type: 'search', placeholder: 'Ref ID, Customer, Court...' },
          { key: 'venueId', label: 'Venue ID', type: 'search', placeholder: 'Filter by Venue ID...' },
          { key: 'status', label: 'Status', type: 'select', options: [
            { label: 'Pending', value: 'PENDING' },
            { label: 'Confirmed', value: 'CONFIRMED' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Cancelled', value: 'CANCELLED' }
          ]}
        ]}
        onFilterChange={(f) => {
          setFilters(f)
          setPage(0)
        }}
      />

      <div className="bg-surface rounded-xl border border-border overflow-hidden mt-2">
        <DataTable
          columns={columns as any}
          data={bookings}
          isLoading={loading}
          keyExtractor={(b) => b.id.toString()}
          emptyStateTitle="No bookings found"
          emptyStateDescription="Try adjusting your filters or search term."
        />

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-secondary">
              Showing page {page + 1} of {totalPages} ({totalElements} total)
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false })}
        onConfirm={handleAction}
        title={confirm.action === 'DELETE' ? 'Delete Booking' : 'Update Booking Status'}
        message={confirm.action === 'DELETE' 
          ? `Are you sure you want to permanently delete this booking? This action cannot be undone.` 
          : `Change the status of this booking to ${confirm.action}?`}
        confirmVariant={confirm.action === 'DELETE' ? 'danger' : 'primary'}
        confirmLabel={confirm.action === 'DELETE' ? 'Delete Permanently' : 'Update Status'}
      />
    </div>
  )
}
