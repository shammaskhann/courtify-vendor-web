'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Button } from '@/components/ui/Button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { AdminCourtCard } from '@/components/admin/AdminCourtCard'
import { RefreshCw, SearchX } from 'lucide-react'
import { getPendingCourts, searchCourts, approveCourt, disableCourt, enableCourt } from '@/lib/api/adminApi'
import { getCourtStatus } from '@/lib/venue'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Court } from '@/types/models'

type TabType = 'PENDING' | 'ALL'
type CourtAction = 'APPROVE' | 'DISABLE' | 'ENABLE'
type Filters = Record<string, string>

const PAGE_SIZE = 20

export default function AdminCourtsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('PENDING')
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [filters, setFilters] = useState<Filters>({})
  const [confirm, setConfirm] = useState<{ open: boolean; court?: Court; action?: CourtAction }>({ open: false })

  const fetchCourts = async () => {
    setLoading(true)
    try {
      const resp =
        activeTab === 'PENDING'
          ? await getPendingCourts(page, PAGE_SIZE)
          : await searchCourts({ page, size: PAGE_SIZE, ...filters })
      setCourts(resp.data || [])
      setTotalPages(Math.max(1, Math.ceil(resp.total / PAGE_SIZE)))
      setTotalElements(resp.total)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load courts')
      setCourts([])
      setTotalPages(1)
      setTotalElements(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourts()
  }, [activeTab, page, filters])

  const switchTab = (tab: TabType) => {
    setActiveTab(tab)
    setPage(0)
    setFilters({})
  }

  const openConfirm = (court: Court, action: CourtAction) => {
    setConfirm({ open: true, court, action })
  }

  const handleAction = async () => {
    if (!confirm.court || !confirm.action) return
    try {
      if (confirm.action === 'APPROVE') await approveCourt(confirm.court.id)
      else if (confirm.action === 'DISABLE') await disableCourt(confirm.court.id)
      else if (confirm.action === 'ENABLE') await enableCourt(confirm.court.id)

      toast.success(`Court ${confirm.action.toLowerCase()}d successfully`)
      setConfirm({ open: false })
      fetchCourts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    }
  }

  const getConfirmProps = () => {
    if (!confirm.action || !confirm.court) return { title: '', message: '' }
    const name = confirm.court.name || confirm.court.courtName || 'this court'
    switch (confirm.action) {
      case 'APPROVE':
        return {
          title: 'Approve Court',
          message: `Approve "${name}"? It will become bookable at its venue.`,
        }
      case 'DISABLE':
        return {
          title: 'Disable Court',
          message: `Disable "${name}"? It will stop accepting bookings and be hidden from listings.`,
        }
      case 'ENABLE':
        return { title: 'Re-enable Court', message: `Re-enable "${name}"? It will accept bookings again.` }
    }
  }

  const confirmProps = getConfirmProps()
  const hasFilters = Object.values(filters).some(Boolean)
  const counts = {
    approved: courts.filter(c => getCourtStatus(c) === 'APPROVED').length,
    pending: courts.filter(c => getCourtStatus(c) === 'PENDING').length,
    disabled: courts.filter(c => getCourtStatus(c) === 'DISABLED').length,
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Courts Management"
        subtitle="Review, approve, or take courts offline."
        actions={
          <Button
            variant="secondary"
            size="icon"
            onClick={fetchCourts}
            title="Refresh"
            aria-label="Refresh courts"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : undefined} />
          </Button>
        }
      />

      <div className="flex gap-1 rounded-lg bg-surface-variant p-1 sm:w-fit">
        {([
          { key: 'PENDING' as const, label: 'Pending Approval' },
          { key: 'ALL' as const, label: 'All Courts' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className={cn(
              'flex-1 rounded-md px-4 py-1.5 text-body-sm font-medium transition-colors sm:flex-none',
              activeTab === tab.key
                ? 'bg-surface text-primary shadow-sm'
                : 'text-secondary hover:text-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'ALL' && (
        <FilterBar
          configs={[
            { key: 'keyword', label: 'Search', type: 'search', placeholder: 'Court name...' },
            { key: 'city', label: 'City', type: 'search', placeholder: 'e.g. Lahore' },
            { key: 'sportType', label: 'Sport', type: 'search', placeholder: 'e.g. Futsal' },
          ]}
          onFilterChange={f => {
            setFilters(f as Filters)
            setPage(0)
          }}
        />
      )}

      {!loading && activeTab === 'ALL' && !hasFilters && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryTile label="On this page" value={courts.length} tone="neutral" />
          <SummaryTile label="Active" value={counts.approved} tone="success" />
          <SummaryTile label="Pending" value={counts.pending} tone="warning" />
          <SummaryTile label="Disabled" value={counts.disabled} tone="error" />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface animate-pulse"
            >
              <div className="h-28 w-full bg-surface-variant" />
              <div className="flex flex-col gap-2.5 p-4">
                <div className="h-4 w-2/3 rounded bg-surface-variant" />
                <div className="h-3 w-1/2 rounded bg-surface-variant" />
                <div className="h-3 w-1/3 rounded bg-surface-variant" />
              </div>
            </div>
          ))}
        </div>
      ) : courts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
          <SearchX size={32} className="text-tertiary" />
          <p className="text-body font-medium text-primary">
            {activeTab === 'PENDING'
              ? 'No pending courts'
              : hasFilters
                ? 'No courts match your filters'
                : 'No courts found'}
          </p>
          <p className="max-w-sm text-body-sm text-secondary">
            {activeTab === 'PENDING'
              ? 'Every court has been reviewed. New submissions will appear here.'
              : hasFilters
                ? 'Try a different court name, city or sport.'
                : 'No courts have been registered yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courts.map(court => (
            <AdminCourtCard
              key={court.id}
              court={court}
              linkToDetail
              showVenueName
              onApprove={c => openConfirm(c, 'APPROVE')}
              onDisable={c => openConfirm(c, 'DISABLE')}
              onEnable={c => openConfirm(c, 'ENABLE')}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row">
          <p className="text-body-sm text-secondary">
            Page <span className="font-medium text-primary">{page + 1}</span> of {totalPages}
            <span className="text-tertiary"> · {totalElements} courts total</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 0 || loading}
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
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
  tone: 'neutral' | 'success' | 'warning' | 'error'
}) {
  const toneClass = {
    neutral: 'text-primary',
    success: 'text-success-text',
    warning: 'text-warning-text',
    error: 'text-error-text',
  }[tone]

  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
      <p className="text-caption font-medium uppercase tracking-wide text-tertiary">{label}</p>
      <p className={cn('mt-1 text-h3 font-semibold', toneClass)}>{value}</p>
    </div>
  )
}
