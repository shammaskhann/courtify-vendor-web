'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { RefreshCw, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { getPendingCourts, approveCourt, disableCourt, enableCourt } from '@/lib/api/adminApi'
import type { Court } from '@/types/models'

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState<{ open: boolean; court?: Court; action?: 'APPROVE' | 'DISABLE' | 'ENABLE' }>({ open: false })

  const fetchCourts = async () => {
    setLoading(true)
    try {
      const resp = await getPendingCourts(0, 100)
      setCourts(resp.data || [])
    } catch (err) {
      console.error(String(err))
      setCourts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourts()
  }, [])

  const openConfirm = (court: Court, action: 'APPROVE' | 'DISABLE' | 'ENABLE') => {
    setConfirm({ open: true, court, action })
  }

  const handleAction = async () => {
    if (!confirm.court || !confirm.action) return
    try {
      if (confirm.action === 'APPROVE') await approveCourt(confirm.court.id)
      else if (confirm.action === 'DISABLE') await disableCourt(confirm.court.id)
      else if (confirm.action === 'ENABLE') await enableCourt(confirm.court.id)
      
      setConfirm({ open: false })
      fetchCourts()
    } catch (err) {
      console.error(String(err))
    }
  }

  const filtered = courts.filter(c => {
    const q = search.toLowerCase()
    return (c.name || '').toLowerCase().includes(q) || (c.sportType || '').toString().toLowerCase().includes(q)
  })

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
    { header: '#', accessor: (_: Court, i: number) => i + 1 },
    {
      header: 'Court',
      accessor: (row: Court) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand">
            {(row.name || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-body">{row.name}</p>
            <span className="text-sm text-secondary">{row.sportType}</span>
          </div>
        </div>
      )
    },
    { header: 'Pricing', accessor: (row: Court) => row.pricingType || '—' },
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
      accessor: (row: Court) => {
        const status = getStatus(row)
        return (
          <div className="flex items-center justify-end gap-2">
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
        title="Pending Courts"
        subtitle={`${courts.length} court${courts.length !== 1 ? 's' : ''} loaded`}
        actions={
          <Button variant="secondary" size="icon" onClick={fetchCourts} title="Refresh">
            <RefreshCw size={16} />
          </Button>
        }
      />

      <FilterBar
        configs={[{ key: 'search', label: 'Search', type: 'search', placeholder: 'Search by court name or sport...' }]}
        onFilterChange={(f) => setSearch(f.search || '')}
      />

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable
          columns={columns as any}
          data={filtered}
          isLoading={loading}
          keyExtractor={(row) => row.id.toString()}
          emptyStateTitle={search ? 'No courts match your search.' : 'No pending courts found.'}
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
