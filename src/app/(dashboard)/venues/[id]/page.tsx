'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getVenueById, updateVenue } from '@/lib/api/venueApi'
import { getCourts } from '@/lib/api/courtApi'
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

export default function VenueDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [venueRes, courtsRes, bookingsRes] = await Promise.all([
        getVenueById(params.id),
        getCourts({ venueId: params.id, pageSize: 5 }), // Show max 5 courts here
        getBookings({ venueId: params.id, pageSize: 5 }) // Show max 5 bookings here
      ])
      
      if (!venueRes) {
        router.push(ROUTES.VENUES)
        return
      }
      
      setVenue(venueRes)
      setCourts(courtsRes.data)
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
  }, [params.id])

  const handleEditSubmit = async (data: any) => {
    try {
      await updateVenue(params.id, data)
      setIsEditing(false)
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
        title={venue.name}
        subtitle="Manage venue details, courts, and bookings."
        backLink={ROUTES.VENUES}
        actions={
          <Button onClick={() => setIsEditing(true)}>
            <Edit size={16} className="mr-2" />
            Edit Venue
          </Button>
        }
      />

      {/* Hero Section */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row relative">
        <div className="absolute top-4 right-4 z-10">
          <StatusBadge status={venue.isActive ? 'ACTIVE' : 'INACTIVE'} />
        </div>
        <div className="md:w-1/3 h-48 md:h-auto relative">
          <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-6 md:w-2/3 flex flex-col">
          <h2 className="text-h3 font-semibold text-primary mb-2">{venue.name}</h2>
          <p className="text-body text-secondary mb-6 flex-1 max-w-2xl">{venue.description || 'No description provided.'}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            <div className="flex items-start gap-3 bg-surface-variant p-3 rounded-lg border border-border">
              <div className="bg-surface p-2 rounded-md shrink-0 shadow-sm border border-border">
                <MapPin size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-caption text-secondary mb-0.5">Location</p>
                <p className="text-body-sm font-medium text-primary">{venue.address}, {venue.city}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-surface-variant p-3 rounded-lg border border-border">
              <div className="bg-surface p-2 rounded-md shrink-0 shadow-sm border border-border">
                <Clock size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-caption text-secondary mb-0.5">Operating Hours</p>
                <p className="text-body-sm font-medium text-primary">{venue.openingTime} - {venue.closingTime}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-caption text-secondary mb-2">Amenities</p>
            <div className="flex gap-2 flex-wrap">
              {venue.amenities.map(amenity => (
                <span key={amenity} className="inline-flex items-center px-2.5 py-1 rounded-md text-caption font-medium bg-brand/10 text-brand border border-brand/20">
                  <CheckCircle size={12} className="mr-1.5" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courts Overview */}
        <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="text-h4 font-semibold text-primary">Courts ({venue.courtCount})</h3>
            <Button variant="link" size="sm" onClick={() => router.push(`${ROUTES.COURTS}?venueId=${venue.id}`)}>
              View All
            </Button>
          </div>
          <DataTable
            data={courts}
            className="border-0 rounded-none shadow-none"
            columns={[
              { header: 'Name', key: 'name', render: (c) => <span className="font-medium">{c.name}</span> },
              { header: 'Sport', key: 'sportType' },
              { header: 'Status', render: (c) => <StatusBadge status={!c.isDisabled ? 'ACTIVE' : 'INACTIVE'} /> },
            ]}
            keyExtractor={(c) => c.id}
            emptyStateTitle="No courts added"
            emptyStateDescription="Add courts to this venue to start receiving bookings."
          />
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
            keyExtractor={(b) => b.id}
            emptyStateTitle="No recent bookings"
            emptyStateDescription="This venue has no bookings yet."
          />
        </div>
      </div>

      <SlideOver
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Venue"
        subtitle="Update facility details, location, and amenities."
        width="lg"
      >
        <VenueForm
          initialData={venue}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
        />
      </SlideOver>
    </div>
  )
}
