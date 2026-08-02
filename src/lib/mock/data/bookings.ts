import type { Booking } from '@/types/models'

const customers = [
  { id: 'cust-001', name: 'Ali Ahmed', email: 'ali.ahmed@email.com', contact: '+92 300 1234567' },
  { id: 'cust-002', name: 'Sara Khan', email: 'sara.khan@email.com', contact: '+92 312 9876543' },
  { id: 'cust-003', name: 'Usman Malik', email: 'usman.m@email.com', contact: '+92 321 5551234' },
  { id: 'cust-004', name: 'Fatima Noor', email: 'fatima.n@email.com', contact: '+92 333 4445566' },
  { id: 'cust-005', name: 'Hassan Raza', email: 'hassan.r@email.com', contact: '+92 345 6789012' },
  { id: 'cust-006', name: 'Ayesha Siddiqui', email: 'ayesha.s@email.com', contact: '+92 300 9998877' },
  { id: 'cust-007', name: 'Bilal Hussain', email: 'bilal.h@email.com', contact: '+92 311 2223344' },
  { id: 'cust-008', name: 'Zara Iqbal', email: 'zara.i@email.com', contact: '+92 302 7776655' },
]

const courtVenueMap: Record<string, { courtName: string; venueId: string; venueName: string }> = {
  'court-001': { courtName: 'Court A', venueId: 'venue-001', venueName: 'Alpha Sports Club' },
  'court-002': { courtName: 'Court B', venueId: 'venue-001', venueName: 'Alpha Sports Club' },
  'court-003': { courtName: 'Court C', venueId: 'venue-001', venueName: 'Alpha Sports Club' },
  'court-005': { courtName: 'Squash Court 1', venueId: 'venue-002', venueName: 'Lahore Racquet Arena' },
  'court-007': { courtName: 'Badminton Hall A', venueId: 'venue-002', venueName: 'Lahore Racquet Arena' },
  'court-009': { courtName: 'Pickleball Court', venueId: 'venue-002', venueName: 'Lahore Racquet Arena' },
  'court-010': { courtName: 'Tennis Main', venueId: 'venue-003', venueName: 'Islamabad Sports Complex' },
  'court-011': { courtName: 'Padel Glass Court', venueId: 'venue-003', venueName: 'Islamabad Sports Complex' },
}

const courtIds = Object.keys(courtVenueMap)

function makeBooking(i: number, overrides: Partial<Booking> = {}): Booking {
  const courtId = courtIds[i % courtIds.length]
  const cv = courtVenueMap[courtId]
  const cust = customers[i % customers.length]
  const baseDate = new Date('2026-07-01')
  baseDate.setDate(baseDate.getDate() + i)
  const dateStr = baseDate.toISOString().split('T')[0]
  const hour = 8 + (i % 12)
  const startTime = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
  const endHour = hour + 1
  const endTime = `${endHour > 12 ? endHour - 12 : endHour}:00 ${endHour >= 12 ? 'PM' : 'AM'}`

  return {
    id: `booking-${String(i + 1).padStart(3, '0')}`,
    bookingReference: `BK-2026-${String(i + 1).padStart(4, '0')}`,
    venueId: cv.venueId,
    venueName: cv.venueName,
    courtId,
    courtName: cv.courtName,
    customerId: cust.id,
    customerName: cust.name,
    customerEmail: cust.email,
    customerContact: cust.contact,
    bookingDate: dateStr,
    startTime,
    endTime,
    durationMinutes: 60,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    amount: 1200 + (i * 100) % 2000,
    dealApplied: null,
    discountAmount: null,
    qrToken: `qr-token-${String(i + 1).padStart(3, '0')}`,
    notes: null,
    createdAt: new Date(baseDate.getTime() - 86400000).toISOString(),
    updatedAt: new Date(baseDate.getTime() - 86400000).toISOString(),
    ...overrides,
  }
}

export const mockBookings: Booking[] = [
  // 8 PENDING
  ...Array.from({ length: 8 }, (_, i) => makeBooking(i, { status: 'PENDING', paymentStatus: 'PENDING' })),
  // 15 CONFIRMED
  ...Array.from({ length: 15 }, (_, i) => makeBooking(i + 8, {
    status: 'CONFIRMED', paymentStatus: 'PAID',
    ...(i === 2 ? { dealApplied: 'Weekend Saver', discountAmount: 300 } : {}),
    ...(i === 5 ? { dealApplied: 'Early Bird', discountAmount: 200 } : {}),
    ...(i === 10 ? { notes: 'Customer requested extra towels and water bottles. VIP treatment.' } : {}),
  })),
  // 10 COMPLETED
  ...Array.from({ length: 10 }, (_, i) => makeBooking(i + 23, {
    status: 'COMPLETED', paymentStatus: 'PAID',
    ...(i === 3 ? { dealApplied: 'Flat 500 Off', discountAmount: 500 } : {}),
    ...(i === 7 ? { notes: 'Great session. Customer wants to book again next week.' } : {}),
  })),
  // 4 REJECTED
  ...Array.from({ length: 4 }, (_, i) => makeBooking(i + 33, {
    status: 'REJECTED', paymentStatus: 'REFUNDED',
    notes: i === 0 ? 'Court under maintenance.' : null,
  })),
  // 3 CANCELLED
  ...Array.from({ length: 3 }, (_, i) => makeBooking(i + 37, {
    status: 'CANCELLED',
    paymentStatus: i === 0 ? 'REFUNDED' : (i === 1 ? 'FAILED' : 'PENDING'),
    notes: i === 1 ? 'Payment failed. Customer did not rebook.' : null,
  })),
]
