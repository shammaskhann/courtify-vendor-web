'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Building2, User, Layers } from 'lucide-react'
import { getVenueById, approveVenue, disableVenue, enableVenue, getAdminCourtsByVenue, approveCourt, disableCourt, enableCourt } from '@/lib/api/adminApi'
import type { AdminVenue, Court } from '@/types/models'

export default function AdminVenueDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  
  const [venue, setVenue] = useState<AdminVenue | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState<{ open: boolean; target?: 'VENUE' | 'COURT'; item?: any; action?: 'APPROVE' | 'DISABLE' | 'ENABLE' }>({ open: false })

  const loadData = async () => {
    setLoading(true)
    try {
      const [venueRes, courtsRes] = await Promise.allSettled([
        getVenueById(id),
        getAdminCourtsByVenue(id)
      ])
      if (venueRes.status === 'fulfilled') setVenue(venueRes.value)
      if (courtsRes.status === 'fulfilled') setCourts(courtsRes.value.data || [])
    } catch (err) {
      console.error(String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleAction = async () => {
    if (!confirm.item || !confirm.action || !confirm.target) return
    try {
      if (confirm.target === 'VENUE') {
        if (confirm.action === 'APPROVE') await approveVenue(confirm.item.id)
        else if (confirm.action === 'DISABLE') await disableVenue(confirm.item.id)
        else if (confirm.action === 'ENABLE') await enableVenue(confirm.item.id)
      } else {
        if (confirm.action === 'APPROVE') await approveCourt(confirm.item.id)
        else if (confirm.action === 'DISABLE') await disableCourt(confirm.item.id)
        else if (confirm.action === 'ENABLE') await enableCourt(confirm.item.id)
      }
      
      setConfirm({ open: false })
      loadData()
    } catch (err) {
      console.error(String(err))
    }
  }

  const getVenueStatus = (v: AdminVenue) => {
    if (v.isDisabled) return 'DISABLED'
    if (v.isApproved) return 'APPROVED'
    return 'PENDING'
  }

  const getCourtStatus = (c: Court) => {
    if (c.isDisabled) return 'DISABLED'
    if ((c as any).isApproved === false) return 'PENDING' // courts use standard venue logic in admin if applicable
    return 'APPROVED'
  }

  const getConfirmProps = () => {
    if (!confirm.action || !confirm.item || !confirm.target) return { title: '', message: '', type: 'danger' as const }
    const name = confirm.target === 'VENUE' 
      ? (confirm.item.businessName || confirm.item.name)
      : confirm.item.name

    switch (confirm.action) {
      case 'APPROVE': return { title: `Approve ${confirm.target.toLowerCase()}`, message: `Approve "${name}"?`, type: 'info' as const }
      case 'DISABLE': return { title: `Disable ${confirm.target.toLowerCase()}`, message: `Disable "${name}"?`, type: 'danger' as const }
      case 'ENABLE': return { title: `Re-enable ${confirm.target.toLowerCase()}`, message: `Re-enable "${name}"?`, type: 'info' as const }
    }
  }

  const confirmProps = getConfirmProps()

  const courtColumns = [
    { header: '#', accessor: (_: Court, i: number) => i + 1 },
    { header: 'Court Name', accessor: (row: Court) => row.name },
    { header: 'Sport', accessor: (row: Court) => row.sportType || '—' },
    { header: 'Pricing', accessor: (row: Court) => row.pricingType || '—' },
    {
      header: 'Status',
      accessor: (row: Court) => {
        const s = getCourtStatus(row)
        if (s === 'APPROVED') return <StatusBadge status="ACTIVE" />
        if (s === 'DISABLED') return <StatusBadge status="DISABLED" />
        return <StatusBadge status="PENDING" />
      }
    },
    {
      header: 'Actions',
      accessor: (row: Court) => {
        const s = getCourtStatus(row)
        return (
          <div className="flex justify-end gap-2">
            {s === 'PENDING' && (
              <Button size="sm" variant="primary" onClick={() => setConfirm({ open: true, target: 'COURT', item: row, action: 'APPROVE' })}>
                Approve
              </Button>
            )}
            {s === 'APPROVED' && (
              <Button size="sm" variant="destructive" onClick={() => setConfirm({ open: true, target: 'COURT', item: row, action: 'DISABLE' })}>
                Disable
              </Button>
            )}
            {s === 'DISABLED' && (
              <Button size="sm" variant="secondary" onClick={() => setConfirm({ open: true, target: 'COURT', item: row, action: 'ENABLE' })}>
                Enable
              </Button>
            )}
          </div>
        )
      }
    }
  ]

  if (loading && !venue) {
    return <div className="p-8 text-secondary">Loading venue details...</div>
  }

  if (!venue) {
    return <div className="p-8 text-error">Venue not found</div>
  }

  const vStatus = getVenueStatus(venue)

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-h2 font-semibold">{venue.businessName || venue.name}</h1>
          <p className="text-secondary">{venue.city || venue.address}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {vStatus === 'PENDING' && (
            <Button variant="primary" onClick={() => setConfirm({ open: true, target: 'VENUE', item: venue, action: 'APPROVE' })}>
              <CheckCircle size={16} className="mr-2" /> Approve Venue
            </Button>
          )}
          {vStatus === 'APPROVED' && (
            <Button variant="destructive" onClick={() => setConfirm({ open: true, target: 'VENUE', item: venue, action: 'DISABLE' })}>
              <XCircle size={16} className="mr-2" /> Disable Venue
            </Button>
          )}
          {vStatus === 'DISABLED' && (
            <Button variant="secondary" onClick={() => setConfirm({ open: true, target: 'VENUE', item: venue, action: 'ENABLE' })}>
              <RotateCcw size={16} className="mr-2" /> Enable Venue
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Venue Info */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <h2 className="text-h4">Venue Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-secondary">Name</span>
              <span className="font-medium text-body">{venue.businessName || venue.name}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-secondary">Address</span>
              <span className="font-medium text-body">{venue.address}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-secondary">City</span>
              <span className="font-medium text-body">{venue.city}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-secondary">Created At</span>
              <span className="font-medium text-body">{venue.createdAt ? new Date(venue.createdAt).toLocaleDateString() : '—'}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-secondary">Status</span>
              <span className="font-medium text-body">
                {vStatus === 'APPROVED' ? <StatusBadge status="ACTIVE" /> : vStatus === 'DISABLED' ? <StatusBadge status="DISABLED" /> : <StatusBadge status="PENDING" />}
              </span>
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <User size={20} />
            </div>
            <h2 className="text-h4">Owner Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-secondary">Name</span>
              <span className="font-medium text-body">{venue.ownerName || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-secondary">Email</span>
              <span className="font-medium text-body">{venue.ownerEmail || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-secondary">Contact No.</span>
              <span className="font-medium text-body">{venue.contactNo || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Courts List */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden mt-2">
        <div className="p-4 border-b border-border flex items-center gap-3 bg-surface-variant/30">
          <Layers size={18} className="text-secondary" />
          <h2 className="text-h4">Courts</h2>
          <span className="badge badge-brand ml-2">{courts.length}</span>
        </div>
        <DataTable
          columns={courtColumns as any}
          data={courts}
          isLoading={loading}
          keyExtractor={(row) => row.id.toString()}
          emptyStateTitle="No courts found"
          emptyStateDescription="This venue has not added any courts yet."
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
