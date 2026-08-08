'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { VenueCard } from '@/components/venues/VenueCard'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SlideOver } from '@/components/ui/SlideOver'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { VenueForm } from '@/components/venues/VenueForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { LayoutGrid, List, Plus } from 'lucide-react'
import { getVenues, createVenue, updateVenue, deleteVenue } from '@/lib/api/venueApi'
import { useMetadata } from '@/contexts/MetadataContext'
import type { Venue } from '@/types/models'
import { ROUTES } from '@/lib/constants'


export default function VenuesPage() {
  const router = useRouter()
  const { cities } = useMetadata()
  const [venues, setVenues] = useState<Venue[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Pagination & Filtering
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const pageSize = 12

  // Modals & Forms
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [venueToDelete, setVenueToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchVenues = async () => {
    try {
      setIsLoading(true)
      const res = await getVenues({ page, pageSize: pageSize, ...filters })
      setVenues(res.data)
      setTotal(res.total)
    } catch (error) {
      console.error('Failed to fetch venues:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVenues()
  }, [page, filters])

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleCreateNew = () => {
    setEditingVenue(null)
    setIsFormOpen(true)
  }

  const handleEdit = (id: string) => {
    const venue = venues.find((v) => v.id === id)
    if (venue) {
      setEditingVenue(venue)
      setIsFormOpen(true)
    }
  }

  const handleDelete = (id: string) => {
    setVenueToDelete(id)
  }

  const confirmDelete = async () => {
    if (!venueToDelete) return
    try {
      setIsDeleting(true)
      await deleteVenue(venueToDelete)
      await fetchVenues()
      setVenueToDelete(null)
    } catch (error) {
      console.error('Failed to delete venue:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingVenue) {
        await updateVenue(editingVenue.id, data)
      } else {
        await createVenue(data)
      }
      setIsFormOpen(false)
      await fetchVenues()
    } catch (error) {
      console.error('Failed to save venue:', error)
      throw error // Let the form handle the loading state revert
    }
  }

  const columns: import('@/components/ui/DataTable').ColumnDef<Venue>[] = [
    {
      header: 'Venue',
      key: 'name',
      render: (venue: Venue) => (
        <div className="flex items-center gap-3">
          <img src={venue.venueImage || venue.image || 'https://picsum.photos/seed/newvenue/800/450'} alt={venue.name} className="w-10 h-10 rounded-md object-cover" />
          <div className="flex flex-col">
            <span className="font-medium text-primary">{venue.name}</span>
            <span className="text-caption text-secondary">{venue.city}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      // Removed key since it is not in keyof Venue
      render: (venue: Venue) => (
        <StatusBadge status={venue.isDisabled ? 'INACTIVE' : (venue.isApproved ? 'ACTIVE' : 'PENDING')} />
      ),
    },
    {
      header: 'Courts',
      key: 'courtCount',
      render: (venue: Venue) => (
        <span className="text-body-sm font-medium">{venue.courtCount}</span>
      ),
    },
    {
      header: 'Hours',
      render: (venue: Venue) => (
        <span className="text-body-sm text-secondary">{venue.openingTime} - {venue.closingTime}</span>
      ),
    },
    {
      header: 'Actions',
      align: 'right' as const,
      render: (venue: Venue) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(venue.id)}>Edit</Button>
          <Button variant="ghost" size="sm" className="text-error hover:text-error hover:bg-error-bg" onClick={() => handleDelete(venue.id)}>Delete</Button>
        </div>
      ),
    }
  ]

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <PageHeader
        title="Venues"
        subtitle="Manage your sports facilities and locations."
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
              Add Venue
            </Button>
          </div>
        }
      />

      <FilterBar
        configs={[
          { key: 'search', label: 'Search', type: 'search', placeholder: 'Search venues...' },
          { key: 'city', label: 'City', type: 'select', options: cities.map(c => ({ label: c.name, value: c.name })) },
          { key: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }] },
        ]}
        onFilterChange={handleFilterChange}
      />

      {viewMode === 'grid' ? (
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl h-[320px] overflow-hidden">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : venues.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mb-4 text-tertiary">
                <LayoutGrid size={32} />
              </div>
              <h3 className="text-h4 font-semibold text-primary mb-2">No venues found</h3>
              <p className="text-body text-secondary max-w-sm mb-6">We couldn't find any venues matching your criteria. Try adjusting your filters or add a new venue.</p>
              <Button onClick={handleCreateNew}>Add Your First Venue</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                {venues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
              {/* Grid Pagination - Simple mock since grid doesn't use DataTable pagination directly */}
              {total > pageSize && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                    <span className="text-body-sm font-medium px-4">Page {page} of {Math.ceil(total / pageSize)}</span>
                    <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))} disabled={page === Math.ceil(total / pageSize)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <DataTable
          data={venues}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(v) => v.id}
          onRowClick={(v) => router.push(`${ROUTES.VENUES}/${v.id}`)}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          emptyStateTitle="No venues found"
          emptyStateDescription="Try adjusting your filters or add a new venue."
        />
      )}

      {/* Forms and Modals */}
      <SlideOver
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingVenue ? 'Edit Venue' : 'Add New Venue'}
        subtitle={editingVenue ? 'Update your facility details.' : 'Create a new sports facility location.'}
        width="lg"
      >
        <VenueForm
          initialData={editingVenue}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </SlideOver>

      <ConfirmationModal
        isOpen={!!venueToDelete}
        onClose={() => setVenueToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Venue"
        message="Are you sure you want to delete this venue? This action cannot be undone and will hide all associated courts."
        confirmLabel="Delete Venue"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
