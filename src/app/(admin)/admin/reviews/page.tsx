'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { SlideOver } from '@/components/ui/SlideOver'
import { Star, Trash2, Eye } from 'lucide-react'
import { useReviews, useDeleteReview, useReviewDetail } from '@/hooks/useAdminReviews'
import { ReviewResponse } from '@/types/models'
import { format } from 'date-fns'

export default function AdminReviewsPage() {
  const [filters, setFilters] = useState<Record<string, any>>({ sort: 'createdAt,desc' })
  const [page, setPage] = useState(0)
  
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  // URL sync check (if courtId is passed from courts table)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const courtId = params.get('courtId')
    if (courtId) {
      setFilters(prev => ({ ...prev, courtId: Number(courtId) }))
    }
  }, [])

  // Fetch reviews
  const { data, isLoading, error } = useReviews({
    keyword: filters.keyword,
    courtId: filters.courtId,
    userId: filters.userId,
    minRating: filters.minRating ? Number(filters.minRating) : undefined,
    maxRating: filters.maxRating ? Number(filters.maxRating) : undefined,
    sort: filters.sort,
    page,
    size: 20
  })

  const deleteMutation = useDeleteReview()
  const detailQuery = useReviewDetail(selectedReviewId)

  const handleOpenDetail = (id: number) => {
    setSelectedReviewId(id)
    setIsDetailOpen(true)
  }
  
  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    // small delay so animation finishes before clearing state
    setTimeout(() => setSelectedReviewId(null), 300)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this review? This will permanently remove it and recalculate the court\'s rating.')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (selectedReviewId === id) handleCloseDetail()
        }
      })
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-brand text-brand" : "fill-transparent text-border"}
        />
      ))}
    </div>
  )

  const columns = [
    { 
      header: 'ID', 
      accessor: (row: ReviewResponse) => (
        <button 
          className="text-brand font-medium hover:underline text-sm"
          onClick={() => handleOpenDetail(row.id)}
        >
          #{row.id}
        </button>
      )
    },
    { 
      header: 'Player', 
      accessor: (row: ReviewResponse) => (
        <div>
          <div className="font-medium text-primary text-sm">{row.userName}</div>
          <div className="text-xs text-tertiary">ID: {row.userId}</div>
        </div>
      )
    },
    { 
      header: 'Court', 
      accessor: (row: ReviewResponse) => <span className="text-sm font-medium">{row.courtName}</span>
    },
    { 
      header: 'Rating', 
      accessor: (row: ReviewResponse) => renderStars(row.rating)
    },
    { 
      header: 'Comment', 
      accessor: (row: ReviewResponse) => (
        <span className="text-sm text-secondary truncate max-w-[200px] block" title={row.comment || ''}>
          {row.comment || <span className="text-tertiary italic">No comment</span>}
        </span>
      )
    },
    { 
      header: 'Date', 
      accessor: (row: ReviewResponse) => (
        <span className="text-sm text-secondary">
          {format(new Date(row.createdAt), 'MMM d, yyyy')}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (row: ReviewResponse) => (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => handleOpenDetail(row.id)}
            title="View Details"
          >
            <Eye size={16} className="text-secondary" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-error hover:bg-error-bg hover:text-error"
            onClick={() => handleDelete(row.id)}
            disabled={deleteMutation.isPending}
            title="Delete Review"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Review Moderation"
        subtitle="Manage and moderate court reviews submitted by players."
      />

      {error && (
        <div className="p-4 text-error bg-error-bg rounded-lg border border-error/20">
          Failed to load reviews: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      <FilterBar
        configs={[
          { key: 'keyword', label: 'Keyword', type: 'search', placeholder: 'Search comments...' },
          { key: 'userId', label: 'User ID', type: 'search', placeholder: 'Filter by User ID...' },
          { key: 'minRating', label: 'Min Rating', type: 'select', options: [1,2,3,4,5].map(n => ({ label: `${n} Stars`, value: String(n) })) },
          { key: 'maxRating', label: 'Max Rating', type: 'select', options: [1,2,3,4,5].map(n => ({ label: `${n} Stars`, value: String(n) })) },
          { key: 'sort', label: 'Sort', type: 'select', options: [
             { label: 'Latest', value: 'createdAt,desc' },
             { label: 'Oldest', value: 'createdAt,asc' },
             { label: 'Highest Rating', value: 'rating,desc' },
             { label: 'Lowest Rating', value: 'rating,asc' }
          ] }
        ]}
        onFilterChange={(f) => {
          setFilters(prev => ({ ...f, sort: f.sort || prev.sort })) // keep default sort if cleared
          setPage(0)
        }}
      />

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable<ReviewResponse>
          columns={columns}
          data={data?.content || []}
          isLoading={isLoading}
          keyExtractor={(row) => row.id.toString()}
          emptyStateDescription="No reviews found matching your criteria."
        />
        
        {/* Basic Pagination Controls */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-secondary">
              Showing page {data.page + 1} of {data.totalPages} ({data.totalElements} total)
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={data.page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={data.last}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <SlideOver
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        title={detailQuery.data ? `Review #${detailQuery.data.id}` : 'Loading...'}
        width="md"
      >
        {detailQuery.isLoading ? (
          <div className="p-8 text-center text-secondary">Loading details...</div>
        ) : detailQuery.error ? (
          <div className="p-4 text-error bg-error-bg rounded-lg border border-error/20">
            Failed to load review details.
          </div>
        ) : detailQuery.data ? (
          <div className="space-y-6">
            <div className="bg-surface-variant p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Player:</span>
                <span className="font-medium text-primary">{detailQuery.data.userName} (ID: {detailQuery.data.userId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Court:</span>
                <span className="font-medium text-primary">{detailQuery.data.courtName} (ID: {detailQuery.data.courtId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Booking ID:</span>
                <span className="font-medium text-primary">#{detailQuery.data.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Date:</span>
                <span className="font-medium text-primary">{format(new Date(detailQuery.data.createdAt), 'PPpp')}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-primary">Rating</h4>
                {renderStars(detailQuery.data.rating)}
                <span className="text-secondary text-sm">({detailQuery.data.rating}/5)</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-primary mb-2">Comment</h4>
              <div className="bg-surface border border-border p-4 rounded-lg text-body text-primary whitespace-pre-wrap">
                {detailQuery.data.comment ? (
                  <span className="italic">"{detailQuery.data.comment}"</span>
                ) : (
                  <span className="text-tertiary italic">No comment provided.</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-primary mb-2">Vendor Reply</h4>
              {detailQuery.data.vendorReply ? (
                <div className="bg-surface border border-border p-4 rounded-lg text-body text-primary whitespace-pre-wrap border-l-4 border-l-brand">
                  <span className="italic">"{detailQuery.data.vendorReply}"</span>
                  {detailQuery.data.repliedAt && (
                    <div className="text-xs text-tertiary mt-2">
                      Replied at: {format(new Date(detailQuery.data.repliedAt), 'PPp')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-tertiary text-sm italic">The vendor has not replied to this review.</div>
              )}
            </div>
            
            <div className="pt-6 mt-6 border-t border-border flex justify-end">
              <Button 
                variant="destructive" 
                onClick={() => handleDelete(detailQuery.data!.id)}
                isLoading={deleteMutation.isPending}
              >
                <Trash2 size={16} className="mr-2" /> Delete Review
              </Button>
            </div>
          </div>
        ) : null}
      </SlideOver>
    </div>
  )
}
