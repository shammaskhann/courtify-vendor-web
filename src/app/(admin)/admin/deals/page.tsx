'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getAdminDeals } from '@/lib/api/adminApi'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [filters, setFilters] = useState<Record<string, any>>({})

  const fetchDeals = async () => {
    setLoading(true)
    try {
      const res = await getAdminDeals({ page, size: 20, ...filters })
      setDeals(res.data || [])
      setTotalPages(Math.max(1, Math.ceil(res.total / 20)))
      setTotalElements(res.total)
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch deals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [page, filters])

  const columns = [
    {
      header: 'Deal Code / Title',
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{row.title || row.code || 'Unnamed Deal'}</span>
          <span className="text-sm text-secondary">{row.dealType}</span>
        </div>
      )
    },
    {
      header: 'Value',
      accessor: (row: any) => (
        <span className="font-medium text-brand">
          {row.dealType === 'PERCENTAGE' ? `${row.dealValue}% OFF` : `PKR ${row.dealValue}`}
        </span>
      )
    },
    {
      header: 'Validity',
      accessor: (row: any) => (
        <div className="flex flex-col text-sm">
          <span className="text-secondary">From: {row.validFrom ? format(new Date(row.validFrom), 'PP') : 'N/A'}</span>
          <span className="text-secondary">To: {row.validTo ? format(new Date(row.validTo), 'PP') : 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Usage',
      accessor: (row: any) => (
        <span className="text-sm text-secondary">
          {row.currentUses || 0} / {row.maxUses || '∞'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <StatusBadge status={row.isActive ? 'ACTIVE' : (row.isDeleted ? 'DELETED' : 'INACTIVE')} />
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Deals & Promotions"
        subtitle="Monitor and manage all vendor and platform deals."
      />

      <FilterBar
        configs={[
          { key: 'keyword', label: 'Search', type: 'search', placeholder: 'Search deals...' },
          { key: 'isActive', label: 'Status', type: 'select', options: [
            { label: 'Active Only', value: 'true' },
            { label: 'Inactive Only', value: 'false' }
          ]},
          { key: 'dealTypes', label: 'Deal Type', type: 'select', options: [
            { label: 'Percentage', value: 'PERCENTAGE' },
            { label: 'Fixed Amount', value: 'FIXED_AMOUNT' }
          ]}
        ]}
        onFilterChange={(f) => {
          setFilters(f)
          setPage(0)
        }}
      />

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable
          columns={columns as any}
          data={deals}
          isLoading={loading}
          keyExtractor={(row) => row.id.toString()}
          emptyStateTitle="No deals found matching your criteria."
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
    </div>
  )
}
