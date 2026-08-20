'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { getCourtById } from '@/lib/api/courtApi'
import { getVenueById } from '@/lib/api/venueApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import { MapPin, Info, Tag, Edit3, Image as ImageIcon } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import type { Court, Venue } from '@/types/models'
import { CourtCalendarHeatmap } from '@/components/courts/CourtCalendarHeatmap'
import { SlideOver } from '@/components/ui/SlideOver'
import { CourtForm } from '@/components/courts/CourtForm'
import { VenueMap } from '@/components/common/VenueMap'
import { updateCourt } from '@/lib/api/courtApi'
import { CourtReviewsSection } from '@/components/reviews/CourtReviewsSection'

export default function CourtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const [court, setCourt] = useState<Court | null>(null)
  const [venue, setVenue] = useState<Venue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeEditSection, setActiveEditSection] = useState<'basic' | 'pricing' | 'schedule' | 'images' | null>(null)
  
  const fetchCourtData = async () => {
    try {
      const courtRes = await getCourtById(id)
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
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchCourtData().finally(() => setIsLoading(false))
  }, [id, router])

  const handleUpdateSection = async (data: any) => {
    try {
      await updateCourt(court!.venueId, court!.id, data)
      setActiveEditSection(null)
      await fetchCourtData()
    } catch (err) {
      console.error('Failed to update court:', err)
      throw err
    }
  }

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

  const hasPeak = court.peakStartTime && court.peakEndTime
  const peakWindowStr = hasPeak ? `${court.peakStartTime} - ${court.peakEndTime}` : 'None'

  const renderPricingShowcase = () => {
    switch (court.pricingType) {
      case 'WEEKDAY_WEEKEND':
        return (
          <div className="bg-surface-variant p-3 rounded-lg border border-border flex flex-col flex-grow md:max-w-[400px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-caption text-secondary">Weekday / Weekend Rates</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-1">
              <div>
                <span className="text-caption text-secondary block mb-0.5">Mon - Fri</span>
                <span className="text-body font-medium text-primary block">PKR {court.weekdayPriceOffPeak?.toLocaleString() || 0}/hr</span>
                {hasPeak && <span className="text-caption text-brand">Peak: PKR {court.weekdayPricePeak?.toLocaleString() || 0}/hr</span>}
              </div>
              <div>
                <span className="text-caption text-secondary block mb-0.5">Sat - Sun</span>
                <span className="text-body font-medium text-primary block">PKR {court.weekendPriceOffPeak?.toLocaleString() || 0}/hr</span>
                {hasPeak && <span className="text-caption text-brand">Peak: PKR {court.weekendPricePeak?.toLocaleString() || 0}/hr</span>}
              </div>
            </div>
            {hasPeak && <span className="text-caption text-secondary mt-2 border-t border-border pt-1.5">Peak Window: {peakWindowStr}</span>}
          </div>
        )
      case 'PER_DAY':
        return (
          <div className="bg-surface-variant p-3 rounded-lg border border-border flex flex-col flex-grow">
            <span className="text-caption text-secondary mb-2">Daily Rates {hasPeak && `(Peak: ${peakWindowStr})`}</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                const offPeak = court.pricePerDayOffPeak?.[day]
                const peak = court.pricePerDayPeak?.[day]
                if (offPeak === undefined) return null
                return (
                  <div key={day} className="flex justify-between items-center bg-surface px-2 py-1.5 rounded border border-border text-xs">
                    <span className="text-secondary font-medium">{day.substring(0,3)}</span>
                    <div className="text-right">
                       <span className="font-medium text-primary">Rs {offPeak}</span>
                       {hasPeak && peak !== undefined && <span className="text-brand block mt-0.5">Rs {peak}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      case 'CONSTANT':
      default:
        return (
          <div className="bg-surface-variant p-3 rounded-lg border border-border flex flex-col min-w-[140px]">
            <span className="text-caption text-secondary">Base Rate</span>
            <span className="text-body font-medium text-primary mt-1">PKR {court.constantPriceOffPeak?.toLocaleString() || 0}/hr</span>
            {hasPeak && (
              <span className="text-caption text-brand mt-2 border-t border-border pt-1.5">
                Peak: PKR {court.constantPricePeak?.toLocaleString() || 0}/hr
                <span className="block text-[10px] text-secondary mt-0.5">{peakWindowStr}</span>
              </span>
            )}
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title={court.name || court.courtName || 'Court Details'}
        subtitle="Manage court details, pricing, and availability."
        backLink={ROUTES.COURTS}
      />

      {/* Hero Section */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row relative min-h-[250px]">
        <div className="absolute top-4 right-4 z-10">
          <StatusBadge status={!court.isDisabled ? 'ACTIVE' : 'INACTIVE'} />
        </div>
        
        <div className="md:w-1/3 h-48 md:h-auto min-h-[200px] relative group bg-surface-variant">
          <img 
            src={courtImages[0]} 
            alt={court.name || court.courtName || 'Court Image'} 
            className="w-full h-full object-cover absolute inset-0" 
          />
          <button 
            onClick={() => setActiveEditSection('images')}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="bg-surface text-primary p-2 rounded-full shadow-sm">
              <ImageIcon size={20} />
            </div>
          </button>
        </div>
        
        <div className="p-6 md:w-2/3 flex flex-col relative group min-h-[250px] w-full">
          <button 
            onClick={() => setActiveEditSection('basic')}
            className="absolute top-6 right-6 p-2 rounded-full bg-surface-variant text-secondary hover:text-brand hover:bg-brand/10 transition-colors opacity-0 group-hover:opacity-100 z-10"
          >
            <Edit3 size={18} />
          </button>
          
          <h2 className="text-h3 font-semibold text-primary mb-3 pr-24 min-h-[2rem]">{court.name || court.courtName || 'Unnamed Court'}</h2>
          
          <div className="flex gap-2 flex-wrap mb-8">
            {court.sportType && court.sportType.length > 0 ? court.sportType.map(sport => (
              <span key={sport} className="inline-flex items-center px-3 py-1.5 rounded-md text-body-sm font-medium bg-brand/10 text-brand border border-brand/20">
                <Tag size={14} className="mr-2" />
                {sport}
              </span>
            )) : (
              <span className="text-body-sm text-secondary">No sports specified</span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-auto relative group/pricing">
            <button 
              onClick={() => setActiveEditSection('pricing')}
              className="absolute -top-3 -right-3 z-10 p-1.5 rounded-full bg-surface text-secondary hover:text-brand shadow-sm border border-border transition-colors opacity-0 group-hover/pricing:opacity-100"
            >
              <Edit3 size={14} />
            </button>
            <div className="bg-surface-variant p-3 rounded-lg border border-border flex flex-col min-w-[120px]">
              <span className="text-caption text-secondary">Pricing Model</span>
              <span className="text-body font-medium text-primary mt-1">{court.pricingType ? court.pricingType.replace('_', ' ') : 'CONSTANT'}</span>
            </div>
            
            {renderPricingShowcase()}

            <div className="bg-surface-variant p-3 rounded-lg border border-border flex flex-col min-w-[120px]">
              <span className="text-caption text-secondary">Slot Size</span>
              <span className="text-body font-medium text-primary mt-1">{court.isHalfHourSlot ? '30 mins' : '60 mins'}</span>
            </div>
            <div className="bg-surface-variant p-3 rounded-lg border border-border flex flex-col min-w-[120px]">
              <span className="text-caption text-secondary">Reviews</span>
              <span className="text-body font-medium text-primary mt-1">{court.avgRating ? `${court.avgRating.toFixed(1)} / 5.0` : 'No ratings'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <CourtCalendarHeatmap courtId={court.id} openTime={venue?.openingTime} closeTime={venue?.closingTime} />
        </div>

        {/* Right Column - Side Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Operating Days */}
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 relative group">
            <button 
              onClick={() => setActiveEditSection('schedule')}
              className="absolute top-4 right-4 p-2 rounded-full bg-surface-variant text-secondary hover:text-brand hover:bg-brand/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit3 size={18} />
            </button>
            <h3 className="text-h4 font-semibold text-primary flex items-center gap-2 mb-4">
              <Info className="text-brand" size={20} />
              Operating Days
            </h3>
            {court.openWeekdays && court.openWeekdays.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                  const isOpen = court.openWeekdays.includes(day as any)
                  return (
                    <span 
                      key={day} 
                      className={`inline-flex items-center px-2.5 py-1 rounded text-caption font-medium border ${isOpen ? 'bg-success/10 text-success border-success/20' : 'bg-surface-variant text-secondary border-border opacity-50'}`}
                    >
                      {day.substring(0, 3)}
                    </span>
                  )
                })}
              </div>
            ) : (
              <p className="text-body-sm text-secondary">No operating days specified.</p>
            )}
          </div>

          {/* Venue Details */}
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden p-6 flex flex-col h-full">
            <h3 className="text-h4 font-semibold text-primary flex items-center gap-2 mb-4">
              <MapPin className="text-brand" size={20} />
              Location
            </h3>
            {venue ? (
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex items-start gap-2 text-body-sm text-secondary bg-surface-variant p-3 rounded-lg border border-border">
                  <MapPin size={16} className="shrink-0 mt-0.5 text-brand" />
                  <span>{venue.address}</span>
                </div>
                {venue.latitude && venue.longitude && (
                  <div className="rounded-lg overflow-hidden border border-border w-full h-[250px]">
                    <VenueMap lat={venue.latitude} lng={venue.longitude} height="250px" />
                  </div>
                )}
                <div className="flex gap-4 mt-auto items-center pt-2">
                  <img src={venue.venueImage || venue.image || 'https://via.placeholder.com/150'} alt={venue.name} className="w-12 h-12 rounded-lg border border-border object-cover" />
                  <div className="flex flex-col justify-center">
                    <p className="font-semibold text-primary text-body-sm">{venue.name}</p>
                    <p className="text-caption text-secondary">{venue.city}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-body-sm text-secondary">Venue information not available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <CourtReviewsSection 
        courtId={court.id}
        avgRating={court.avgRating}
        reviewCount={court.reviewCount}
        latestReviews={court.latestReviews}
        onReplySuccess={fetchCourtData}
      />

      <SlideOver
        isOpen={activeEditSection !== null}
        onClose={() => setActiveEditSection(null)}
        title="Edit Court"
        subtitle="Update court configuration"
      >
        <CourtForm
          initialData={court}
          venues={venue ? [{ label: venue.name, value: venue.id }] : []}
          preselectedVenueId={court.venueId}
          onSubmit={handleUpdateSection}
          onCancel={() => setActiveEditSection(null)}
          editSection={activeEditSection}
        />
      </SlideOver>
    </div>
  )
}
