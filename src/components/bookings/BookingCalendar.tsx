'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'
import { cn } from '@/lib/utils'
import { bookingDurationMinutes, parseTimeToMinutes, toDateKey } from '@/lib/analytics-derive'
import type { Booking, BookingStatus } from '@/types/models'

export type CalendarView = 'day' | 'week' | 'month'

/** Matches the palette used by BookingStatusChart so colours read consistently. */
const STATUS_STYLES: Record<BookingStatus, { bar: string; chip: string }> = {
  CONFIRMED: { bar: 'bg-[#00C7E0]', chip: 'bg-[#00C7E0]/15 text-[#00C7E0] border-[#00C7E0]/30' },
  COMPLETED: { bar: 'bg-[#34C759]', chip: 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30' },
  PENDING: { bar: 'bg-[#FF9F0A]', chip: 'bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30' },
  CANCELLED: { bar: 'bg-[#8E8E93]', chip: 'bg-[#8E8E93]/15 text-[#8E8E93] border-[#8E8E93]/30' },
  REJECTED: { bar: 'bg-[#FF453A]', chip: 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30' },
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOUR_HEIGHT = 56
const DEFAULT_START_HOUR = 6
const DEFAULT_END_HOUR = 23

interface BookingCalendarProps {
  bookings: Booking[]
  view: CalendarView
  anchorDate: Date
  isLoading?: boolean
  onViewChange: (view: CalendarView) => void
  onAnchorDateChange: (date: Date) => void
  onSelectBooking: (booking: Booking) => void
}

/** Inclusive range of days the given view covers — also what the parent should fetch. */
export function getVisibleRange(view: CalendarView, anchor: Date): { start: Date; end: Date } {
  if (view === 'day') {
    const start = startOfDay(anchor)
    return { start, end: endOfDay(anchor) }
  }

  if (view === 'week') {
    const start = startOfDay(anchor)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return { start, end: endOfDay(end) }
  }

  // Month view renders whole weeks, so it can spill into neighbouring months.
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const start = startOfDay(first)
  start.setDate(start.getDate() - start.getDay())

  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
  const end = startOfDay(last)
  end.setDate(end.getDate() + (6 - end.getDay()))
  return { start, end: endOfDay(end) }
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display} ${period}`
}

function bookingLabel(booking: Booking): string {
  return booking.customerName || booking.courtName || `Booking #${booking.id}`
}

export function BookingCalendar({
  bookings,
  view,
  anchorDate,
  isLoading = false,
  onViewChange,
  onAnchorDateChange,
  onSelectBooking,
}: BookingCalendarProps) {
  const range = useMemo(() => getVisibleRange(view, anchorDate), [view, anchorDate])

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>()

    for (const booking of bookings) {
      const date = new Date(booking.bookingDate)
      if (Number.isNaN(date.getTime())) continue

      const key = toDateKey(date)
      const list = map.get(key)
      if (list) list.push(booking)
      else map.set(key, [booking])
    }

    for (const list of map.values()) {
      list.sort((a, b) => (parseTimeToMinutes(a.startTime) ?? 0) - (parseTimeToMinutes(b.startTime) ?? 0))
    }

    return map
  }, [bookings])

  const days = useMemo(() => {
    const result: Date[] = []
    const cursor = startOfDay(range.start)
    const last = startOfDay(range.end)
    while (cursor <= last) {
      result.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    return result
  }, [range])

  const step = (direction: -1 | 1) => {
    if (view === 'day') return onAnchorDateChange(addDays(anchorDate, direction))
    if (view === 'week') return onAnchorDateChange(addDays(anchorDate, direction * 7))
    onAnchorDateChange(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + direction, 1))
  }

  const title = useMemo(() => {
    if (view === 'day') {
      return anchorDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    }
    if (view === 'week') {
      const end = addDays(range.start, 6)
      const sameMonth = range.start.getMonth() === end.getMonth()
      const startLabel = range.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const endLabel = end.toLocaleDateString('en-US', sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' })
      return `${startLabel} – ${endLabel}, ${end.getFullYear()}`
    }
    return anchorDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [view, anchorDate, range])

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => step(-1)}
            aria-label="Previous"
            className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-variant transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => step(1)}
            aria-label="Next"
            className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-variant transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <h3 className="text-body font-semibold text-primary ml-1">{title}</h3>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onAnchorDateChange(new Date())}>
            Today
          </Button>
          <div className="flex items-center bg-surface-variant border border-border rounded-lg p-0.5">
            {(['day', 'week', 'month'] as CalendarView[]).map((option) => (
              <button
                key={option}
                onClick={() => onViewChange(option)}
                className={cn(
                  'px-3 py-1.5 text-caption font-medium rounded-md capitalize transition-colors',
                  view === option ? 'bg-surface text-primary shadow-sm' : 'text-secondary hover:text-primary'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : view === 'month' ? (
        <MonthGrid
          days={days}
          anchorDate={anchorDate}
          bookingsByDay={bookingsByDay}
          onSelectBooking={onSelectBooking}
          onSelectDay={(date) => { onAnchorDateChange(date); onViewChange('day') }}
        />
      ) : (
        <TimeGrid
          days={days}
          bookingsByDay={bookingsByDay}
          onSelectBooking={onSelectBooking}
        />
      )}
    </div>
  )
}

interface MonthGridProps {
  days: Date[]
  anchorDate: Date
  bookingsByDay: Map<string, Booking[]>
  onSelectBooking: (booking: Booking) => void
  onSelectDay: (date: Date) => void
}

function MonthGrid({ days, anchorDate, bookingsByDay, onSelectBooking, onSelectDay }: MonthGridProps) {
  const todayKey = toDateKey(new Date())

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-7 border-b border-border sticky top-0 bg-surface-variant z-10">
        {DAY_LABELS.map((label) => (
          <div key={label} className="p-2 text-center text-caption font-semibold text-secondary uppercase tracking-wider">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr min-h-full">
        {days.map((day) => {
          const key = toDateKey(day)
          const dayBookings = bookingsByDay.get(key) ?? []
          const isCurrentMonth = day.getMonth() === anchorDate.getMonth()
          const isToday = key === todayKey

          return (
            <div
              key={key}
              className={cn(
                'border-b border-r border-border p-1.5 min-h-[110px] flex flex-col gap-1',
                !isCurrentMonth && 'bg-surface-variant/40'
              )}
            >
              <button
                onClick={() => onSelectDay(day)}
                className={cn(
                  'self-start text-caption font-medium w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                  isToday ? 'bg-brand text-[#1C1C1E] font-bold' : 'text-secondary hover:bg-surface-variant hover:text-primary',
                  !isCurrentMonth && 'text-tertiary'
                )}
              >
                {day.getDate()}
              </button>

              {dayBookings.slice(0, 3).map((booking) => (
                <button
                  key={String(booking.id)}
                  onClick={() => onSelectBooking(booking)}
                  title={`${booking.startTime} · ${bookingLabel(booking)}`}
                  className={cn(
                    'text-left text-[11px] leading-tight px-1.5 py-1 rounded border truncate transition-transform hover:scale-[1.02]',
                    STATUS_STYLES[booking.status]?.chip ?? STATUS_STYLES.PENDING.chip
                  )}
                >
                  <span className="font-medium">{booking.startTime}</span> {bookingLabel(booking)}
                </button>
              ))}

              {dayBookings.length > 3 && (
                <button
                  onClick={() => onSelectDay(day)}
                  className="text-[11px] text-secondary hover:text-primary text-left px-1.5 font-medium"
                >
                  +{dayBookings.length - 3} more
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface TimeGridProps {
  days: Date[]
  bookingsByDay: Map<string, Booking[]>
  onSelectBooking: (booking: Booking) => void
}

function TimeGrid({ days, bookingsByDay, onSelectBooking }: TimeGridProps) {
  const visible = days.flatMap((day) => bookingsByDay.get(toDateKey(day)) ?? [])

  // Widen the grid only as far as the day's bookings actually require.
  const { startHour, endHour } = useMemo(() => {
    let earliest = DEFAULT_START_HOUR
    let latest = DEFAULT_END_HOUR

    for (const booking of visible) {
      const start = parseTimeToMinutes(booking.startTime)
      if (start !== null) earliest = Math.min(earliest, Math.floor(start / 60))

      const end = parseTimeToMinutes(booking.endTime)
      if (end !== null) latest = Math.max(latest, Math.ceil(end / 60))
    }

    return { startHour: Math.max(0, earliest), endHour: Math.min(24, Math.max(latest, earliest + 1)) }
  }, [visible])

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const gridStartMinutes = startHour * 60
  const todayKey = toDateKey(new Date())

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex min-w-[640px]">
        <div className="w-16 shrink-0 border-r border-border sticky left-0 bg-surface z-20">
          <div className="h-10 border-b border-border" />
          {hours.map((hour) => (
            <div key={hour} className="relative border-b border-border" style={{ height: HOUR_HEIGHT }}>
              <span className="absolute -top-2 right-2 text-[11px] text-tertiary whitespace-nowrap">
                {formatHour(hour)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex">
          {days.map((day) => {
            const key = toDateKey(day)
            const dayBookings = bookingsByDay.get(key) ?? []
            const lanes = assignLanes(dayBookings)
            const isToday = key === todayKey

            return (
              <div key={key} className="flex-1 min-w-[120px] border-r border-border last:border-r-0">
                <div
                  className={cn(
                    'h-10 border-b border-border flex flex-col items-center justify-center sticky top-0 bg-surface z-10',
                    isToday && 'bg-brand/5'
                  )}
                >
                  <span className="text-[11px] text-secondary uppercase tracking-wider">
                    {DAY_LABELS[day.getDay()]}
                  </span>
                  <span className={cn('text-body-sm font-semibold', isToday ? 'text-brand' : 'text-primary')}>
                    {day.getDate()}
                  </span>
                </div>

                <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
                  {hours.map((hour) => (
                    <div key={hour} className="border-b border-border" style={{ height: HOUR_HEIGHT }} />
                  ))}

                  {dayBookings.map((booking) => {
                    const start = parseTimeToMinutes(booking.startTime)
                    if (start === null) return null

                    const duration = Math.max(bookingDurationMinutes(booking), 30)
                    const top = ((start - gridStartMinutes) / 60) * HOUR_HEIGHT
                    const height = (duration / 60) * HOUR_HEIGHT
                    const lane = lanes.get(String(booking.id)) ?? { index: 0, total: 1 }

                    return (
                      <button
                        key={String(booking.id)}
                        onClick={() => onSelectBooking(booking)}
                        title={`${booking.startTime} – ${booking.endTime} · ${bookingLabel(booking)}`}
                        className={cn(
                          'absolute rounded-md border px-1.5 py-1 text-left overflow-hidden transition-shadow hover:shadow-md hover:z-10',
                          STATUS_STYLES[booking.status]?.chip ?? STATUS_STYLES.PENDING.chip
                        )}
                        style={{
                          top,
                          height: Math.max(height - 2, 18),
                          left: `${(lane.index / lane.total) * 100}%`,
                          width: `calc(${100 / lane.total}% - 4px)`,
                        }}
                      >
                        <span className="block text-[11px] font-semibold truncate">
                          {bookingLabel(booking)}
                        </span>
                        <span className="block text-[10px] opacity-80 truncate">
                          {booking.startTime} · {booking.courtName || `Court #${booking.courtId}`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * Side-by-side placement for bookings that overlap in time. Each cluster of
 * mutually overlapping bookings shares the column width evenly.
 */
function assignLanes(bookings: Booking[]): Map<string, { index: number; total: number }> {
  const lanes = new Map<string, { index: number; total: number }>()

  const intervals = bookings
    .map((booking) => {
      const start = parseTimeToMinutes(booking.startTime)
      if (start === null) return null
      return { id: String(booking.id), start, end: start + Math.max(bookingDurationMinutes(booking), 30) }
    })
    .filter((value): value is { id: string; start: number; end: number } => value !== null)
    .sort((a, b) => a.start - b.start)

  let cluster: typeof intervals = []
  let clusterEnd = -1

  const flush = () => {
    cluster.forEach((item, index) => {
      lanes.set(item.id, { index, total: cluster.length })
    })
    cluster = []
  }

  for (const interval of intervals) {
    if (cluster.length > 0 && interval.start >= clusterEnd) {
      flush()
      clusterEnd = -1
    }
    cluster.push(interval)
    clusterEnd = Math.max(clusterEnd, interval.end)
  }
  flush()

  return lanes
}
