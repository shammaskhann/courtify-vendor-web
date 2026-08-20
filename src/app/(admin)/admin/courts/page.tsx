'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { RefreshCw, CheckCircle, XCircle, RotateCcw, Star } from 'lucide-react'
import { getPendingCourts, searchCourts, approveCourt, disableCourt, enableCourt } from '@/lib/api/adminApi'
import toast from 'react-hot-toast'
import Link from 'next/link'
import type { Court } from '@/types/models'

type TabType = 'PENDING' | 'ALL'

export default function AdminCourtsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('PENDING')
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [confirm, setConfirm] = useState<{ open: boolean; court?: Court; action?: 'APPROVE' | 'DISABLE' | 'ENABLE' }>({ open: false })

  const fetchCourts = async () => {
    setLoading(true)
    try {
      let resp
      if (activeTab === 'PENDING') {
        resp = await getPendingCourts(page, 20)
      } else {
        resp = await searchCourts({ page, size: 20, ...filters })
      }
      setCourts(resp.data || [])
      setTotalPages(Math.max(1, Math.ceil(resp.total / 20)))
      setTotalElements(resp.total)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load courts')
      setCourts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourts()
  }, [activeTab, page, filters])

  const openConfirm = (court: Court, action: 'APPROVE' | 'DISABLE' | 'ENABLE') => {
    setConfirm({ open: true, court, action })
  }

  const handleAction = async () => {
    if (!confirm.court || !confirm.action) return
    try {
      if (confirm.action === 'APPROVE') await approveCourt(confirm.court.id)
      else if (confirm.action === 'DISABLE') await disableCourt(confirm.court.id)
      else if (confirm.action === 'ENABLE') await enableCourt(confirm.court.id)
      
      toast.success(`Court successfully ${confirm.action.toLowerCase()}d!`)
      setConfirm({ open: false })
      fetchCourts()
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    }
  }

  const getStatus = (court: Court) => {
    if (court.isDisabled) return 'DISABLED'
    if ((court as any).isApproved === false) return 'PENDING'
    return 'APPROVED'
  }

  const getConfirmProps = () => {
    if (!confirm.action || !confirm.court) return { title: '', message: '', type: 'danger' as const }
    const name = confirm.court.name
    switch (confirm.action) {
      case 'APPROVE': return { title: 'Approve Court', message: `Approve "${name}"?`, type: 'info' as const }
      case 'DISABLE': return { title: 'Disable Court', message: `Disable "${name}"?`, type: 'danger' as const }
      case 'ENABLE': return { title: 'Re-enable Court', message: `Re-enable "${name}"?`, type: 'info' as const }
    }
  }

  const confirmProps = getConfirmProps()

  const columns = [
    {
      header: 'Court & Sport',
      accessor: (row: Court) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand">
            {(row.name || '?')[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <p className="font-medium text-primary max-w-[200px] truncate" title={row.name}>{row.name}</p>
            <span className="text-xs text-secondary">{row.sportType || 'Unknown Sport'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Pricing',
      accessor: (row: Court) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">{row.pricingType || '—'}</span>
          <span className="text-xs text-secondary">Base: PKR {row.constantPriceOffPeak || 0}</span>
        </div>
      )
    },
    {
      header: 'Rating',
      accessor: (row: Court) => {
        if (!row.reviewCount) return <span className="text-secondary text-xs">No reviews</span>
        return (
          <Link 
            href={`/admin/reviews?courtId=${row.id}`}
            className="flex items-center gap-1 text-sm hover:text-brand transition-colors"
          >
            <Star size={14} className="fill-brand text-brand" />
            <span className="font-medium">{row.avgRating?.toFixed(1) || '0.0'}</span>
            <span className="text-secondary text-xs">({row.reviewCount})</span>
          </Link>
        )
      }
    },
    {
      header: 'Status',
      accessor: (row: Court) => {
        const status = getStatus(row)
        if (status === 'APPROVED') return <StatusBadge status="ACTIVE" />
        if (status === 'DISABLED') return <StatusBadge status="DISABLED" />
        return <StatusBadge status="PENDING" />
      }
    },
    {
      header: 'Actions',
      align: 'right' as const,
      accessor: (row: Court) => {
        const status = getStatus(row)
        return (
          <div className="flex items-center justify-end gap-1">
            {status === 'PENDING' && (
              <Button size="sm" variant="ghost" className="text-success hover:bg-success/10 h-8" onClick={() => openConfirm(row, 'APPROVE')}>
                <CheckCircle size={16} className="mr-1" /> Approve
              </Button>
            )}
            {status === 'APPROVED' && (
              <Button size="sm" variant="ghost" className="text-error hover:bg-error/10 h-8" onClick={() => openConfirm(row, 'DISABLE')}>
                <XCircle size={16} className="mr-1" /> Disable
              </Button>
            )}
            {status === 'DISABLED' && (
              <Button size="sm" variant="ghost" className="text-secondary hover:bg-surface-variant h-8" onClick={() => openConfirm(row, 'ENABLE')}>
                <RotateCcw size={16} className="mr-1" /> Enable
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
        title="Courts Management"
        subtitle="Manage, approve, or disable courts."
        actions={
          <Button variant="secondary" size="icon" onClick={fetchCourts} title="Refresh">
            <RefreshCw size={16} />
          </Button>
        }
      />

      <div className="flex border-b border-border gap-6">
        <button
          className={`pb-3 font-medium transition-colors text-sm ${
            activeTab === 'PENDING' ? 'border-b-2 border-brand text-brand' : 'text-secondary hover:text-primary'
          }`}
          onClick={() => { setActiveTab('PENDING'); setPage(0); setFilters({}); }}
        >
          Pending Approval
        </button>
        <button
          className={`pb-3 font-medium transition-colors text-sm ${
            activeTab === 'ALL' ? 'border-b-2 border-brand text-brand' : 'text-secondary hover:text-primary'
          }`}
          onClick={() => { setActiveTab('ALL'); setPage(0); setFilters({}); }}
        >
          All Courts
        </button>
      </div>

      {activeTab === 'ALL' && (
        <FilterBar
          configs={[
            { key: 'keyword', label: 'Search', type: 'search', placeholder: 'Court name...' },
            { key: 'city', label: 'City', type: 'search', placeholder: 'e.g. Lahore' },
            { key: 'sportType', label: 'Sport', type: 'search', placeholder: 'e.g. Futsal' }
          ]}
          onFilterChange={(f) => {
            setFilters(f)
            setPage(0)
          }}
        />
      )}

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable
          columns={columns as any}
          data={courts}
          isLoading={loading}
          keyExtractor={(row) => row.id.toString()}
          emptyStateTitle={activeTab === 'PENDING' ? 'No pending courts' : 'No courts found.'}
        />
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-secondary">
              Showing page {page + 1} of {totalPages} ({totalElements} total)
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
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
