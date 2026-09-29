'use client'

import { useState, useEffect, use, useCallback, type ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Layers,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  User,
  XCircle,
  CalendarDays,
  Tag,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FallbackImage } from '@/components/ui/FallbackImage'
import { AdminCourtCard } from '@/components/admin/AdminCourtCard'
import { getVenueById, approveVenue, disableVenue, enableVenue, approveCourt, disableCourt, enableCourt } from '@/lib/api/adminApi'
import {
  formatDate,
  getCourtDisplayName,
  getCourtStatus,
  getVenueDisplayName,
  getVenueStatus,
  statusToBadge,
  type ModerationStatus,
} from '@/lib/venue'
import { cn } from '@/lib/utils'
import type { AdminVenue, Court } from '@/types/models'
import { ROUTES } from '@/lib/constants'
import toast from 'react-hot-toast'

type Target = 'VENUE' | 'COURT'
type Action = 'APPROVE' | 'DISABLE' | 'ENABLE'

export default function AdminVenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [venue, setVenue] = useState<AdminVenue | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirm, setConfirm] = useState<{
    open: boolean
    target?: Target
    name?: string
    action?: Action
    run?: () => Promise<unknown>
  }>({ open: false })

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const venueRes = await getVenueById(id)
        if (!isMounted) return
        setVenue(venueRes)
        setCourts(venueRes.courts || [])
      } catch (err) {
        console.error(String(err))
        if (isMounted) {
          setVenue(null)
          setCourts([])
          setNotFound(true)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [id])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const venueRes = await getVenueById(id)
      setVenue(venueRes)
      setCourts(venueRes.courts || [])
    } catch (err) {
      console.error(String(err))
    } finally {
      setLoading(false)
    }
  }, [id])

  const askVenue = (action: Action) => {
    if (!venue) return
    setConfirm({
      open: true,
      target: 'VENUE',
      action,
      name: getVenueDisplayName(venue),
      run: () =>
        action === 'APPROVE' ? approveVenue(venue.id)
          : action === 'DISABLE' ? disableVenue(venue.id)
            : enableVenue(venue.id),
    })
  }

  const askCourt = (court: Court, action: Action) => {
    setConfirm({
      open: true,
      target: 'COURT',
      action,
      name: getCourtDisplayName(court),
      run: () =>
        action === 'APPROVE' ? approveCourt(court.id)
          : action === 'DISABLE' ? disableCourt(court.id)
            : enableCourt(court.id),
    })
  }

  const handleConfirm = async () => {
    if (!confirm.run) return
    setSubmitting(true)
    try {
      await confirm.run()
      toast.success(`${confirm.target === 'VENUE' ? 'Venue' : 'Court'} ${confirm.action?.toLowerCase()}d successfully`)
      setConfirm({ open: false })
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmCopy = (() => {
    const { target, action, name } = confirm
    if (!target || !action || !name) return { title: '', message: '' }
    const label = target === 'VENUE' ? 'venue' : 'court'
    if (action === 'APPROVE') {
      return {
        title: `Approve ${label}`,
        message:
          target === 'VENUE'
            ? `Approve "${name}"? It will be listed on Courtify and the owner notified.`
            : `Approve "${name}"? It will become bookable at this venue.`,
      }
    }
    if (action === 'DISABLE') {
      return {
        title: `Disable ${label}`,
        message:
          target === 'VENUE'
            ? `Disable "${name}"? It will be removed from listings.`
            : `Disable "${name}"? It will stop accepting bookings.`,
      }
    }
    return {
      title: `Re-enable ${label}`,
      message: `Re-enable "${name}"? It will be listed again.`,
    }
  })()

  if (loading && !venue) return <DetailSkeleton />

  if (notFound || !venue) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-20 text-center">
        <Building2 size={32} className="text-tertiary" />
        <p className="text-h4 font-semibold text-primary">Venue not found</p>
        <p className="max-w-sm text-body-sm text-secondary">
          This venue may have been removed, or the link is no longer valid.
        </p>
        <Button
          variant="secondary"
          className="mt-2"
          onClick={() => { loadData() }}
        >
          <RotateCcw size={16} className="mr-2" />
          Try again
        </Button>
      </div>
    )
  }

  const status: ModerationStatus = getVenueStatus(venue)
  const name = getVenueDisplayName(venue)
  const amenities = venue.amenities ?? []
  const approvedCourts = courts.filter(c => getCourtStatus(c) === 'APPROVED').length
  const pendingCourts = courts.filter(c => getCourtStatus(c) === 'PENDING').length
  const disabledCourts = courts.filter(c => getCourtStatus(c) === 'DISABLED').length

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link
        href={ROUTES.ADMIN_VENUES}
        className="inline-flex w-fit items-center gap-1.5 text-body-sm font-medium text-secondary transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} /> Back to venues
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="relative">
          <FallbackImage
            src={venue.venueImage || venue.image}
            alt={name}
            seed={String(venue.id) + name}
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
              {[venue.address, venue.city].filter(Boolean).length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} className="shrink-0" />
                  {[venue.address, venue.city].filter(Boolean).join(', ')}
                </span>
              )}
              {venue.ownerName && (
                <span className="inline-flex items-center gap-1.5">
                  <User size={14} className="shrink-0" />
                  {venue.ownerName}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} className="shrink-0" />
                Joined {formatDate(venue.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-4">
          {status === 'PENDING' && (
            <Button variant="primary" onClick={() => askVenue('APPROVE')}>
              <CheckCircle size={16} className="mr-2" /> Approve Venue
            </Button>
          )}
          {status === 'APPROVED' && (
            <Button variant="destructive" onClick={() => askVenue('DISABLE')}>
              <XCircle size={16} className="mr-2" /> Disable Venue
            </Button>
          )}
          {status === 'DISABLED' && (
            <Button variant="secondary" onClick={() => askVenue('ENABLE')}>
              <RotateCcw size={16} className="mr-2" /> Enable Venue
            </Button>
          )}
        </div>
      </section>

      {/* Court rollup */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total courts" value={courts.length} />
        <StatTile label="Approved" value={approvedCourts} tone="success" />
        <StatTile label="Pending" value={pendingCourts} tone="warning" />
        <StatTile label="Disabled" value={disabledCourts} tone="error" />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InfoCard icon={Building2} title="Venue Information">
          <DetailRow label="Business name" value={venue.businessName} />
          <DetailRow label="Address" value={venue.address} />
          <DetailRow label="City" value={venue.city} />
          <DetailRow label="Registered" value={formatDate(venue.createdAt)} />
          {venue.description && (
            <div className="pt-3">
              <p className="text-caption font-medium uppercase tracking-wide text-tertiary">
                Description
              </p>
              <p className="mt-1.5 text-body leading-relaxed text-secondary">
                {venue.description}
              </p>
            </div>
          )}
          {amenities.length > 0 && (
            <div className="pt-1">
              <p className="mb-2 flex items-center gap-1.5 text-caption font-medium uppercase tracking-wide text-tertiary">
                <Tag size={12} /> Amenities
              </p>
              <div className="flex flex-wrap gap-1.5">
                {amenities.map(amenity => (
                  <span
                    key={amenity}
                    className="inline-flex items-center rounded-pill bg-surface-variant px-2.5 py-1 text-caption font-medium text-secondary"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </InfoCard>

        <InfoCard icon={User} title="Owner Information">
          <DetailRow label="Name" value={venue.ownerName} />
          <DetailRow
            label="Email"
            value={venue.ownerEmail}
            icon={Mail}
            href={venue.ownerEmail ? `mailto:${venue.ownerEmail}` : undefined}
          />
          <DetailRow
            label="Contact no."
            value={venue.contactNo}
            icon={Phone}
            href={venue.contactNo ? `tel:${venue.contactNo}` : undefined}
          />
          <DetailRow label="Owner ID" value={venue.courtOwnerId != null ? `#${venue.courtOwnerId}` : undefined} />
          <DetailRow label="Venue ID" value={`#${venue.id}`} />
        </InfoCard>
      </div>

      {/* Courts */}
      <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-h4">Courts</h2>
              <p className="text-caption text-secondary">
                {loading
                  ? 'Refreshing…'
                  : `${courts.length} court${courts.length === 1 ? '' : 's'} registered at this venue`}
              </p>
            </div>
          </div>
          {pendingCourts > 0 && (
            <span className="badge badge-warning text-xs">{pendingCourts} awaiting review</span>
          )}
        </div>

        <div className="p-4">
          {loading && courts.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-border animate-pulse">
                  <div className="h-24 w-full bg-surface-variant" />
                  <div className="flex flex-col gap-2 p-4">
                    <div className="h-4 w-2/3 rounded bg-surface-variant" />
                    <div className="h-3 w-1/2 rounded bg-surface-variant" />
                  </div>
                </div>
              ))}
            </div>
          ) : courts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Layers size={32} className="text-tertiary" />
              <p className="text-body font-medium text-primary">No courts yet</p>
              <p className="max-w-sm text-body-sm text-secondary">
                The owner has not added any courts to this venue.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {courts.map(court => (
                <AdminCourtCard
                  key={court.id}
                  court={court}
                  onApprove={c => askCourt(c, 'APPROVE')}
                  onDisable={c => askCourt(c, 'DISABLE')}
                  onEnable={c => askCourt(c, 'ENABLE')}
                />
              ))}
            </div>
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

function DetailRow({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string
  value?: string | number | null
  icon?: LucideIcon
  href?: string
}) {
  const empty = value === undefined || value === null || value === ''
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-body-sm text-secondary">{label}</span>
      {empty ? (
        <span className="text-body-sm text-tertiary">Not provided</span>
      ) : href ? (
        <a
          href={href}
          className="inline-flex min-w-0 items-center gap-1.5 text-right text-body-sm font-medium text-primary transition-colors hover:text-brand"
        >
          {Icon && <Icon size={13} className="shrink-0" />}
          <span className="truncate">{value}</span>
        </a>
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
  value: number
  tone?: 'neutral' | 'success' | 'warning' | 'error'
}) {
  const toneClass = {
    neutral: 'text-primary',
    success: 'text-success-text',
    warning: 'text-warning-text',
    error: 'text-error-text',
  }[tone]

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <p className="text-caption font-medium uppercase tracking-wide text-tertiary">{label}</p>
      <p className={cn('mt-1 text-h3 font-semibold', toneClass)}>{value}</p>
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
            <div className="mt-2 h-7 w-10 rounded bg-surface-variant animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-5">
            <div className="h-9 w-40 rounded bg-surface-variant animate-pulse" />
            <div className="mt-4 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="h-8 w-full rounded bg-surface-variant animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
