import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { replyToReview } from '@/lib/api/reviewApi'
import type { Review } from '@/types/models'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

interface ReplyToReviewModalProps {
  isOpen: boolean
  onClose: () => void
  review: Review | null
  onSuccess?: () => void
}

const replySchema = z.object({
  replyText: z.string().trim().min(1, 'Reply cannot be blank.').max(1000, 'Reply exceeds maximum length.')
})

type ReplyFormValues = z.infer<typeof replySchema>

export function ReplyToReviewModal({ isOpen, onClose, review, onSuccess }: ReplyToReviewModalProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors }
  } = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { replyText: '' }
  })

  useEffect(() => {
    if (isOpen && review) {
      reset({ replyText: review.vendorReply || '' })
    }
  }, [isOpen, review, reset])

  const replyMutation = useMutation({
    mutationFn: (text: string) => replyToReview(review!.id, text),
    onSuccess: () => {
      // Invalidate both the full list and the court detail
      queryClient.invalidateQueries({ queryKey: ['court-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['court', String(review!.courtId)] })
      onSuccess?.()
      onClose()
    },
    onError: (err: Error) => {
      setError('replyText', { type: 'server', message: err.message || 'Failed to submit reply' })
    }
  })

  if (!isOpen || !review) return null

  const isEditing = !!review.vendorReply
  const currentText = watch('replyText') || ''
  const charsRemaining = 1000 - currentText.length

  const onSubmit = (data: ReplyFormValues) => {
    replyMutation.mutate(data.replyText)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-h4 font-semibold text-primary">
              {isEditing ? 'Edit Reply' : 'Reply to Review'}
            </h3>
            <p className="text-sm text-secondary">Replying to {review.userName}'s review</p>
          </div>
          <button 
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors p-2 -mr-2 rounded-full hover:bg-surface-variant"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-6">
          <div className="bg-surface-variant rounded-lg p-4 border border-border">
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-sm ${i < review.rating ? 'text-brand' : 'text-border'}`}>★</span>
              ))}
            </div>
            <p className="text-primary italic text-sm">"{review.comment || 'No comment provided'}"</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-primary">Your Reply</label>
            <textarea
              {...register('replyText')}
              className={`w-full bg-surface border ${errors.replyText ? 'border-error' : 'border-border'} rounded-lg p-3 text-primary text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand min-h-[120px] resize-y`}
              placeholder="Thank you for your feedback..."
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              {errors.replyText ? (
                <span className="text-xs text-error">{errors.replyText.message}</span>
              ) : (
                <span className="text-xs text-secondary opacity-0">-</span>
              )}
              <span className={`text-xs ${charsRemaining < 50 ? 'text-warning' : 'text-secondary'}`}>
                {charsRemaining} characters remaining
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={replyMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={replyMutation.isPending}>
              {isEditing ? 'Save Changes' : 'Submit Reply'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
