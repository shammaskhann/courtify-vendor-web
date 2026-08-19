'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { getVenueById, updateVenue } from '@/lib/api/venueApi'
import { getBookings } from '@/lib/api/bookingApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { SlideOver } from '@/components/ui/SlideOver'
import { VenueForm } from '@/components/venues/VenueForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { MapPin, Clock, Edit, CheckCircle } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import type { Venue, Court, Booking } from '@/types/models'
import dynamic from 'next/dynamic'

const VenueMap = dynamic(() => import('@/components/common/VenueMap').then(mod => mod.VenueMap), { ssr: false })

export default function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const [venue, setVenue] = useState<Venue | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeEditSection, setActiveEditSection] = useState<'basic' | 'location' | 'amenities' | 'hours' | 'image' | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [venueRes, bookingsRes] = await Promise.all([
        getVenueById(id),
        getBookings({ venueId: id, pageSize: 5 }) // Show max 5 bookings here
      ])

      if (!venueRes) {
        router.push(ROUTES.VENUES)
        return
      }

      setVenue(venueRes)
      setCourts(venueRes.courts || [])
      setBookings(bookingsRes.data)
    } catch (error) {
      console.error('Failed to load venue details:', error)
      router.push(ROUTES.VENUES)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleEditSubmit = async (data: any) => {
    try {
      await updateVenue(id, data)
      setActiveEditSection(null)
      await fetchData()
    } catch (error) {
      console.error('Failed to update venue:', error)
      throw error
    }
  }

  if (isLoading || !venue) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <PageHeader
        title="Venue Details"
        subtitle="Manage venue details, courts, and bookings."
        backLink={ROUTES.VENUES}
      />

      {/* Hero Section */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row relative min-h-[250px]">
        <div className="absolute top-4 right-4 z-10">
          <StatusBadge status={venue.isDisabled ? 'INACTIVE' : (venue.isApproved ? 'ACTIVE' : 'PENDING')} />
        </div>

        <div className="md:w-1/3 h-48 md:h-auto min-h-[200px] relative group bg-surface-variant">
          <img
            src={venue.venueImage || venue.image || 'https://via.placeholder.com/800x400?text=No+Venue+Image'}
            alt={venue.name || 'Venue Cover'}
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" size="sm" onClick={() => setActiveEditSection('image')}>
              <Edit size={16} className="mr-2" /> Change Cover
            </Button>
          </div>
        </div>

        <div className="p-6 md:w-2/3 flex flex-col relative min-h-[250px] w-full">
          <div className="absolute top-4 right-16 z-10">
            <Button variant="ghost" size="sm" onClick={() => setActiveEditSection('basic')} className="text-secondary hover:text-brand">
              <Edit size={16} />
            </Button>
          </div>
          <h2 className="text-h3 font-semibold text-primary mb-2 pr-24 min-h-[2rem]">{venue.name || 'Unnamed Venue'}</h2>
          <p className="text-body text-secondary mb-6 flex-1 max-w-2xl min-h-[3rem]">{venue.description || 'No description provided.'}</p>
          {/* <pre className="text-xs text-white max-w-full overflow-hidden bg-black/50 p-2">{JSON.stringify({ name: venue.name, desc: venue.description }, null, 2)}</pre> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Location & Map */}
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 relative group">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-h4 font-semibold text-primary flex items-center gap-2">
                <MapPin className="text-brand" size={20} />
                Location
              </h3>
              <button onClick={() => setActiveEditSection('location')} className="text-secondary hover:text-brand p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-body font-medium text-primary">{venue.address}</p>
                <p className="text-body-sm text-secondary">{venue.city}</p>
              </div>

              {venue.latitude && venue.longitude ? (
                <div className="w-full h-[250px] rounded-xl border border-border overflow-hidden relative">
                  <VenueMap lat={venue.latitude} lng={venue.longitude} height="250px" />
                </div>
              ) : (
                <div className="w-full h-48 md:h-64 rounded-xl border border-border bg-surface-variant flex items-center justify-center">
                  <p className="text-secondary text-body-sm">No map location provided.</p>
                </div>
              )}
            </div>
          </div>

          {/* Courts Overview */}
          <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-h4 font-semibold text-primary">Courts ({courts.length})</h3>
              <Button variant="link" size="sm" onClick={() => router.push(`${ROUTES.COURTS}?venueId=${venue.id}`)}>
                View All
              </Button>
            </div>
            <DataTable
              data={courts}
              className="border-0 rounded-none shadow-none"
              columns={[
                { header: 'Name', key: 'name', render: (c) => <span className="font-medium">{c.name}</span> },
                { header: 'Sport', render: (c) => Array.isArray(c.sportType) ? c.sportType.join(', ') : c.sportType },
                { header: 'Status', render: (c) => <StatusBadge status={!c.isDisabled ? 'ACTIVE' : 'INACTIVE'} /> },
              ]}
              keyExtractor={(c) => c.id}
              emptyStateTitle="No courts added"
              emptyStateDescription="Add courts to this venue to start receiving bookings."
            />
          </div>
        </div>

        {/* Right Column - Side Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">

          {/* Operating Hours */}
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 relative group">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-h4 font-semibold text-primary flex items-center gap-2">
                <Clock className="text-brand" size={20} />
                Operating Hours
              </h3>
              <button onClick={() => setActiveEditSection('hours')} className="text-secondary hover:text-brand p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex-1 bg-surface-variant p-4 rounded-lg text-center border border-border">
                <p className="text-caption text-secondary mb-1">Opens</p>
                <p className="text-h5 font-semibold text-primary">{venue.openingTime}</p>
              </div>
              <div className="w-4 h-px bg-border shrink-0" />
              <div className="flex-1 bg-surface-variant p-4 rounded-lg text-center border border-border">
                <p className="text-caption text-secondary mb-1">Closes</p>
                <p className="text-h5 font-semibold text-primary">{venue.closingTime}</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 relative group">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-h4 font-semibold text-primary flex items-center gap-2">
                <CheckCircle className="text-brand" size={20} />
                Amenities
              </h3>
              <button onClick={() => setActiveEditSection('amenities')} className="text-secondary hover:text-brand p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit size={16} />
              </button>
            </div>

            {venue.amenities && venue.amenities.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {venue.amenities.map(amenity => (
                  <span key={amenity} className="inline-flex items-center px-3 py-1.5 rounded-md text-body-sm font-medium bg-brand/10 text-brand border border-brand/20">
                    <CheckCircle size={14} className="mr-2" />
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-secondary">No amenities listed.</p>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-h4 font-semibold text-primary">Recent Bookings</h3>
              <Button variant="link" size="sm" onClick={() => router.push(`${ROUTES.BOOKINGS}?venueId=${venue.id}`)}>
                View All
              </Button>
            </div>
            <DataTable
              data={bookings}
              className="border-0 rounded-none shadow-none"
              columns={[
                { header: 'Customer', key: 'customerName', render: (b) => <span className="font-medium">{b.customerName}</span> },
                { header: 'Date', render: (b) => new Date(b.bookingDate).toLocaleDateString() },
                { header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
              ]}
              keyExtractor={(b) => String(b.id)}
              emptyStateTitle="No recent bookings"
              emptyStateDescription="This venue has no bookings yet."
            />
          </div>
        </div>
      </div>

      <SlideOver
        isOpen={activeEditSection !== null}
        onClose={() => setActiveEditSection(null)}
        title={
          activeEditSection === 'basic' ? 'Edit Basic Details'
            : activeEditSection === 'location' ? 'Edit Location'
              : activeEditSection === 'amenities' ? 'Edit Amenities'
                : activeEditSection === 'hours' ? 'Edit Operating Hours'
                  : activeEditSection === 'image' ? 'Change Cover Image'
                    : 'Edit Venue'
        }
        subtitle="Update your facility information."
        width={activeEditSection === 'location' ? 'lg' : 'md'}
      >
        <VenueForm
          initialData={venue}
          onSubmit={handleEditSubmit}
          onCancel={() => setActiveEditSection(null)}
          editSection={activeEditSection}
        />
      </SlideOver>
    </div>
  )
}
