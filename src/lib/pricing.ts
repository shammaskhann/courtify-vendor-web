import type { Court, WeekDay } from '@/types/models'
import { parseTimeToMinutes } from '@/lib/analytics-derive'

/**
 * Resolves what a court costs at a given moment using the vendor's own pricing
 * configuration — the three pricing models plus the optional peak window.
 * Mirrors the rules the booking form in CourtForm writes.
 */

/** Indexed by `Date.getDay()` (0 = Sunday). */
const DAY_BY_INDEX: WeekDay[] = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY',
]

const WEEKEND: WeekDay[] = ['SATURDAY', 'SUNDAY']

export function isPeakTime(court: Court, startMinutes: number): boolean {
  const peakStart = parseTimeToMinutes(court.peakStartTime)
  const peakEnd = parseTimeToMinutes(court.peakEndTime)
  if (peakStart === null || peakEnd === null) return false

  // A window such as 21:00–01:00 wraps past midnight.
  return peakEnd > peakStart
    ? startMinutes >= peakStart && startMinutes < peakEnd
    : startMinutes >= peakStart || startMinutes < peakEnd
}

/** Hourly rate for the slot, or null when the court has no price configured for it. */
export function getCourtRatePerHour(court: Court, date: Date, startTime: string): number | null {
  const startMinutes = parseTimeToMinutes(startTime)
  if (startMinutes === null) return null

  const peak = isPeakTime(court, startMinutes)
  const day = DAY_BY_INDEX[date.getDay()]

  const pick = (peakValue: number | null | undefined, offPeakValue: number | undefined) => {
    const value = peak ? peakValue ?? offPeakValue : offPeakValue
    return typeof value === 'number' && value > 0 ? value : null
  }

  switch (court.pricingType) {
    case 'CONSTANT':
      return pick(court.constantPricePeak, court.constantPriceOffPeak)

    case 'WEEKDAY_WEEKEND':
      return WEEKEND.includes(day)
        ? pick(court.weekendPricePeak, court.weekendPriceOffPeak)
        : pick(court.weekdayPricePeak, court.weekdayPriceOffPeak)

    case 'PER_DAY':
      return pick(court.pricePerDayPeak?.[day], court.pricePerDayOffPeak?.[day])

    default:
      return null
  }
}

/** Suggested total for a slot, rounded to the rupee. Null when no rate applies. */
export function suggestBookingPrice(
  court: Court,
  date: Date,
  startTime: string,
  durationMinutes: number
): number | null {
  const rate = getCourtRatePerHour(court, date, startTime)
  if (rate === null || durationMinutes <= 0) return null

  return Math.round((rate * durationMinutes) / 60)
}

/** Returns the lowest off-peak rate for the court to display as a base price. */
export function getCourtBasePrice(court: Court): number {
  switch (court.pricingType) {
    case 'CONSTANT':
      return court.constantPriceOffPeak || 0
    case 'WEEKDAY_WEEKEND': {
      const wd = court.weekdayPriceOffPeak || 0
      const we = court.weekendPriceOffPeak || 0
      if (wd > 0 && we > 0) return Math.min(wd, we)
      return wd || we || 0
    }
    case 'PER_DAY':
      if (court.pricePerDayOffPeak) {
        const prices = Object.values(court.pricePerDayOffPeak).filter((p): p is number => typeof p === 'number' && p > 0)
        if (prices.length > 0) return Math.min(...prices)
      }
      return 0
    default:
      return 0
  }
}
