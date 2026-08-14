'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { RefreshCw, CheckCircle, XCircle, RotateCcw, Eye } from 'lucide-react'
import { getAdminVenues, getPendingVenues, approveVenue, disableVenue, enableVenue } from '@/lib/api/adminApi'
import toast from 'react-hot-toast'
import type { AdminVenue } from '@/types/models'
import { ROUTES } from '@/lib/constants'

type TabFilter = 'ALL' | 'PENDING'

export default function AdminVenuesPage() {
  const router = useRouter()
  const [venues, setVenues] = useState<AdminVenue[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TabFilter>('ALL')
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState<{ open: boolean; venue?: AdminVenue; action?: 'APPROVE' | 'DISABLE' | 'ENABLE' }>({ open: false })

  const fetchVenues = async () => {
    setLoading(true)
    try {
      const resp = filter === 'PENDING' ? await getPendingVenues(0, 100) : await getAdminVenues(0, 100)
      setVenues(resp.data || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load venues')
      setVenues([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVenues()
  }, [filter])

  const openConfirm = (venue: AdminVenue, action: 'APPROVE' | 'DISABLE' | 'ENABLE') => {
    setConfirm({ open: true, venue, action })
  }

  const handleAction = async () => {
    if (!confirm.venue || !confirm.action) return
    try {
      if (confirm.action === 'APPROVE') await approveVenue(confirm.venue.id)
      else if (confirm.action === 'DISABLE') await disableVenue(confirm.venue.id)
      else if (confirm.action === 'ENABLE') await enableVenue(confirm.venue.id)
      
      toast.success(`Venue successfully ${confirm.action.toLowerCase()}d!`)
      setConfirm({ open: false })
      fetchVenues()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    }
  }

  const filtered = venues.filter(v => {
    const q = search.toLowerCase()
    return (v.businessName || v.name || '').toLowerCase().includes(q) || (v.city || '').toLowerCase().includes(q)
  })

  const getStatus = (venue: AdminVenue) => {
    if (venue.isDisabled) return 'DISABLED'
    if (venue.isApproved) return 'APPROVED'
    return 'PENDING'
  }

  const getConfirmProps = () => {
    if (!confirm.action || !confirm.venue) return { title: '', message: '', type: 'danger' as const }
    const name = confirm.venue.businessName || confirm.venue.name
    switch (confirm.action) {
      case 'APPROVE': return { title: 'Approve Venue', message: `Approve "${name}"? This will list it on Courtify and trigger a welcome notification.`, type: 'info' as const }
      case 'DISABLE': return { title: 'Disable Venue', message: `Disable "${name}"? It will be removed from listings.`, type: 'danger' as const }
      case 'ENABLE': return { title: 'Re-enable Venue', message: `Re-enable "${name}"?`, type: 'info' as const }
    }
  }

  const confirmProps = getConfirmProps()

  const columns = [
    { header: '#', accessor: (_: AdminVenue, i: number) => i + 1 },
    {
      header: 'Venue',
      accessor: (row: AdminVenue) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-bold text-primary">
            {(row.businessName || row.name || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-body">{row.businessName || row.name || 'Unnamed'}</p>
            <span className="text-sm text-secondary">{row.address || '—'}</span>
          </div>
        </div>
      )
    },
    { header: 'City', accessor: (row: AdminVenue) => row.city || '—' },
    {
      header: 'Status',
      accessor: (row: AdminVenue) => {
        const status = getStatus(row)
        if (status === 'APPROVED') return <StatusBadge status="ACTIVE" />
        if (status === 'DISABLED') return <StatusBadge status="DISABLED" />
        return <StatusBadge status="PENDING" />
      }
    },
    {
      header: 'Actions',
      accessor: (row: AdminVenue) => {
        const status = getStatus(row)
        return (
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => router.push(ROUTES.ADMIN_VENUE_DETAIL(row.id.toString()))}>
              <Eye size={14} className="mr-1" /> View
            </Button>
            {status === 'PENDING' && (
              <Button size="sm" variant="primary" onClick={() => openConfirm(row, 'APPROVE')}>
                <CheckCircle size={14} className="mr-1" /> Approve
              </Button>
            )}
            {status === 'APPROVED' && (
              <Button size="sm" variant="destructive" onClick={() => openConfirm(row, 'DISABLE')}>
                <XCircle size={14} className="mr-1" /> Disable
              </Button>
            )}
            {status === 'DISABLED' && (
              <Button size="sm" variant="secondary" onClick={() => openConfirm(row, 'ENABLE')}>
                <RotateCcw size={14} className="mr-1" /> Enable
              </Button>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Venues"
        subtitle={`${venues.length} venue${venues.length !== 1 ? 's' : ''} loaded`}
        actions={
          <div className="flex items-center gap-4">
            <div className="flex bg-surface-variant p-1 rounded-lg">
              <button
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'ALL' ? 'bg-surface shadow-sm text-primary' : 'text-secondary hover:text-primary'}`}
                onClick={() => setFilter('ALL')}
              >
                All Venues
              </button>
              <button
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'PENDING' ? 'bg-surface shadow-sm text-primary' : 'text-secondary hover:text-primary'}`}
                onClick={() => setFilter('PENDING')}
              >
                Pending
              </button>
            </div>
            <Button variant="secondary" size="icon" onClick={fetchVenues} title="Refresh">
              <RefreshCw size={16} />
            </Button>
          </div>
        }
      />

      <FilterBar
        configs={[{ key: 'search', label: 'Search', type: 'search', placeholder: 'Search by name or city...' }]}
        onFilterChange={(f) => setSearch(f.search || '')}
      />

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable
          columns={columns as any}
          data={filtered}
          isLoading={loading}
          keyExtractor={(row) => row.id.toString()}
          emptyStateTitle={search ? 'No venues match your search.' : 'No venues found.'}
          emptyStateDescription=""
        />
      </div>

      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false })}
        onConfirm={handleAction}
        title={confirmProps.title}
        message={confirmProps.message}
        confirmVariant={confirmProps.type === 'danger' ? 'danger' : 'primary'}
        confirmLabel={confirm.action === 'APPROVE' ? 'Approve' : confirm.action === 'DISABLE' ? 'Disable' : 'Enable'}
      />
    </div>
  )
}
