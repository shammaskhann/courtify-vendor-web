'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Store, AlertTriangle, Check, X, Trash2, Ban } from 'lucide-react'
import { format } from 'date-fns'
import { MarketListing, MarketReport } from '@/types/marketplace'
import {
  useAdminListings,
  useAdminReports,
  useUpdateListingStatus,
  useDeleteListing,
  useResolveReport,
} from '@/hooks/useAdminMarketplace'

type TabId = 'listings' | 'reports'

export default function AdminMarketplacePage() {
  const [activeTab, setActiveTab] = useState<TabId>('listings')

  // Queries
  const { data: listingsData, isLoading: isLoadingListings, error: listingsError } = useAdminListings()
  const { data: reportsData, isLoading: isLoadingReports, error: reportsError } = useAdminReports()

  // Mutations
  const updateStatusMutation = useUpdateListingStatus()
  const deleteListingMutation = useDeleteListing()
  const resolveReportMutation = useResolveReport()

  const listings = listingsData?.content || []
  const reports = reportsData?.content || []

  const handleDeleteListing = (id: string | number) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return
    deleteListingMutation.mutate(id)
  }

  const handleSuspendListing = (id: string | number, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
    updateStatusMutation.mutate({ id, status: newStatus })
  }

  const handleReportAction = (id: string | number, action: 'RESOLVED' | 'DISMISSED') => {
    resolveReportMutation.mutate({ id, status: action })
  }

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val)
  }

  const renderListingsTab = () => (
    <div className="space-y-4">
      {listingsError && <div className="p-4 text-error bg-error-bg rounded-lg">{(listingsError as Error).message}</div>}
      <DataTable<MarketListing>
        data={listings}
        columns={[
          {
            header: 'Item',
            accessor: (listing) => (
              <div>
                <p className="font-medium text-primary">{listing.title}</p>
                <p className="text-caption text-tertiary">{listing.sportType} • {listing.condition}</p>
              </div>
            )
          },
          {
            header: 'Price',
            accessor: (listing) => <span className="font-medium">{formatPrice(listing.price)}</span>
          },
          {
            header: 'Seller',
            accessor: (listing) => (
              <div>
                <p className="text-body-sm">{listing.sellerName}</p>
                <p className="text-caption text-tertiary">{listing.sellerPhone}</p>
              </div>
            )
          },
          {
            header: 'Location',
            accessor: (listing) => <span className="text-body-sm">{listing.area ? `${listing.area}, ` : ''}{listing.city}</span>
          },
          {
            header: 'Status',
            accessor: (listing) => <StatusBadge status={listing.status} />
          },
          {
            header: 'Date',
            accessor: (listing) => <span className="text-body-sm text-secondary">{format(new Date(listing.createdAt), 'MMM d, yyyy')}</span>
          },
          {
            header: 'Actions',
            accessor: (listing) => (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  title={listing.status === 'SUSPENDED' ? 'Activate Listing' : 'Suspend Listing'}
                  onClick={(e) => { e.stopPropagation(); handleSuspendListing(listing.id, listing.status) }}
                  disabled={updateStatusMutation.isPending}
                >
                  <Ban size={16} className={listing.status === 'SUSPENDED' ? 'text-success' : 'text-warning'} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-error hover:bg-error-bg hover:text-error"
                  title="Delete Listing"
                  onClick={(e) => { e.stopPropagation(); handleDeleteListing(listing.id) }}
                  disabled={deleteListingMutation.isPending}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )
          }
        ]}
        keyExtractor={(item) => item.id.toString()}
        isLoading={isLoadingListings}
        emptyStateDescription="No marketplace listings found."
      />
    </div>
  )

  const renderReportsTab = () => (
    <div className="space-y-4">
      {reportsError && <div className="p-4 text-error bg-error-bg rounded-lg">{(reportsError as Error).message}</div>}
      <DataTable<MarketReport>
        data={reports}
        columns={[
          {
            header: 'Listing',
            accessor: (report) => (
              <div>
                <p className="font-medium text-primary">{report.listingTitle || `Listing #${report.listingId}`}</p>
              </div>
            )
          },
          {
            header: 'Reason',
            accessor: (report) => <span className="text-body-sm text-secondary max-w-[300px] truncate block" title={report.reason}>{report.reason}</span>
          },
          {
            header: 'Reporter',
            accessor: (report) => <span className="text-body-sm">{report.reporterName || `User #${report.reporterId}`}</span>
          },
          {
            header: 'Status',
            accessor: (report) => <StatusBadge status={report.status} />
          },
          {
            header: 'Date',
            accessor: (report) => <span className="text-body-sm text-secondary">{format(new Date(report.createdAt), 'MMM d, yyyy')}</span>
          },
          {
            header: 'Actions',
            accessor: (report) => (
              <div className="flex items-center gap-2">
                {report.status === 'PENDING' && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-success hover:bg-success-bg hover:text-success"
                      title="Mark as Resolved"
                      onClick={(e) => { e.stopPropagation(); handleReportAction(report.id, 'RESOLVED') }}
                      disabled={resolveReportMutation.isPending}
                    >
                      <Check size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-secondary hover:bg-surface-variant hover:text-primary"
                      title="Dismiss Report"
                      onClick={(e) => { e.stopPropagation(); handleReportAction(report.id, 'DISMISSED') }}
                      disabled={resolveReportMutation.isPending}
                    >
                      <X size={16} />
                    </Button>
                  </>
                )}
              </div>
            )
          }
        ]}
        keyExtractor={(item) => item.id.toString()}
        isLoading={isLoadingReports}
        emptyStateDescription="No reports found."
      />
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketplace Admin"
        subtitle="Manage listings, moderate items, and handle user reports across the marketplace."
      />

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-4 text-body font-medium transition-colors relative ${
            activeTab === 'listings' ? 'text-brand' : 'text-secondary hover:text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Store size={18} />
            <span>All Listings</span>
          </div>
          {activeTab === 'listings' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-4 text-body font-medium transition-colors relative ${
            activeTab === 'reports' ? 'text-brand' : 'text-secondary hover:text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>Moderation Reports</span>
          </div>
          {activeTab === 'reports' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full" />
          )}
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {activeTab === 'listings' ? renderListingsTab() : renderReportsTab()}
      </div>
    </div>
  )
}
