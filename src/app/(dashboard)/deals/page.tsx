'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SlideOver } from '@/components/ui/SlideOver'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { DealForm } from '@/components/deals/DealForm'
import { Plus, Tag, Edit, Trash2, Power } from 'lucide-react'
import { getDeals, createDeal, updateDeal, deleteDeal, toggleDealActive } from '@/lib/api/dealApi'
import type { Deal } from '@/types/models'
import toast from 'react-hot-toast'

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Pagination & Filtering
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const pageSize = 15

  // Modals & Forms
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)

  const [dealToDelete, setDealToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const res = await getDeals({ page, pageSize: pageSize, ...filters })
      setDeals(res.data)
      setTotal(res.total)
    } catch (error) {
      console.error('Failed to fetch deals:', error)
      toast.error('Failed to fetch deals')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, filters])

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleCreateNew = () => {
    setEditingDeal(null)
    setIsFormOpen(true)
  }

  const handleEdit = (id: string) => {
    const deal = deals.find((d) => d.id === id)
    if (deal) {
      setEditingDeal(deal)
      setIsFormOpen(true)
    }
  }

  const handleDelete = (id: string) => {
    setDealToDelete(id)
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleDealActive(id)
      toast.success('Deal status updated')
      await fetchData()
    } catch (error: any) {
      console.error('Failed to toggle deal:', error)
      toast.error(error.message || 'Failed to update status')
    }
  }

  const confirmDelete = async () => {
    if (!dealToDelete) return
    try {
      setIsDeleting(true)
      await deleteDeal(dealToDelete)
      toast.success('Deal deleted successfully')
      await fetchData()
    } catch (error: any) {
      console.error('Failed to delete deal:', error)
      toast.error(error.message || 'Failed to delete deal')
    } finally {
      setIsDeleting(false)
      setDealToDelete(null)
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingDeal) {
        await updateDeal(editingDeal.id, data)
        toast.success('Deal updated successfully')
      } else {
        await createDeal(data)
        toast.success('Deal created successfully')
      }
      setIsFormOpen(false)
      await fetchData()
    } catch (error: any) {
      console.error('Failed to save deal:', error)
      toast.error(error.message || 'Failed to save deal')
      throw error
    }
  }

  const columns: import('@/components/ui/DataTable').ColumnDef<Deal>[] = [
    {
      header: 'Promo Code & Name',
      render: (deal: Deal) => (
        <div className="flex items-center gap-3">
          <div className="bg-brand/10 p-2 rounded border border-brand/20 shrink-0">
            <Tag size={18} className="text-brand" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-primary tracking-wide uppercase">{deal.promoCode}</span>
            <span className="text-caption text-secondary">{deal.name}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Discount',
      render: (deal: Deal) => (
        <span className="text-body-sm font-medium">
          {deal.dealType === 'PERCENTAGE_OFF' ? `${deal.dealValue}% OFF` : `PKR ${deal.dealValue} OFF`}
        </span>
      ),
    },
    {
      header: 'Usage',
      render: (deal: Deal) => {
        const uses = deal.usesCount || 0
        const max = deal.maxUses || 1
        const pct = Math.min((uses / max) * 100, 100)

        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1 text-caption text-secondary">
              <span>{uses} / {deal.maxUses || '∞'}</span>
              {deal.maxUses && <span className="font-medium">({Math.round(pct)}%)</span>}
            </div>
            {deal.maxUses && (
              <div className="w-24 h-1.5 bg-surface-variant rounded-pill overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: 'Validity',
      render: (deal: Deal) => (
        <div className="flex flex-col text-caption">
          <span className="text-secondary">From: <span className="font-medium text-primary">{new Date(deal.validFrom).toLocaleDateString()}</span></span>
          <span className="text-secondary">To: <span className="font-medium text-primary">{new Date(deal.validTo).toLocaleDateString()}</span></span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (deal: Deal) => (
        <StatusBadge status={deal.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      header: 'Actions',
      align: 'right' as const,
      render: (deal: Deal) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${deal.isActive ? 'text-success hover:bg-success-bg' : 'text-secondary hover:text-primary'}`}
            onClick={() => handleToggleStatus(deal.id)}
            title={deal.isActive ? "Deactivate Deal" : "Activate Deal"}
          >
            <Power size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:text-primary" onClick={() => handleEdit(deal.id)}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-error hover:text-error hover:bg-error-bg" onClick={() => handleDelete(deal.id)}>
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    }
  ]

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <PageHeader
        title="Promotions & Deals"
        subtitle="Create discount codes to attract more customers."
        actions={
          <Button onClick={handleCreateNew}>
            <Plus size={18} className="mr-2" />
            Create Deal
          </Button>
        }
      />

      <FilterBar
        configs={[
          { key: 'search', label: 'Search', type: 'search', placeholder: 'Search code or name...' },
          { key: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }] },
          {
            key: 'dealType', label: 'Type', type: 'select', options: [
              { label: 'Percentage Off', value: 'PERCENTAGE_OFF' },
              { label: 'Flat Off', value: 'FLAT_OFF' },
            ]
          },
        ]}
        onFilterChange={handleFilterChange}
      />

      <div className="flex-1">
        <DataTable
          data={deals}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(d) => d.id}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          emptyStateTitle="No deals found"
          emptyStateDescription="Try adjusting your filters or create a new promotional deal."
        />
      </div>

      <SlideOver
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingDeal ? 'Edit Deal' : 'Create New Deal'}
        subtitle={editingDeal ? 'Update discount values and validity.' : 'Set up a new promotional code.'}
      >
        <DealForm
          initialData={editingDeal}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </SlideOver>

      <ConfirmationModal
        isOpen={!!dealToDelete}
        onClose={() => setDealToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Deal"
        message="Are you sure you want to delete this deal? Customers will no longer be able to use this promo code."
        confirmLabel="Delete Deal"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
