import { SlideOver } from '../ui/SlideOver'
import { StatusBadge } from '../ui/StatusBadge'
import { MapPin, Info, Tag, Edit, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import type { Court, Venue } from '@/types/models'
import { getVenueById } from '@/lib/api/venueApi'
import { useEffect, useState } from 'react'
import { Skeleton } from '../ui/Skeleton'

interface CourtDetailSlideOverProps {
  court: Court | null
  isOpen: boolean
  onClose: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function CourtDetailSlideOver({ court, isOpen, onClose, onEdit, onDelete }: CourtDetailSlideOverProps) {
  const [venue, setVenue] = useState<Venue | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (court && isOpen) {
      setIsLoading(true)
      getVenueById(court.venueId)
        .then(setVenue)
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [court, isOpen])

  if (!court) return null

  const footer = (
    <>
      <Button variant="secondary" onClick={() => { onClose(); onDelete(court.id); }} className="text-error hover:text-error hover:border-error mr-auto">
        <Trash2 size={16} className="mr-2" />
        Delete Court
      </Button>
      <Button variant="secondary" onClick={onClose}>
        Close
      </Button>
      <Button onClick={() => { onClose(); onEdit(court.id); }}>
        <Edit size={16} className="mr-2" />
        Edit Details
      </Button>
    </>
  )

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={court.name}
      subtitle="Court Information and Details"
      footer={footer}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <StatusBadge status={!court.isDisabled ? 'ACTIVE' : 'INACTIVE'} />
        </div>
        <div className="bg-surface-variant rounded-lg p-4 border border-border space-y-3">
          <div className="flex items-center gap-3 text-body-sm">
            <Tag size={16} className="text-secondary shrink-0" />
            <span className="text-secondary w-20">Sport Type:</span>
            <span className="font-medium text-primary">{court.sportType.join(', ')}</span>
          </div>
          
          <div className="flex items-center gap-3 text-body-sm">
            <Info size={16} className="text-secondary shrink-0" />
            <span className="text-secondary w-20">Hourly Rate:</span>
            <span className="font-medium text-primary">PKR {court.constantPriceOffPeak?.toLocaleString() || 0}</span>
          </div>
        </div>

        <div>
          <h4 className="text-body font-semibold text-primary mb-3">Venue Details</h4>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : venue ? (
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex gap-3 mb-2">
                <img src={venue.image} alt={venue.name} className="w-12 h-12 rounded object-cover" />
                <div>
                  <p className="font-medium text-primary">{venue.name}</p>
                  <p className="text-caption text-secondary">{venue.city}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-caption text-secondary mt-3">
                <MapPin size={14} className="shrink-0 mt-0.5 text-brand" />
                <span>{venue.address}</span>
              </div>
            </div>
          ) : (
            <p className="text-body-sm text-secondary">Venue information not available.</p>
          )}
        </div>
      </div>
    </SlideOver>
  )
}
