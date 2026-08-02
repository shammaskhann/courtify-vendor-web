import Link from 'next/link'
import { MapPin, Clock, Edit, Trash2 } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge'
import { Button } from '../ui/Button'
import { ROUTES } from '@/lib/constants'
import type { Venue } from '@/types/models'

interface VenueCardProps {
  venue: Venue
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function VenueCard({ venue, onEdit, onDelete }: VenueCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-base group flex flex-col h-full">
      {/* Image */}
      <div className="relative h-48 w-full bg-surface-variant overflow-hidden">
        <img
          src={venue.image}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
          loading="lazy"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <StatusBadge status={venue.isActive ? 'ACTIVE' : 'INACTIVE'} />
          <div className="bg-surface/90 backdrop-blur-sm text-primary text-caption font-semibold px-2.5 py-0.5 rounded-pill">
            {venue.courtCount} {venue.courtCount === 1 ? 'Court' : 'Courts'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <Link 
            href={`${ROUTES.VENUES}/${venue.id}`}
            className="text-h4 font-semibold text-primary hover:text-brand transition-colors line-clamp-1"
            title={venue.name}
          >
            {venue.name}
          </Link>
        </div>
        
        <div className="flex flex-col gap-2 mt-1 mb-4">
          <div className="flex items-center text-body-sm text-secondary">
            <MapPin size={14} className="mr-1.5 shrink-0" />
            <span className="truncate">{venue.address}, {venue.city}</span>
          </div>
          <div className="flex items-center text-body-sm text-secondary">
            <Clock size={14} className="mr-1.5 shrink-0" />
            <span>{venue.openingTime} - {venue.closingTime}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap flex-1 overflow-hidden pr-2 h-6">
            {venue.amenities.slice(0, 3).map((amenity) => (
              <span key={amenity} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-variant text-secondary whitespace-nowrap">
                {amenity}
              </span>
            ))}
            {venue.amenities.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-variant text-secondary">
                +{venue.amenities.length - 3}
              </span>
            )}
          </div>
          
          <div className="flex gap-2 shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-secondary hover:text-primary"
                onClick={() => onEdit(venue.id)}
                aria-label="Edit venue"
              >
                <Edit size={16} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-error hover:text-error hover:bg-error-bg"
                onClick={() => onDelete(venue.id)}
                aria-label="Delete venue"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
