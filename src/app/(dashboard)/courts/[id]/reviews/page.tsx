'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { ArrowLeft, MessageSquarePlus, Edit3, Loader2 } from 'lucide-react'
import { getCourtReviews } from '@/lib/api/reviewApi'
import { getCourtById } from '@/lib/api/courtApi'
import { ReplyToReviewModal } from '@/components/reviews/ReplyToReviewModal'
import type { Review } from '@/types/models'

export default function CourtReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id: courtId } = use(params)
  
  const [sort, setSort] = useState('createdAt,desc')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  const { data: court } = useQuery({
    queryKey: ['court', courtId],
    queryFn: () => getCourtById(courtId)
  })

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useInfiniteQuery({
    queryKey: ['court-reviews', courtId, sort],
    queryFn: ({ pageParam = 0 }) => getCourtReviews(courtId, { page: pageParam, size: 10, sort }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data.length === lastPage.pageSize) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 0
  })

  const reviews = data?.pages.flatMap(page => page.data) || []
  const totalElements = data?.pages[0]?.total || 0
  const avgRating = court?.avgRating || 0

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-sm ${i < rating ? 'text-brand' : 'text-border'}`}>★</span>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8 h-full max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Court
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold text-primary mb-2">Reviews: {court?.name || 'Loading...'}</h1>
          <div className="flex items-center gap-3">
            <span className="text-brand text-xl">★</span>
            <span className="font-semibold text-primary text-lg">{avgRating.toFixed(1)} average</span>
            <span className="text-secondary text-sm">• {totalElements} {totalElements === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>

        <select 
          className="bg-surface border border-border text-primary text-sm rounded-lg focus:ring-brand focus:border-brand p-2 w-full sm:w-auto"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="createdAt,desc">Latest First</option>
          <option value="createdAt,asc">Oldest First</option>
          <option value="rating,desc">Highest Rating</option>
          <option value="rating,asc">Lowest Rating</option>
        </select>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-brand" size={32} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mb-4 text-border">
              <span className="text-3xl">★</span>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">No Reviews Yet</h3>
            <p className="text-secondary text-sm max-w-md">Players haven't left any reviews for this court yet. Once they do, they'll appear here.</p>
          </div>
        ) : (
          <>
            {reviews.map(review => (
              <div key={review.id} className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold text-lg">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-primary">{review.userName}</p>
                      <p className="text-xs text-secondary">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                <p className="text-body text-primary">"{review.comment || 'No comment provided.'}"</p>

                {review.vendorReply ? (
                  <div className="mt-2 bg-surface-variant p-4 rounded-lg border border-border relative group">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-semibold text-brand">Your Reply</p>
                      {review.repliedAt && <p className="text-[10px] text-secondary">{new Date(review.repliedAt).toLocaleDateString()}</p>}
                    </div>
                    <p className="text-sm text-secondary">{review.vendorReply}</p>
                    <button 
                      onClick={() => setSelectedReview(review)}
                      className="absolute top-3 right-3 text-secondary hover:text-brand transition-colors p-1"
                      title="Edit Reply"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex justify-end">
                    <button 
                      className="text-sm font-medium text-brand hover:text-brand-hover flex items-center gap-1.5 transition-colors" 
                      onClick={() => setSelectedReview(review)}
                    >
                      <MessageSquarePlus size={16} /> Reply to {review.userName}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => fetchNextPage()} 
                  disabled={isFetchingNextPage}
                  className="bg-surface border border-border text-primary px-6 py-2 rounded-lg text-sm font-medium hover:bg-surface-variant transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isFetchingNextPage ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isFetchingNextPage ? 'Loading...' : 'Load More Reviews'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ReplyToReviewModal 
        isOpen={!!selectedReview} 
        onClose={() => setSelectedReview(null)} 
        review={selectedReview} 
      />
    </div>
  )
}
