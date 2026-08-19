import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquarePlus, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Review } from '@/types/models'
import { ReplyToReviewModal } from './ReplyToReviewModal'

interface CourtReviewsSectionProps {
  courtId: string | number
  avgRating?: number
  reviewCount?: number
  latestReviews?: Review[]
}

export function CourtReviewsSection({ courtId, avgRating = 0, reviewCount = 0, latestReviews = [] }: CourtReviewsSectionProps) {
  const router = useRouter()
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

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
    <>
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-h4 font-semibold text-primary mb-1">Player Reviews</h3>
            <div className="flex items-center gap-2">
              <span className="text-brand text-lg">★</span>
              <span className="font-semibold text-primary">{avgRating.toFixed(1)} average</span>
              <span className="text-secondary text-sm">• {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => router.push(`/courts/${courtId}/reviews`)}
            disabled={reviewCount === 0}
          >
            See All Reviews
          </Button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {latestReviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary text-sm">No reviews yet for this court.</p>
            </div>
          ) : (
            latestReviews.map(review => (
              <div key={review.id} className="bg-surface-variant border border-border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand/20 text-brand flex items-center justify-center font-semibold text-sm">
                      {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-primary text-sm">{review.userName || 'Unknown User'}</p>
                      <p className="text-xs text-secondary">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                <p className="text-sm text-primary">"{review.comment || 'No comment provided.'}"</p>

                {review.vendorReply ? (
                  <div className="mt-2 bg-surface p-3 rounded-lg border border-border relative group">
                    <p className="text-xs font-semibold text-brand mb-1">Your Reply</p>
                    <p className="text-sm text-secondary">{review.vendorReply}</p>
                    <button 
                      onClick={() => setSelectedReview(review)}
                      className="absolute top-2 right-2 text-secondary hover:text-brand opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Edit Reply"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-brand hover:text-brand-hover hover:bg-brand/10" onClick={() => setSelectedReview(review)}>
                      <MessageSquarePlus size={16} className="mr-2" /> Reply
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ReplyToReviewModal 
        isOpen={!!selectedReview} 
        onClose={() => setSelectedReview(null)} 
        review={selectedReview} 
      />
    </>
  )
}
