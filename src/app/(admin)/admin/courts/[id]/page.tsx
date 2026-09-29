'use client'

import { useState, useEffect, use, useCallback, type ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  MapPin,
  MessageSquare,
  RotateCcw,
  Star,
  Timer,
  TrendingUp,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FallbackImage } from '@/components/ui/FallbackImage'
import {
  approveCourt,
  disableCourt,
  enableCourt,
  getAdminCourtById,
} from '@/lib/api/adminApi'
import { getCourtBasePrice } from '@/lib/pricing'
import {
  formatDate,
  getCourtDisplayName,
  getCourtStatus,
  getSportLabel,
  statusToBadge,
  type ModerationStatus,
} from '@/lib/venue'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import toast from 'react-hot-toast'
import type { Court, WeekDay } from '@/types/models'

type Action = 'APPROVE' | 'DISABLE' | 'ENABLE'

const PRICING_LABELS: Record<string, string> = {
  CONSTANT: 'Flat rate',
  WEEKDAY_WEEKEND: 'Weekday / weekend',
  PER_DAY: 'Per day',
}

const DAY_LABELS: Record<WeekDay, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
}

export default function AdminCourtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [court, setCourt] = useState<Court | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirm, setConfirm] = useState<{ open: boolean; action?: Action; run?: () => Promise<unknown> }>({
    open: false,
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setNotFound(false)
    setLoadError(null)
    try {
      // One call covers the court details and its moderation status: the
      // response carries isApproved / isDisabled.
      setCourt(await getAdminCourtById(id))
    } catch (err) {
      console.error(String(err))
      setCourt(null)
      const status = (err as { statusCode?: number })?.statusCode
      if (status === 404) {
        setNotFound(true)
      } else {
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load this court'
        )
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const ask = (action: Action) => {
    if (!court) return
    setConfirm({
      open: true,
      action,
      run: () =>
        action === 'APPROVE'
          ? approveCourt(court.id)
          : action === 'DISABLE'
            ? disableCourt(court.id)
            : enableCourt(court.id),
    })
  }

  const handleConfirm = async () => {
    if (!confirm.run) return
    setSubmitting(true)
    try {
      await confirm.run()
      toast.success(`Court ${confirm.action?.toLowerCase()}d successfully`)
      setConfirm({ open: false })
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmCopy = (() => {
    if (!confirm.action || !court) return { title: '', message: '' }
    const name = getCourtDisplayName(court)
    if (confirm.action === 'APPROVE') {
      return { title: 'Approve Court', message: `Approve "${name}"? It will become bookable at its venue.` }
    }
    if (confirm.action === 'DISABLE') {
      return {
        title: 'Disable Court',
        message: `Disable "${name}"? It will stop accepting bookings and be hidden from listings.`,
      }
    }
    return { title: 'Re-enable Court', message: `Re-enable "${name}"? It will accept bookings again.` }
  })()

  if (loading && !court) return <DetailSkeleton />

  if (notFound || loadError || !court) {
    const isError = Boolean(loadError)
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-20 text-center">
        {isError ? (
          <XCircle size={32} className="text-error" />
        ) : (
          <Timer size={32} className="text-tertiary" />
        )}
        <p className="text-h4 font-semibold text-primary">
          {isError ? 'Could not load this court' : 'Court not found'}
        </p>
        <p className="max-w-sm text-body-sm text-secondary">
          {isError
            ? loadError
            : 'This court may have been removed, or the link is no longer valid.'}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button variant="secondary" onClick={loadData}>
            <RotateCcw size={16} className="mr-2" />
            Try again
          </Button>
          <Button variant="ghost" onClick={() => { window.location.href = ROUTES.ADMIN_COURTS }}>
            Back to courts
          </Button>
        </div>
      </div>
    )
  }

  const status: ModerationStatus = getCourtStatus(court)
  const name = getCourtDisplayName(court)
  const basePrice = getCourtBasePrice(court)
  const pricingRows = buildPricingRows(court)
  const reviews = court.latestReviews ?? []
  const venueHref = court.venueId ? ROUTES.ADMIN_VENUE_DETAIL(String(court.venueId)) : null

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link
        href={ROUTES.ADMIN_COURTS}
        className="inline-flex w-fit items-center gap-1.5 text-body-sm font-medium text-secondary transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} /> Back to courts
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="relative">
          <FallbackImage
            src={court.images?.[0]}
            alt={name}
            seed={String(court.id) + name}
            className="h-44 w-full sm:h-56"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="mb-2">
              <StatusBadge
                status={statusToBadge(status)}
                className="border border-white/25 bg-black/55 text-white backdrop-blur-sm"
              />
            </div>
            <h1 className="text-h1 font-semibold text-white drop-shadow-sm">{name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <Timer size={14} className="shrink-0" />
                {getSportLabel(court)}
              </span>
              {venueHref && (
                <Link
                  href={venueHref}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
                >
                  <MapPin size={14} className="shrink-0" />
                  View venue
                </Link>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} className="shrink-0" />
                Added {formatDate(court.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-4">
          {status === 'PENDING' && (
            <Button variant="primary" onClick={() => ask('APPROVE')}>
              <CheckCircle size={16} className="mr-2" /> Approve Court
            </Button>
          )}
          {status === 'APPROVED' && (
            <Button variant="destructive" onClick={() => ask('DISABLE')}>
              <XCircle size={16} className="mr-2" /> Disable Court
            </Button>
          )}
          {status === 'DISABLED' && (
            <Button variant="secondary" onClick={() => ask('ENABLE')}>
              <RotateCcw size={16} className="mr-2" /> Enable Court
            </Button>
          )}
        </div>
      </section>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Base rate" value={basePrice > 0 ? `PKR ${basePrice.toLocaleString()}` : '—'} />
        <StatTile
          label="Slot length"
          value={court.isHalfHourSlot ? '30 min' : '60 min'}
        />
        <StatTile
          label="Rating"
          value={court.avgRating && court.reviewCount ? court.avgRating.toFixed(1) : '—'}
          tone={court.avgRating && court.reviewCount ? 'success' : 'neutral'}
        />
        <StatTile label="Reviews" value={court.reviewCount ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InfoCard icon={Timer} title="Court Configuration">
          <DetailRow label="Court name" value={name} />
          <DetailRow label="Sport type" value={getSportLabel(court)} />
          <DetailRow
            label="Pricing model"
            value={PRICING_LABELS[court.pricingType] || court.pricingType}
          />
          <DetailRow
            label="Peak window"
            value={
              court.peakStartTime && court.peakEndTime
                ? `${court.peakStartTime} – ${court.peakEndTime}`
                : undefined
            }
          />
          <DetailRow
            label="Slot length"
            value={court.isHalfHourSlot ? '30 minutes' : '60 minutes'}
          />
          <DetailRow label="Court ID" value={`#${court.id}`} />
          {court.venueId && <DetailRow label="Venue ID" value={`#${court.venueId}`} />}

          <div className="pt-1">
            <p className="mb-2 text-caption font-medium uppercase tracking-wide text-tertiary">
              Open weekdays
            </p>
            {court.openWeekdays?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {court.openWeekdays.map(day => (
                  <span
                    key={day}
                    className="inline-flex items-center rounded-pill bg-surface-variant px-2.5 py-1 text-caption font-medium text-secondary"
                  >
                    {DAY_LABELS[day] ?? day}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-tertiary">No days configured</p>
            )}
          </div>
        </InfoCard>

        <InfoCard icon={TrendingUp} title="Pricing Breakdown">
          {pricingRows.length === 0 ? (
            <p className="py-2 text-body-sm text-tertiary">
              No pricing has been configured for this court yet.
            </p>
          ) : (
            <div className="flex flex-col">
              {pricingRows.map((row, i) => (
                <div
                  key={row.label}
                  className={cn(
                    'flex items-center justify-between gap-4 border-b border-border py-2.5 last:border-b-0',
                    i === 0 && 'pt-0'
                  )}
                >
                  <span className="text-body-sm text-secondary">{row.label}</span>
                  <span className="shrink-0 text-body-sm font-semibold text-primary">
                    {row.value === null ? (
                      <span className="font-normal text-tertiary">Not set</span>
                    ) : (
                      `PKR ${row.value.toLocaleString()} / hr`
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </InfoCard>
      </div>

      {/* Reviews */}
      <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="text-h4">Reviews</h2>
              <p className="text-caption text-secondary">
                {court.reviewCount
                  ? `${court.reviewCount} review${court.reviewCount === 1 ? '' : 's'} on this court`
                  : 'No reviews submitted yet'}
              </p>
            </div>
          </div>
          {court.avgRating && court.reviewCount ? (
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-success-bg px-3 py-1 text-body-sm font-semibold text-success-text">
              <Star size={14} className="fill-success text-success" />
              {court.avgRating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <div className="p-4">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Star size={30} className="text-tertiary" />
              <p className="text-body font-medium text-primary">No reviews to show</p>
              <p className="max-w-sm text-body-sm text-secondary">
                {court.reviewCount
                  ? 'This court has reviews but the latest ones were not included in this response.'
                  : 'Reviews will appear here once players rate this court.'}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {reviews.map(review => (
                <li
                  key={review.id}
                  className="rounded-lg border border-border bg-surface p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-body font-medium text-primary">
                      {review.userName || 'Player'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-body-sm font-semibold text-primary">
                      <Star size={13} className="fill-brand text-brand" />
                      {review.rating}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-body-sm leading-relaxed text-secondary">
                      {review.comment}
                    </p>
                  )}
                  <p className="mt-2 text-caption text-tertiary">
                    {formatDate(review.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false })}
        onConfirm={handleConfirm}
        title={confirmCopy.title}
        message={confirmCopy.message}
        confirmLabel={
          confirm.action === 'APPROVE' ? 'Approve' : confirm.action === 'DISABLE' ? 'Disable' : 'Enable'
        }
        confirmVariant={confirm.action === 'DISABLE' ? 'danger' : 'primary'}
        isLoading={submitting}
      />
    </div>
  )
}

type PricingRow = { label: string; value: number | null }

/** Flattens whichever pricing model the court uses into displayable rows. */
function buildPricingRows(court: Court): PricingRow[] {
  const rows: PricingRow[] = []
  const push = (label: string, value?: number | null) => {
    rows.push({ label, value: typeof value === 'number' && value > 0 ? value : null })
  }

  switch (court.pricingType) {
    case 'CONSTANT':
      push('Off-peak', court.constantPriceOffPeak)
      push('Peak', court.constantPricePeak)
      break
    case 'WEEKDAY_WEEKEND':
      push('Weekday · off-peak', court.weekdayPriceOffPeak)
      push('Weekday · peak', court.weekdayPricePeak)
      push('Weekend · off-peak', court.weekendPriceOffPeak)
      push('Weekend · peak', court.weekendPricePeak)
      break
    case 'PER_DAY': {
      const days: WeekDay[] = [
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY',
      ]
      for (const day of days) {
        const offPeak = court.pricePerDayOffPeak?.[day]
        const peak = court.pricePerDayPeak?.[day]
        if (offPeak != null || peak != null) {
          push(
            `${DAY_LABELS[day]} · off-peak`,
            offPeak != null && offPeak > 0 ? offPeak : null
          )
          push(
            `${DAY_LABELS[day]} · peak`,
            peak != null && peak > 0 ? peak : null
          )
        }
      }
      break
    }
    default:
      break
  }

  return rows
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Icon size={18} />
        </div>
        <h2 className="text-h4">{title}</h2>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  const empty = value === undefined || value === null || value === ''
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-body-sm text-secondary">{label}</span>
      {empty ? (
        <span className="text-body-sm text-tertiary">Not provided</span>
      ) : (
        <span className="min-w-0 truncate text-right text-body-sm font-medium text-primary">
          {value}
        </span>
      )}
    </div>
  )
}

function StatTile({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string | number
  tone?: 'neutral' | 'success'
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <p className="text-caption font-medium uppercase tracking-wide text-tertiary">{label}</p>
      <p
        className={cn(
          'mt-1 text-h3 font-semibold',
          tone === 'success' ? 'text-success-text' : 'text-primary'
        )}
      >
        {value}
      </p>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="h-4 w-32 rounded bg-surface-variant animate-pulse" />
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="h-44 w-full bg-surface-variant animate-pulse sm:h-56" />
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <div className="h-10 w-36 rounded-md bg-surface-variant animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4">
            <div className="h-3 w-20 rounded bg-surface-variant animate-pulse" />
            <div className="mt-2 h-7 w-16 rounded bg-surface-variant animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-5">
            <div className="h-9 w-44 rounded bg-surface-variant animate-pulse" />
            <div className="mt-4 flex flex-col gap-3">
              {Array.from({ length: 5 }).map((__, j) => (
                <div key={j} className="h-8 w-full rounded bg-surface-variant animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
