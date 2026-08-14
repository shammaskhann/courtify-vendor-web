import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getAdminReviews,
  getAdminReviewDetail,
  deleteAdminReview,
  ReviewFilterParams
} from '@/services/adminReviewsService'

const REVIEWS_KEY = 'adminReviews'

export const useReviews = (params: ReviewFilterParams) => {
  return useQuery({
    queryKey: [REVIEWS_KEY, params],
    queryFn: () => getAdminReviews(params),
  })
}

export const useReviewDetail = (reviewId: number | null) => {
  return useQuery({
    queryKey: [REVIEWS_KEY, reviewId],
    queryFn: () => getAdminReviewDetail(reviewId!),
    enabled: reviewId !== null,
  })
}

export const useDeleteReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: number) => deleteAdminReview(reviewId),
    onSuccess: () => {
      toast.success('Review deleted successfully')
      queryClient.invalidateQueries({ queryKey: [REVIEWS_KEY] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete review')
    }
  })
}
