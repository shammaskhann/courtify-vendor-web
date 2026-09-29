'use client'

import Link from 'next/link'
import {
  Activity,
  CheckCircle,
  Clock,
  MapPin,
  RotateCcw,
  Star,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FallbackImage } from '@/components/ui/FallbackImage'
import { ROUTES } from '@/lib/constants'
import {
  getCourtDisplayName,
  getCourtStatus,
  getSportLabel,
  statusToBadge,
  type ModerationStatus,
} from '@/lib/venue'
import { cn } from '@/lib/utils'
import type { Court } from '@/types/models'

interface AdminCourtCardProps {
  court: Court
  onApprove?: (court: Court) => void
  onDisable?: (court: Court) => void
  onEnable?: (court: Court) => void
  /** Hide the venue reference when the card is already scoped to one venue. */
  showVenueName?: boolean
  venueName?: string
  /** Renders the court name as a link into the admin court detail page. */
  linkToDetail?: boolean
  className?: string
}

const PRICING_LABELS: Record<string, string> = {
  CONSTANT: 'Flat rate',
  WEEKDAY_WEEKEND: 'Weekday / weekend',
  PER_DAY: 'Per day',
}

export function AdminCourtCard({
  court,
  onApprove,
  onDisable,
  onEnable,
  showVenueName,
  venueName,
  linkToDetail,
  className,
}: AdminCourtCardProps) {
  const status: ModerationStatus = getCourtStatus(court)
  const name = getCourtDisplayName(court)
  const pricing = PRICING_LABELS[court.pricingType] || court.pricingType || '—'
  const hasRating = Boolean(court.reviewCount && court.avgRating)
  const basePrice = court.constantPriceOffPeak ?? court.weekdayPriceOffPeak
  const detailHref = ROUTES.ADMIN_COURT_DETAIL(court.id.toString())
  const venueHref = court.venueId
    ? ROUTES.ADMIN_VENUE_DETAIL(String(court.venueId))
    : undefined

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm',
        'transition-all duration-base hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md',
        'focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/40',
        className
      )}
    >
      <div className="relative">
        <FallbackImage
          src={court.images?.[0]}
          alt={name}
          seed={String(court.id) + name}
          className="h-28 w-full"
          imageClassName="transition-transform duration-slow group-hover:scale-105"
        />
        <div className="absolute right-3 top-3">
          <StatusBadge
            status={statusToBadge(status)}
            className="border border-white/25 bg-black/55 text-white backdrop-blur-sm"
          />
        </div>
        {status === 'PENDING' && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-pill bg-black/55 px-2.5 py-1 text-caption font-semibold text-white backdrop-blur-sm">
            <Clock size={12} />
            Awaiting review
          </span>
        )}
        {hasRating && (
          <Link
            href={`${ROUTES.ADMIN_REVIEWS}?courtId=${court.id}`}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-pill bg-black/55 px-2.5 py-1 text-caption font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/75"
            onClick={e => e.stopPropagation()}
          >
            <Star size={12} className="fill-brand text-brand" />
            {court.avgRating?.toFixed(1)}
            <span className="font-normal opacity-75">({court.reviewCount})</span>
          </Link>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          {linkToDetail ? (
            <Link
              href={detailHref}
              className="text-body font-semibold text-primary transition-colors hover:text-brand line-clamp-1"
              title={name}
            >
              {name}
            </Link>
          ) : (
            <h3 className="text-body font-semibold text-primary line-clamp-1" title={name}>
              {name}
            </h3>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-secondary">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Activity size={13} className="shrink-0" />
              <span className="line-clamp-1">{getSportLabel(court)}</span>
            </span>
            <span className="truncate">{pricing}</span>
          </div>

          {basePrice !== undefined && basePrice !== null && (
            <p className="mt-1.5 text-body-sm">
              <span className="font-semibold text-primary">
                PKR {basePrice.toLocaleString()}
              </span>
              <span className="text-tertiary"> / hr from</span>
            </p>
          )}

          {showVenueName && (
            <p className="mt-1.5 flex items-center gap-1.5 text-body-sm text-tertiary">
              <MapPin size={13} className="shrink-0" />
              {venueHref ? (
                <Link
                  href={venueHref}
                  className="truncate transition-colors hover:text-brand"
                  onClick={e => e.stopPropagation()}
                >
                  {venueName || 'View venue'}
                </Link>
              ) : (
                <span className="truncate">{venueName || 'Venue unavailable'}</span>
              )}
            </p>
          )}
        </div>

        {(onApprove || onDisable || onEnable) && (
          <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
            {status === 'PENDING' && onApprove && (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => onApprove(court)}
              >
                <CheckCircle size={14} className="mr-1.5" />
                Approve
              </Button>
            )}
            {status === 'APPROVED' && onDisable && (
              <Button
                variant="destructive"
                size="sm"
                fullWidth
                onClick={() => onDisable(court)}
              >
                <XCircle size={14} className="mr-1.5" />
                Disable
              </Button>
            )}
            {status === 'DISABLED' && onEnable && (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => onEnable(court)}
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
