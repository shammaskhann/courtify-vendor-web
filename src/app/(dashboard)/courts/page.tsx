'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SlideOver } from '@/components/ui/SlideOver'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { CourtCard } from '@/components/courts/CourtCard'
import { LayoutGrid, List, Plus, Wrench, Edit, Trash2 } from 'lucide-react'
import { CourtDetailSlideOver } from '@/components/courts/CourtDetailSlideOver'
import { CourtForm } from '@/components/courts/CourtForm'
import { getCourts, createCourt, updateCourt, deleteCourt, toggleCourtMaintenance } from '@/lib/api/courtApi'
import { getVenues } from '@/lib/api/venueApi'
import { SPORT_TYPE_OPTIONS } from '@/lib/mock/data/metadata'
import type { Court, Venue } from '@/types/models'
import { useSearchParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function CourtsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const venueIdParam = searchParams.get('venueId')

  const [courts, setCourts] = useState<Court[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  
  // Pagination & Filtering
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, any>>(
    venueIdParam ? { venueId: venueIdParam } : {}
  )
  const pageSize = 15

  // Modals & Forms
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  
  const [detailCourt, setDetailCourt] = useState<Court | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  const [courtToDelete, setCourtToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [courtsRes, venuesRes] = await Promise.all([
        getCourts({ page, pageSize: pageSize, ...filters }),
        getVenues({ pageSize: 100 }) // Fetch all venues for the dropdown filter/form
      ])
      setCourts(courtsRes.data)
      setTotal(courtsRes.total)
      setVenues(venuesRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, filters])

  // Update URL when filters change if venueId was in URL
  useEffect(() => {
    if (venueIdParam && filters.venueId !== venueIdParam) {
      router.replace('/courts', undefined) // clear query param visually if filter changed
    }
  }, [filters, venueIdParam, router])

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleCreateNew = () => {
    setEditingCourt(null)
    setIsFormOpen(true)
  }

  const handleEdit = (id: string) => {
    const court = courts.find((c) => c.id === id)
    if (court) {
      setEditingCourt(court)
      setIsFormOpen(true)
    }
  }

  const handleRowClick = (court: Court) => {
    router.push(`/courts/${court.id}`)
  }

  const handleDelete = (id: string) => {
    setCourtToDelete(id)
  }

  const confirmDelete = async () => {
    if (!courtToDelete) return
    try {
      setIsDeleting(true)
      const court = courts.find(c => c.id === courtToDelete)
      if (court) {
        await deleteCourt(court.venueId, courtToDelete)
      }
      await fetchData()
      setCourtToDelete(null)
      if (detailCourt?.id === courtToDelete) setIsDetailOpen(false)
    } catch (error) {
      console.error('Failed to delete court:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleMaintenance = async (id: string, isMaintenance: boolean) => {
    try {
      await toggleCourtMaintenance(id, isMaintenance)
      toast.success(isMaintenance ? 'Court is now under maintenance' : 'Court is now active')
      await fetchData()
      if (detailCourt?.id === id) {
        setDetailCourt({ ...detailCourt, isDisabled: isMaintenance })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update court status')
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingCourt) {
        await updateCourt(editingCourt.venueId, editingCourt.id, data)
      } else {
        await createCourt(data.venueId, data)
      }
      setIsFormOpen(false)
      await fetchData()
      if (detailCourt) {
        // refresh detail view if open
        const updated = await getCourts({ page: 1, pageSize: 1, search: data.name })
        if (updated.data[0]) setDetailCourt(updated.data[0])
      }
    } catch (error) {
      console.error('Failed to save court:', error)
      throw error
    }
  }

  const venueOptions = venues.map(v => ({ label: v.name, value: v.id }))

  const columns: import('@/components/ui/DataTable').ColumnDef<Court>[] = [
    {
      header: 'Court Name',
      key: 'name',
      sortable: true,
      render: (court: Court) => (
        <span className="font-medium text-primary">{court.name || court.courtName || 'Unknown Court'}</span>
      ),
    },
    {
      header: 'Venue',
      render: (court: Court) => {
        const venueName = venues.find(v => v.id === court.venueId)?.name || 'Unknown Venue'
        return <span className="text-secondary">{venueName}</span>
      },
    },
    {
      header: 'Sport Type',
      key: 'sportType',
      render: (court: Court) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-variant text-secondary">
          {Array.isArray(court.sportType) ? court.sportType.join(', ') : court.sportType}
        </span>
      ),
    },
    {
      header: 'Rate/Hr',
      sortable: true,
      align: 'right' as const,
      render: (court: Court) => (
        <span className="font-medium">PKR {court.constantPriceOffPeak?.toLocaleString() || 0}</span>
      ),
    },
    {
      header: 'Rating',
      render: (court: Court) => (
        <div 
          className="flex items-center gap-1 cursor-pointer hover:bg-surface-variant p-1 -m-1 rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/courts/${court.id}/reviews`)
          }}
        >
          <span className="text-brand">★</span>
          {court.reviewCount && court.reviewCount > 0 ? (
            <span className="text-sm font-medium text-primary">
              {court.avgRating?.toFixed(1) || '0.0'} <span className="text-secondary font-normal">({court.reviewCount})</span>
            </span>
          ) : (
            <span className="text-xs text-secondary">No reviews</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      render: (court: Court) => (
        court.isDisabled ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-error/10 text-error tracking-wide">
            MAINTENANCE
          </span>
        ) : (
          <StatusBadge status="ACTIVE" />
        )
      ),
    },
    {
      header: '',
      align: 'right' as const,
      render: (court: Court) => (
        <div className="flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${court.isDisabled ? 'text-brand bg-brand/10 hover:bg-brand/20' : 'text-secondary hover:text-primary'}`}
            onClick={() => handleToggleMaintenance(court.id, !court.isDisabled)}
            title={court.isDisabled ? "Enable Court" : "Set to Maintenance"}
          >
            <Wrench size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-secondary hover:text-primary"
            onClick={() => handleEdit(court.id)}
            title="Edit court"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-error hover:text-error hover:bg-error-bg"
            onClick={() => handleDelete(court.id)}
            title="Delete court"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )
    },
  ]

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <PageHeader
        title="Courts"
        subtitle="Manage individual courts, pricing, and availability."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-surface border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-surface-variant text-primary shadow-sm' : 'text-tertiary hover:text-secondary'}`}
                aria-label="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-surface-variant text-primary shadow-sm' : 'text-tertiary hover:text-secondary'}`}
                aria-label="Table view"
              >
                <List size={18} />
              </button>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus size={18} className="mr-2" />
              Add Court
            </Button>
          </div>
        }
      />

      <FilterBar
        configs={[
          { key: 'search', label: 'Search', type: 'search', placeholder: 'Search courts...' },
          { key: 'venueId', label: 'Venue', type: 'select', options: venueOptions },
          { key: 'sportType', label: 'Sport Type', type: 'select', options: SPORT_TYPE_OPTIONS.map(s => ({ label: s, value: s })) },
          { key: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }] },
        ]}
        onFilterChange={handleFilterChange}
      />

      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : courts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-surface border border-border rounded-xl">
            <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center text-tertiary mb-4">
              <Plus size={32} />
            </div>
            <h3 className="text-h5 font-semibold text-primary mb-2">No courts found</h3>
            <p className="text-secondary text-body-sm text-center max-w-sm mb-6">
              Try adjusting your filters or add a new court.
            </p>
            <Button onClick={handleCreateNew}>Add Court</Button>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  venueName={venues.find(v => v.id === court.venueId)?.name}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleMaintenance={handleToggleMaintenance}
                />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {total > pageSize && (
              <div className="flex items-center justify-between border-t border-border mt-8 pt-4">
                <p className="text-body-sm text-secondary">
                  Showing <span className="font-medium text-primary">{(page - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium text-primary">{Math.min(page * pageSize, total)}</span> of{' '}
                  <span className="font-medium text-primary">{total}</span> courts
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / pageSize)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <DataTable
            data={courts}
            columns={columns}
            isLoading={false}
            keyExtractor={(c) => c.id}
            onRowClick={handleRowClick}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            emptyStateTitle="No courts found"
            emptyStateDescription="Try adjusting your filters or add a new court."
          />
        )}
      </div>

      {/* Detail SlideOver */}
      <CourtDetailSlideOver
        court={detailCourt}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form SlideOver */}
      <SlideOver
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCourt ? 'Edit Court' : 'Add New Court'}
        subtitle={editingCourt ? 'Update court pricing and availability.' : 'Create a new court for your venue.'}
      >
        <CourtForm
          initialData={editingCourt}
          venues={venueOptions}
          preselectedVenueId={venueIdParam || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </SlideOver>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!courtToDelete}
        onClose={() => setCourtToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Court"
        message="Are you sure you want to delete this court? This action cannot be undone."
        confirmLabel="Delete Court"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
