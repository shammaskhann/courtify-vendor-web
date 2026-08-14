import type { Deal } from '@/types/models'

export const mockDeals: Deal[] = [
  // 2x PERCENTAGE_OFF
  {
    id: 'deal-001', name: 'Weekend Saver', dealType: 'PERCENTAGE_OFF', dealValue: 20,
    applicableDays: ['SATURDAY', 'SUNDAY'], validFrom: '2026-06-01', validTo: '2026-09-30',
    maxUses: 200, usesCount: 87, promoCode: 'WEEKEND20', priority: 2, isStackable: false,
    isActive: true, venueId: 1, applyOnAllCourts: true, courtIds: [], applicableStartTime: null, applicableEndTime: null,
    buyQuantity: null, getFreeQuantity: null, createdAt: '2026-05-28T10:00:00Z',
  },
  {
    id: 'deal-002', name: 'Early Bird', dealType: 'PERCENTAGE_OFF', dealValue: 15,
    applicableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    validFrom: '2026-07-01', validTo: '2026-08-31',
    maxUses: 100, usesCount: 42, promoCode: 'EARLY15', priority: 1, isStackable: true,
    isActive: true, venueId: 'venue-001', applyOnAllCourts: true, courtIds: [], applicableStartTime: '06:00 AM', applicableEndTime: '10:00 AM',
    buyQuantity: null, getFreeQuantity: null, createdAt: '2026-06-25T10:00:00Z',
  },
  // 2x FLAT_OFF
  {
    id: 'deal-003', name: 'Flat 500 Off', dealType: 'FLAT_OFF', dealValue: 500,
    applicableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
    validFrom: '2026-07-15', validTo: '2026-08-15',
    maxUses: 50, usesCount: 50, promoCode: 'FLAT500', priority: 3, isStackable: false,
    isActive: true, venueId: 1, applyOnAllCourts: true, courtIds: [], applicableStartTime: null, applicableEndTime: null,
    buyQuantity: null, getFreeQuantity: null, createdAt: '2026-07-10T10:00:00Z',
  },
  {
    id: 'deal-004', name: 'Lahore Special', dealType: 'FLAT_OFF', dealValue: 300,
    applicableDays: ['FRIDAY', 'SATURDAY', 'SUNDAY'],
    validFrom: '2026-06-01', validTo: '2026-07-15',
    maxUses: 80, usesCount: 65, promoCode: 'LHR300', priority: 2, isStackable: false,
    isActive: false, venueId: 'venue-002', applyOnAllCourts: true, courtIds: [], applicableStartTime: null, applicableEndTime: null,
    buyQuantity: null, getFreeQuantity: null, createdAt: '2026-05-25T10:00:00Z',
  },
  // 2x FIXED_PRICE
  {
    id: 'deal-005', name: 'Student Special', dealType: 'FIXED_PRICE', dealValue: 800,
    applicableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    validFrom: '2026-07-01', validTo: '2026-12-31',
    maxUses: 500, usesCount: 120, promoCode: 'STUDENT800', priority: 1, isStackable: false,
    isActive: true, venueId: 1, applyOnAllCourts: true, courtIds: [], applicableStartTime: '08:00 AM', applicableEndTime: '02:00 PM',
    buyQuantity: null, getFreeQuantity: null, createdAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 'deal-006', name: 'Night Owl', dealType: 'FIXED_PRICE', dealValue: 1000,
    applicableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
    validFrom: '2026-06-01', validTo: '2026-07-20',
    maxUses: 100, usesCount: 88, promoCode: 'NIGHTOWL', priority: 2, isStackable: false,
    isActive: false, venueId: 'venue-003', applyOnAllCourts: true, courtIds: [], applicableStartTime: '08:00 PM', applicableEndTime: '11:00 PM',
    buyQuantity: null, getFreeQuantity: null, createdAt: '2026-05-15T10:00:00Z',
  },
  // 2x BUY_X_GET_Y
  {
    id: 'deal-007', name: 'Buy 3 Get 1 Free', dealType: 'BUY_X_GET_Y', dealValue: 0,
    applicableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
    validFrom: '2026-08-01', validTo: '2026-10-31',
    maxUses: 150, usesCount: 12, promoCode: 'BUY3GET1', priority: 1, isStackable: false,
    isActive: true, venueId: 1, applyOnAllCourts: true, courtIds: [], applicableStartTime: null, applicableEndTime: null,
    buyQuantity: 3, getFreeQuantity: 1, createdAt: '2026-07-28T10:00:00Z',
  },
  {
    id: 'deal-008', name: 'Doubles Deal', dealType: 'BUY_X_GET_Y', dealValue: 0,
    applicableDays: ['SATURDAY', 'SUNDAY'],
    validFrom: '2026-07-01', validTo: '2026-09-30',
    maxUses: 60, usesCount: 5, promoCode: 'DOUBLE2', priority: 2, isStackable: true,
    isActive: false, venueId: 'venue-001', applyOnAllCourts: false, courtIds: ['court-001'], applicableStartTime: null, applicableEndTime: null,
    buyQuantity: 2, getFreeQuantity: 1, createdAt: '2026-06-28T10:00:00Z',
  },
]
