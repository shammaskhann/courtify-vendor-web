'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCourtById } from '@/lib/api/courtApi'
import { getVenueById } from '@/lib/api/venueApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import { MapPin, Info, Tag, Edit, Trash2 } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import type { Court, Venue } from '@/types/models'

export default function CourtDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [court, setCourt] = useState<Court | null>(null)
  const [venue, setVenue] = useState<Venue | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const courtRes = await getCourtById(params.id)
        if (!courtRes) {
          router.push(ROUTES.COURTS)
          return
        }
        setCourt(courtRes)
        
        if (courtRes.venueId) {
          const venueRes = await getVenueById(courtRes.venueId)
          setVenue(venueRes)
        }
      } catch (error) {
        console.error('Failed to load court details:', error)
        router.push(ROUTES.COURTS)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [params.id, router])

  if (isLoading || !court) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  const courtImages = court.images && court.images.length > 0 ? court.images : ['https://via.placeholder.com/800x400?text=No+Image']

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <PageHeader
        title={court.name || court.courtName || 'Court Details'}
        subtitle="View court details, pricing, and availability."
        backLink={ROUTES.COURTS}
      />

      {/* Hero Section */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row relative">
        <div className="absolute top-4 right-4 z-10">
          <StatusBadge status={!court.isDisabled ? 'ACTIVE' : 'INACTIVE'} />
        </div>
        <div className="md:w-1/3 h-48 md:h-auto relative">
          <img src={courtImages[0]} alt={court.name || court.courtName || 'Court Image'} className="w-full h-full object-cover" />
        </div>
        <div className="p-6 md:w-2/3 flex flex-col">
          <h2 className="text-h3 font-semibold text-primary mb-6">{court.name || court.courtName}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            <div className="flex items-start gap-3 bg-surface-variant p-3 rounded-lg border border-border">
              <div className="bg-surface p-2 rounded-md shrink-0 shadow-sm border border-border">
                <Tag size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-caption text-secondary mb-0.5">Sport Type</p>
                <p className="text-body-sm font-medium text-primary">
                  {court.sportType && court.sportType.length > 0 ? court.sportType.join(', ') : 'Not Specified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-surface-variant p-3 rounded-lg border border-border">
              <div className="bg-surface p-2 rounded-md shrink-0 shadow-sm border border-border">
                <Info size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-caption text-secondary mb-0.5">Hourly Rate</p>
                <p className="text-body-sm font-medium text-primary">PKR {court.constantPriceOffPeak?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Venue Details */}
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden p-6">
          <h4 className="text-body font-semibold text-primary mb-4">Venue Details</h4>
          {venue ? (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <img src={venue.venueImage || venue.image} alt={venue.name} className="w-16 h-16 rounded object-cover" />
                <div>
                  <p className="font-medium text-primary text-body">{venue.name}</p>
                  <p className="text-body-sm text-secondary">{venue.city}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-body-sm text-secondary">
                <MapPin size={16} className="shrink-0 mt-0.5 text-brand" />
                <span>{venue.address}</span>
              </div>
            </div>
          ) : (
            <p className="text-body-sm text-secondary">Venue information not available.</p>
          )}
        </div>
      </div>
    </div>
  )
}
