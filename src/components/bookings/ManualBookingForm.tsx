'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { SlideOver } from '../ui/SlideOver'
import { Button } from '../ui/Button'
import { Input } from '../forms/Input'
import { Dropdown } from '../forms/Dropdown'
import { createManualBooking } from '@/lib/api/bookingApi'
import { getCourts } from '@/lib/api/courtApi'
import { suggestBookingPrice } from '@/lib/pricing'
import { toDateKey } from '@/lib/analytics-derive'
import type { Court, Venue } from '@/types/models'
import { Phone, Mail, User, Banknote } from 'lucide-react'

const DURATION_OPTIONS = [
  { label: '30 minutes', value: '30' },
  { label: '1 hour', value: '60' },
  { label: '1 hour 30 minutes', value: '90' },
  { label: '2 hours', value: '120' },
  { label: '3 hours', value: '180' },
]

const PAYMENT_OPTIONS = [
  { label: 'Paid (cash at counter)', value: 'PAID' },
  { label: 'Unpaid — collect later', value: 'PENDING' },
]

/** "18:30" → "06:30 PM", matching the format CourtForm sends for court hours. */
function toApiTime(value: string): string {
  const [rawHours, minutes] = value.split(':')
  let hours = parseInt(rawHours, 10)
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number)
  const total = (hours * 60 + mins + minutes) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

interface ManualBookingFormProps {
  isOpen: boolean
  onClose: () => void
  venues: Venue[]
  onCreated: () => void
}

