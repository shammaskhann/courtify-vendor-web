import { useEffect, useState, useMemo } from 'react'
import { getCourtOccupiedSlotsRange } from '@/lib/api/courtApi'
import { format, addDays, startOfDay } from 'date-fns'
import { Skeleton } from '../ui/Skeleton'

interface CourtCalendarHeatmapProps {
  courtId: string
  openTime?: string // e.g., '06:00'
  closeTime?: string // e.g., '23:00'
}

export function CourtCalendarHeatmap({ courtId, openTime = '06:00:00', closeTime = '23:00:00' }: CourtCalendarHeatmapProps) {
  const [data, setData] = useState<Record<string, { startTime: string, endTime: string }[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  const { dates, startDate, endDate } = useMemo(() => {
    const start = startOfDay(new Date())
    const dts = Array.from({ length: 7 }).map((_, i) => addDays(start, i))
    return {
      dates: dts,
      startDate: format(dts[0], 'yyyy-MM-dd'),
      endDate: format(dts[6], 'yyyy-MM-dd')
    }
  }, [])

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    getCourtOccupiedSlotsRange(courtId, startDate, endDate)
      .then(res => {
        if (mounted) setData(res)
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setIsLoading(false)
      })
    return () => { mounted = false }
  }, [courtId, startDate, endDate])

  const hours = useMemo(() => {
    const startHour = parseInt(openTime.split(':')[0], 10)
    let endHour = parseInt(closeTime.split(':')[0], 10)
    // Handle midnight close time or next day close time
    if (endHour <= startHour && endHour !== 0) {
      endHour = 24
    } else if (endHour === 0) {
      endHour = 24
    }
    
    const hrs = []
    for (let h = startHour; h < endHour; h++) {
      hrs.push(h)
    }
    return hrs
  }, [openTime, closeTime])

  const isHourOccupied = (dateStr: string, hour: number) => {
    const slots = data[dateStr] || []
    return slots.some(slot => {
      const slotStart = parseInt(slot.startTime.split(':')[0], 10)
      const slotEnd = parseInt(slot.endTime.split(':')[0], 10)
      // Simple hour containment check (assumes bookings are mostly hourly)
      return hour >= slotStart && hour < slotEnd
    })
  }

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4 mt-6">
        <h4 className="text-body font-semibold text-primary mb-3">7-Day Utilization</h4>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
             <div key={i} className="space-y-1 flex flex-col items-center">
               <Skeleton className="h-4 w-8 mb-2" />
               {Array.from({ length: 12 }).map((_, j) => (
                 <Skeleton key={j} className="h-6 w-full rounded-sm" />
               ))}
             </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mt-6">
      <h4 className="text-body font-semibold text-primary mb-3">7-Day Utilization</h4>
      <div className="flex text-caption overflow-x-auto pb-2">
        <div className="w-12 pr-2 border-r border-border flex flex-col pt-6 shrink-0">
           {hours.map(h => (
              <div key={h} className="h-6 flex items-center justify-end pr-1 text-secondary text-[10px]">
                 {h}:00
              </div>
           ))}
        </div>
        <div className="flex-1 grid grid-cols-7 min-w-[300px] gap-1 pl-2">
          {dates.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd')
            return (
              <div key={dateStr} className="flex flex-col gap-1">
                <div className="text-center font-medium text-primary mb-1 pb-1 border-b border-border text-[11px]">
                  {format(date, 'EEE')}
                </div>
                {hours.map(hour => {
                  const occupied = isHourOccupied(dateStr, hour)
                  return (
                    <div
                      key={hour}
                      className={`h-6 rounded-sm border ${
                        occupied 
                          ? 'bg-brand/80 border-brand' 
                          : 'bg-surface-variant border-transparent'
                      }`}
                      title={`${format(date, 'MMM d')} ${hour}:00 - ${occupied ? 'Booked' : 'Available'}`}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 text-caption text-secondary justify-end">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-surface-variant rounded-sm border border-border" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-brand/80 rounded-sm border border-brand" />
          <span>Occupied</span>
        </div>
      </div>
    </div>
  )
}
