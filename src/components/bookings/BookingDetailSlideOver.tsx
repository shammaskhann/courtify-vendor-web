import { SlideOver } from '../ui/SlideOver'
import { StatusBadge } from '../ui/StatusBadge'
import { Calendar, Clock, MapPin, User, Mail, Phone, Building2, Ticket } from 'lucide-react'
import { Button } from '../ui/Button'
import type { Booking } from '@/types/models'
import { updateBookingStatus } from '@/lib/api/bookingApi'
import { useState } from 'react'

interface BookingDetailSlideOverProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: () => void // trigger refresh in parent
}

export function BookingDetailSlideOver({ booking, isOpen, onClose, onStatusChange }: BookingDetailSlideOverProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  if (!booking) return null

  const handleStatusChange = async (status: Booking['status']) => {
    try {
      setIsUpdating(true)
      await updateBookingStatus(booking.id, status)
      onStatusChange()
      onClose()
    } catch (error) {
      console.error('Failed to update booking status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} className="mr-auto">
        Close
      </Button>
      {booking.status === 'PENDING' && (
        <>
          <Button variant="destructive" onClick={() => handleStatusChange('REJECTED')} isLoading={isUpdating}>
            Reject
          </Button>
          <Button variant="primary" onClick={() => handleStatusChange('CONFIRMED')} isLoading={isUpdating}>
            Confirm Booking
          </Button>
        </>
      )}
      {booking.status === 'CONFIRMED' && (
        <Button variant="primary" onClick={() => handleStatusChange('COMPLETED')} isLoading={isUpdating}>
          Mark as Completed
        </Button>
      )}
    </>
  )

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
      subtitle={`Ref: ${booking.bookingReference}`}
      footer={footer}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-surface-variant p-4 rounded-xl border border-border">
          <div className="flex-1">
            <p className="text-caption text-secondary mb-1">Booking Status</p>
            <StatusBadge status={booking.status} />
          </div>
          <div className="flex-1 border-l border-border pl-4">
            <p className="text-caption text-secondary mb-1">Payment Status</p>
            <StatusBadge status={booking.paymentStatus} />
          </div>
        </div>

        <div>
          <h4 className="text-body font-semibold text-primary mb-3">Time & Location</h4>
          <div className="bg-surface border border-border rounded-lg divide-y divide-border">
            <div className="p-3 flex items-start gap-3">
              <Calendar size={18} className="text-brand shrink-0 mt-0.5" />
              <div>
                <p className="text-body-sm font-medium text-primary">
                  {new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="p-3 flex items-start gap-3">
              <Clock size={18} className="text-brand shrink-0 mt-0.5" />
              <div>
                <p className="text-body-sm font-medium text-primary">{booking.startTime} - {booking.endTime}</p>
                <p className="text-caption text-secondary">{booking.durationMinutes} minutes</p>
              </div>
            </div>
            <div className="p-3 flex items-start gap-3">
              <Building2 size={18} className="text-brand shrink-0 mt-0.5" />
              <div>
                <p className="text-body-sm font-medium text-primary">{booking.venueName}</p>
              </div>
            </div>
            <div className="p-3 flex items-start gap-3">
              <MapPin size={18} className="text-brand shrink-0 mt-0.5" />
              <div>
                <p className="text-body-sm font-medium text-primary">{booking.courtName}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-body font-semibold text-primary mb-3">Customer Information</h4>
          <div className="bg-surface border border-border rounded-lg divide-y divide-border">
            <div className="p-3 flex items-start gap-3">
              <User size={18} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <p className="text-body-sm font-medium text-primary">{booking.customerName}</p>
              </div>
            </div>
            <div className="p-3 flex items-start gap-3">
              <Mail size={18} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <a href={`mailto:${booking.customerEmail}`} className="text-body-sm text-brand hover:underline">
                  {booking.customerEmail}
                </a>
              </div>
            </div>
            <div className="p-3 flex items-start gap-3">
              <Phone size={18} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <a href={`tel:${booking.customerContact}`} className="text-body-sm text-brand hover:underline">
                  {booking.customerContact}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-body font-semibold text-primary mb-3">Payment Summary</h4>
          <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-body-sm">
              <span className="text-secondary">Subtotal</span>
              <span className="font-medium">PKR {(booking.amount + (booking.discountAmount || 0)).toLocaleString()}</span>
            </div>
            {booking.dealApplied && (
              <div className="flex justify-between text-body-sm text-success-text">
                <span className="flex items-center gap-1"><Ticket size={14} /> {booking.dealApplied}</span>
                <span>- PKR {(booking.discountAmount || 0).toLocaleString()}</span>
              </div>
            )}
            <div className="pt-2 border-t border-border flex justify-between text-body font-semibold">
              <span className="text-primary">Total Amount</span>
              <span className="text-brand">PKR {booking.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {booking.notes && (
          <div>
            <h4 className="text-body font-semibold text-primary mb-2">Customer Notes</h4>
            <div className="bg-surface-variant rounded-lg p-3 text-body-sm text-secondary italic border border-border">
              "{booking.notes}"
            </div>
          </div>
        )}
      </div>
    </SlideOver>
  )
}
