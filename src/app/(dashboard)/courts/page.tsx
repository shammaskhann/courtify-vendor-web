'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SlideOver } from '@/components/ui/SlideOver'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { CourtForm } from '@/components/courts/CourtForm'
import { CourtDetailSlideOver } from '@/components/courts/CourtDetailSlideOver'
import { Plus } from 'lucide-react'
import { getCourts, createCourt, updateCourt, deleteCourt } from '@/lib/api/courtApi'
import { getVenues } from '@/lib/api/venueApi'
import { SPORT_TYPE_OPTIONS } from '@/lib/mock/data/metadata'
import type { Court, Venue } from '@/types/models'
import { useSearchParams, useRouter } from 'next/navigation'

export default function CourtsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const venueIdParam = searchParams.get('venueId')

  const [courts, setCourts] = useState<Court[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
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
    setDetailCourt(court)
    setIsDetailOpen(true)
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
        <span className="font-medium text-primary">{court.name}</span>
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
          {court.sportType}
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
      header: 'Status',
      render: (court: Court) => (
        <StatusBadge status={!court.isDisabled ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <PageHeader
        title="Courts"
        subtitle="Manage individual courts, pricing, and availability."
        actions={
          <Button onClick={handleCreateNew}>
            <Plus size={18} className="mr-2" />
            Add Court
          </Button>
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
        <DataTable
          data={courts}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(c) => c.id}
          onRowClick={handleRowClick}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          emptyStateTitle="No courts found"
          emptyStateDescription="Try adjusting your filters or add a new court."
        />
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
