'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, Eye, Layers, MapPin, RotateCcw, User, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FallbackImage } from '@/components/ui/FallbackImage'
import { ROUTES } from '@/lib/constants'
import {
  getVenueDisplayName,
  getVenueStatus,
  statusToBadge,
  type ModerationStatus,
} from '@/lib/venue'
import { cn } from '@/lib/utils'
import type { AdminVenue } from '@/types/models'

interface AdminVenueCardProps {
  venue: AdminVenue
  onApprove?: (venue: AdminVenue) => void
  onDisable?: (venue: AdminVenue) => void
  onEnable?: (venue: AdminVenue) => void
  /** Set false on read-only surfaces to drop the action row. */
  showActions?: boolean
  className?: string
}

export function AdminVenueCard({
  venue,
  onApprove,
  onDisable,
  onEnable,
  showActions = true,
  className,
}: AdminVenueCardProps) {
  const router = useRouter()
  const status: ModerationStatus = getVenueStatus(venue)
  const name = getVenueDisplayName(venue)
  const location = [venue.address, venue.city].filter(Boolean).join(', ')
  const courtCount = venue.courtCount ?? venue.courts?.length
  const detailHref = ROUTES.ADMIN_VENUE_DETAIL(venue.id.toString())

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm',
        'transition-all duration-base hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md',
        'focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/40',
        className
      )}
    >
      <div className="relative">
        <FallbackImage
          src={venue.venueImage || venue.image}
          alt={name}
          seed={String(venue.id) + name}
          className="h-32 w-full"
          imageClassName="transition-transform duration-slow group-hover:scale-105"
        />

        <div className="absolute right-3 top-3">
          <StatusBadge
            status={statusToBadge(status)}
            className="border border-white/25 bg-black/55 text-white backdrop-blur-sm"
          />
        </div>

        {courtCount !== undefined && courtCount > 0 && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-pill bg-black/55 px-2.5 py-1 text-caption font-semibold text-white backdrop-blur-sm">
            <Layers size={12} />
            {courtCount} court{courtCount === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Link
          href={detailHref}
          className="text-h4 font-semibold text-primary transition-colors hover:text-brand line-clamp-1 focus-visible:outline-none"
          title={name}
        >
          {name}
        </Link>

        <div className="flex flex-col gap-1.5 text-body-sm text-secondary">
          {location ? (
            <span className="flex items-start gap-1.5">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-tertiary">
              <MapPin size={14} className="shrink-0" />
              No address on file
            </span>
          )}

          {venue.ownerName ? (
            <span className="flex items-center gap-1.5">
              <User size={14} className="shrink-0" />
              <span className="truncate">{venue.ownerName}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-tertiary">
              <User size={14} className="shrink-0" />
              Owner details unavailable
            </span>
          )}
        </div>

        {showActions && (
          <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => router.push(detailHref)}
            >
              <Eye size={14} className="mr-1.5" />
              View
            </Button>

            {status === 'PENDING' && onApprove && (
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => onApprove(venue)}
              >
                <CheckCircle size={14} className="mr-1.5" />
                Approve
              </Button>
            )}
            {status === 'APPROVED' && onDisable && (
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => onDisable(venue)}
              >
                <XCircle size={14} className="mr-1.5" />
                Disable
              </Button>
            )}
            {status === 'DISABLED' && onEnable && (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => onEnable(venue)}
              >
                <RotateCcw size={14} className="mr-1.5" />
                Enable
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