export function ManualBookingForm({ isOpen, onClose, venues, onCreated }: ManualBookingFormProps) {
  const [courts, setCourts] = useState<Court[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [priceTouched, setPriceTouched] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const [form, setForm] = useState({
    venueId: '',
    courtId: '',
    bookingDate: toDateKey(new Date()),
    startTime: '18:00',
    duration: '60',
    customerName: '',
    customerContact: '',
    customerEmail: '',
    amount: '',
    paymentStatus: 'PAID',
    notes: '',
  })

  const update = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }))

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    getCourts({ pageSize: 200 })
      .then((res) => { if (isMounted) setCourts(res.data) })
      .catch(() => { if (isMounted) setCourts([]) })

    return () => { isMounted = false }
  }, [isOpen])

  const venueOptions = useMemo(
    () => venues.map((venue) => ({ label: venue.name, value: String(venue.id) })),
    [venues]
  )

  const courtOptions = useMemo(
    () => courts
      .filter((court) => !form.venueId || String(court.venueId) === form.venueId)
      .map((court) => ({ label: court.name || court.courtName || `Court #${court.id}`, value: String(court.id) })),
    [courts, form.venueId]
  )

  const selectedCourt = courts.find((court) => String(court.id) === form.courtId)

  const suggestedPrice = useMemo(() => {
    if (!selectedCourt || !form.bookingDate || !form.startTime) return null
    const date = new Date(`${form.bookingDate}T00:00:00`)
    if (Number.isNaN(date.getTime())) return null
    return suggestBookingPrice(selectedCourt, date, form.startTime, Number(form.duration))
  }, [selectedCourt, form.bookingDate, form.startTime, form.duration])

  // Keep the amount in step with the court's configured rate until the owner overrides it.
  useEffect(() => {
    if (priceTouched) return
    update({ amount: suggestedPrice === null ? '' : String(suggestedPrice) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedPrice, priceTouched])

  const resetAndClose = () => {
    setForm({
      venueId: '', courtId: '', bookingDate: toDateKey(new Date()), startTime: '18:00',
      duration: '60', customerName: '', customerContact: '', customerEmail: '',
      amount: '', paymentStatus: 'PAID', notes: '',
    })
    setPriceTouched(false)
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.venueId) return setError('Select a venue.')
    if (!form.courtId) return setError('Select a court.')
    if (!form.customerName.trim()) return setError('Customer name is required.')
    if (!form.customerContact.trim()) return setError('Customer phone number is required.')
    if (!form.amount || Number(form.amount) < 0) return setError('Enter the amount for this booking.')

    try {
      setIsSubmitting(true)
      await createManualBooking({
        venueId: Number(form.venueId),
        courtId: Number(form.courtId),
        bookingDate: form.bookingDate,
        startTime: `${form.startTime}:00`,
        endTime: `${addMinutes(form.startTime, Number(form.duration))}:00`,
        customerName: form.customerName.trim(),
        customerContact: form.customerContact.trim(),
        customerEmail: form.customerEmail.trim() || undefined,
        amount: Number(form.amount),
        paymentStatus: form.paymentStatus as 'PAID' | 'PENDING',
        notes: form.notes.trim() || undefined,
      })

      onCreated()
      resetAndClose()
    } catch (err) {
      setError((err as Error).message || 'Could not create this booking.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const endTimeLabel = form.startTime
    ? toApiTime(addMinutes(form.startTime, Number(form.duration)))
    : ''

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={resetAndClose}
      title="New booking"
      subtitle="Record a booking taken over the phone or at the counter."
      width="lg"
      footer={
        <>
          <Button variant="secondary" onClick={resetAndClose} className="mr-auto">
            Cancel
          </Button>
          <Button onClick={() => formRef.current?.requestSubmit()} variant="primary" isLoading={isSubmitting}>
            Create booking
          </Button>
        </>
      }
    >
      <form ref={formRef} id="manual-booking-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error-text text-body-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-body font-semibold text-primary">Slot</h4>

          <Dropdown
            label="Venue"
            required
            options={venueOptions}
            value={form.venueId}
            onChange={(e) => update({ venueId: e.target.value, courtId: '' })}
          />

          <Dropdown
            label="Court"
            required
            options={courtOptions}
            value={form.courtId}
            onChange={(e) => update({ courtId: e.target.value })}
            disabled={!form.venueId}
            helperText={!form.venueId ? 'Choose a venue first.' : undefined}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              required
              value={form.bookingDate}
              onChange={(e) => update({ bookingDate: e.target.value })}
            />
            <Input
              label="Start time"
              type="time"
              required
              value={form.startTime}
              onChange={(e) => update({ startTime: e.target.value })}
              onClick={(e) => {
                try {
                  ;(e.target as HTMLInputElement).showPicker()
                } catch (err) {}
              }}
            />
          </div>

          <Dropdown
            label="Duration"
            options={DURATION_OPTIONS}
            value={form.duration}
            onChange={(e) => update({ duration: e.target.value })}
            helperText={endTimeLabel ? `Ends at ${endTimeLabel}` : undefined}
          />
        </div>

        <div className="space-y-4 pt-2 border-t border-border">
          <h4 className="text-body font-semibold text-primary pt-4">Customer</h4>

          <Input
            label="Full name"
            required
            value={form.customerName}
            onChange={(e) => update({ customerName: e.target.value })}
            placeholder="e.g. Hassan Ali"
            leftIcon={<User size={16} />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              required
              value={form.customerContact}
              onChange={(e) => update({ customerContact: e.target.value })}
              placeholder="03001234567"
              leftIcon={<Phone size={16} />}
            />
            <Input
              label="Email (optional)"
              type="email"
              value={form.customerEmail}
              onChange={(e) => update({ customerEmail: e.target.value })}
              leftIcon={<Mail size={16} />}
            />
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-border">
          <h4 className="text-body font-semibold text-primary pt-4">Payment</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount (PKR)"
              type="number"
              required
              value={form.amount}
              onChange={(e) => { setPriceTouched(true); update({ amount: e.target.value }) }}
              leftIcon={<Banknote size={16} />}
              helperText={
                suggestedPrice !== null
                  ? `Court rate: PKR ${suggestedPrice.toLocaleString()}`
                  : 'No rate configured for this slot.'
              }
            />
            <Dropdown
              label="Payment status"
              options={PAYMENT_OPTIONS}
              value={form.paymentStatus}
              onChange={(e) => update({ paymentStatus: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="manual-booking-notes" className="text-label text-primary">
              Notes (optional)
            </label>
            <textarea
              id="manual-booking-notes"
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
              rows={3}
              placeholder="Anything the front desk should know."
              className="w-full px-3 py-2 rounded-md bg-surface border border-border text-body text-primary outline-none transition-all duration-base focus:border-brand focus:ring-2 focus:ring-brand resize-none"
            />
          </div>
        </div>
      </form>
    </SlideOver>
  )
}
