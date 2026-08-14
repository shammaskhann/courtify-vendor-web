import { api } from '@/lib/api-client'
import { PageResponse, ReviewResponse } from '@/types/models'

export interface ReviewFilterParams {
  keyword?: string
  courtId?: number
  userId?: number
  minRating?: number
  maxRating?: number
  page?: number
  size?: number
  sort?: string
}

export async function getAdminReviews(params: ReviewFilterParams): Promise<PageResponse<ReviewResponse>> {
  // Convert params to URL query string
  const urlParams = new URLSearchParams()
  if (params.keyword) urlParams.append('keyword', params.keyword)
  if (params.courtId !== undefined) urlParams.append('courtId', params.courtId.toString())
  if (params.userId !== undefined) urlParams.append('userId', params.userId.toString())
  if (params.minRating !== undefined) urlParams.append('minRating', params.minRating.toString())
  if (params.maxRating !== undefined) urlParams.append('maxRating', params.maxRating.toString())
  urlParams.append('page', (params.page || 0).toString())
  urlParams.append('size', (params.size || 10).toString())
  if (params.sort) urlParams.append('sort', params.sort)

  const res = await api.get<PageResponse<ReviewResponse>>(`/admin/reviews/?${urlParams.toString()}`)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function getAdminReviewDetail(reviewId: number): Promise<ReviewResponse> {
  const res = await api.get<ReviewResponse>(`/admin/reviews/${reviewId}`)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function deleteAdminReview(reviewId: number): Promise<void> {
  const res = await api.delete<null>(`/admin/reviews/${reviewId}`)
  if (res.error) throw new Error(res.error)
}
