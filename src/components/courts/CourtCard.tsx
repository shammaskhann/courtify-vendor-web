import Link from 'next/link'
import { MapPin, DollarSign, Activity, Edit, Trash2, Wrench } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge'
import { Button } from '../ui/Button'
import { ROUTES } from '@/lib/constants'
import { getCourtBasePrice } from '@/lib/pricing'
import type { Court } from '@/types/models'

interface CourtCardProps {
  court: Court
  venueName?: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleMaintenance?: (id: string, isMaintenance: boolean) => void
}

export function CourtCard({ court, venueName, onEdit, onDelete, onToggleMaintenance }: CourtCardProps) {
  const imageUrl = court.images?.[0] || 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&q=80&w=600'
  const sportTypes = Array.isArray(court.sportType) ? court.sportType : [court.sportType]

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-base group flex flex-col h-full">
      {/* Image */}
      <div className="relative h-48 w-full bg-surface-variant overflow-hidden">
        <img
          src={imageUrl}
          alt={court.name || court.courtName || 'Court'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
          loading="lazy"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {court.isDisabled ? (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-error/10 text-error">
              MAINTENANCE
            </span>
          ) : (
            <StatusBadge status="ACTIVE" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <Link 
            href={`${ROUTES.COURTS}/${court.id}`}
            className="text-h4 font-semibold text-primary hover:text-brand transition-colors line-clamp-1"
            title={court.name || court.courtName}
          >
            {court.name || court.courtName}
          </Link>
        </div>
        
        <div className="flex flex-col gap-2 mt-1 mb-4">
          {venueName && (
            <div className="flex items-center text-body-sm text-secondary">
              <MapPin size={14} className="mr-1.5 shrink-0" />
              <span className="truncate">{venueName}</span>
            </div>
          )}
          <div className="flex items-center text-body-sm text-secondary">
            <Activity size={14} className="mr-1.5 shrink-0" />
            <span className="truncate">{sportTypes.join(', ')}</span>
          </div>
          <div className="flex items-center text-body-sm text-secondary">
            <DollarSign size={14} className="mr-1.5 shrink-0 text-success" />
            <span className="font-medium text-primary">PKR {getCourtBasePrice(court).toLocaleString()}</span> / hr
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap flex-1 overflow-hidden pr-2 h-6">
            {court.openWeekdays?.slice(0, 3).map((day) => (
              <span key={day} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-variant text-secondary whitespace-nowrap capitalize">
                {day.substring(0, 3).toLowerCase()}
              </span>
            ))}
            {(court.openWeekdays?.length || 0) > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-variant text-secondary">
                +{(court.openWeekdays?.length || 0) - 3}
              </span>
            )}
          </div>
          
          <div className="flex gap-2 shrink-0">
            {onToggleMaintenance && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${court.isDisabled ? 'text-brand bg-brand/10 hover:bg-brand/20' : 'text-secondary hover:text-primary'}`}
                onClick={() => onToggleMaintenance(court.id, !court.isDisabled)}
                title={court.isDisabled ? "Enable Court" : "Set to Maintenance"}
              >
                <Wrench size={16} />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-secondary hover:text-primary"
                onClick={() => onEdit(court.id)}
                title="Edit court"
              >
                <Edit size={16} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-error hover:text-error hover:bg-error-bg"
                onClick={() => onDelete(court.id)}
                aria-label="Delete court"
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
