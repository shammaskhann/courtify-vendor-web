'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Button } from '@/components/ui/Button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { AdminVenueCard } from '@/components/admin/AdminVenueCard'
import { RefreshCw, SearchX } from 'lucide-react'
import { getAdminVenues, getPendingVenues, approveVenue, disableVenue, enableVenue } from '@/lib/api/adminApi'
import { getVenueDisplayName } from '@/lib/venue'
import toast from 'react-hot-toast'
import type { AdminVenue } from '@/types/models'

type TabFilter = 'ALL' | 'PENDING'
type VenueAction = 'APPROVE' | 'DISABLE' | 'ENABLE'

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<AdminVenue[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TabFilter>('ALL')
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState<{ open: boolean; venue?: AdminVenue; action?: VenueAction }>({ open: false })

  const fetchVenues = async () => {
    setLoading(true)
    try {
      const resp = filter === 'PENDING' ? await getPendingVenues(0, 100) : await getAdminVenues(0, 100)
      setVenues(resp.data || [])
      setTotal(resp.total ?? resp.data?.length ?? 0)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load venues')
      setVenues([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVenues()
  }, [filter])

  const openConfirm = (venue: AdminVenue, action: VenueAction) => {
    setConfirm({ open: true, venue, action })
  }

  const handleAction = async () => {
    if (!confirm.venue || !confirm.action) return
    try {
      if (confirm.action === 'APPROVE') await approveVenue(confirm.venue.id)
      else if (confirm.action === 'DISABLE') await disableVenue(confirm.venue.id)
      else if (confirm.action === 'ENABLE') await enableVenue(confirm.venue.id)

      toast.success(`Venue ${confirm.action.toLowerCase()}d successfully`)
      setConfirm({ open: false })
      fetchVenues()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    }
  }

  const query = search.trim().toLowerCase()
  const filtered = query
    ? venues.filter(v =>
        getVenueDisplayName(v).toLowerCase().includes(query) ||
        (v.city || '').toLowerCase().includes(query) ||
        (v.address || '').toLowerCase().includes(query) ||
        (v.ownerName || '').toLowerCase().includes(query)
      )
    : venues

  const getConfirmProps = () => {
    if (!confirm.action || !confirm.venue) return { title: '', message: '' }
    const name = getVenueDisplayName(confirm.venue)
    switch (confirm.action) {
      case 'APPROVE':
        return {
          title: 'Approve Venue',
          message: `Approve "${name}"? This will list it on Courtify and trigger a welcome notification.`,
        }
      case 'DISABLE':
        return { title: 'Disable Venue', message: `Disable "${name}"? It will be removed from listings.` }
      case 'ENABLE':
        return { title: 'Re-enable Venue', message: `Re-enable "${name}"? It will be listed again.` }
    }
  }

  const confirmProps = getConfirmProps()
  const activeCount = filter === 'PENDING'
    ? venues.length
    : venues.filter(v => !v.isDisabled && v.isApproved).length
  const disabledCount = venues.filter(v => v.isDisabled).length
  const pendingCount = venues.filter(v => !v.isDisabled && !v.isApproved).length

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Venues"
        subtitle={`${loading ? 'Loading venues…' : `${filtered.length} of ${total} venue${total === 1 ? '' : 's'}`}`}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-surface-variant p-1">
              <button
                className={`rounded-md px-4 py-1.5 text-body-sm font-medium transition-colors ${
                  filter === 'ALL' ? 'bg-surface text-primary shadow-sm' : 'text-secondary hover:text-primary'
                }`}
                onClick={() => setFilter('ALL')}
              >
                All Venues
              </button>
              <button
                className={`rounded-md px-4 py-1.5 text-body-sm font-medium transition-colors ${
                  filter === 'PENDING' ? 'bg-surface text-primary shadow-sm' : 'text-secondary hover:text-primary'
                }`}
                onClick={() => setFilter('PENDING')}
              >
                Pending
              </button>
            </div>
            <Button variant="secondary" size="icon" onClick={fetchVenues} title="Refresh" aria-label="Refresh venues">
              <RefreshCw size={16} className={loading ? 'animate-spin' : undefined} />
            </Button>
          </div>
        }
      />

      <FilterBar
        configs={[
          {
            key: 'search',
            label: 'Search',
            type: 'search',
            placeholder: 'Search by name, city, address or owner...',
          },
        ]}
        onFilterChange={(f) => setSearch(f.search || '')}
      />

      {!loading && !query && filter === 'ALL' && venues.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryTile label="Live" value={activeCount} tone="success" />
          <SummaryTile label="Pending" value={pendingCount} tone="warning" />
          <SummaryTile label="Disabled" value={disabledCount} tone="error" />
          <SummaryTile label="Total loaded" value={venues.length} tone="neutral" />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface animate-pulse"
            >
              <div className="h-32 w-full bg-surface-variant" />
              <div className="flex flex-col gap-2.5 p-4">
                <div className="h-5 w-3/4 rounded bg-surface-variant" />
                <div className="h-4 w-full rounded bg-surface-variant" />
                <div className="h-4 w-1/2 rounded bg-surface-variant" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
          <SearchX size={32} className="text-tertiary" />
          <p className="text-body font-medium text-primary">
            {query ? 'No venues match your search' : 'No venues found'}
          </p>
          <p className="max-w-sm text-body-sm text-secondary">
            {query
              ? 'Try a different name, city, address or owner.'
              : filter === 'PENDING'
                ? 'There are no venues waiting for approval right now.'
                : 'No venues have been registered yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(venue => (
            <AdminVenueCard
              key={venue.id}
              venue={venue}
              onApprove={v => openConfirm(v, 'APPROVE')}
              onDisable={v => openConfirm(v, 'DISABLE')}
              onEnable={v => openConfirm(v, 'ENABLE')}
            />
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false })}
        onConfirm={handleAction}
        title={confirmProps.title}
        message={confirmProps.message}
        confirmVariant={confirm.action === 'DISABLE' ? 'danger' : 'primary'}
        confirmLabel={
          confirm.action === 'APPROVE' ? 'Approve' : confirm.action === 'DISABLE' ? 'Disable' : 'Enable'
        }
      />
    </div>
  )
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'success' | 'warning' | 'error' | 'neutral'
}) {
  const toneClass = {
    success: 'text-success-text',
    warning: 'text-warning-text',
    error: 'text-error-text',
    neutral: 'text-primary',
  }[tone]

  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
      <p className="text-caption font-medium uppercase tracking-wide text-tertiary">{label}</p>
      <p className={`mt-1 text-h3 font-semibold ${toneClass}`}>{value}</p>
    </div>
  )
}
