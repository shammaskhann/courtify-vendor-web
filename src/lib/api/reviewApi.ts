import { api } from '@/lib/api-client'
import type { Review, PaginatedResponse } from '@/types/models'

const BASE = '/court-owner/reviews'

export async function replyToReview(reviewId: number | string, reply: string): Promise<Review> {
  const res = await api.put<Review>(`${BASE}/${reviewId}/reply`, { reply })
  if (res.error) throw new Error(res.error)
  return res.data as Review
}

export async function getCourtReviews(
  courtId: string | number,
  params: { page?: number; size?: number; sort?: string } = {}
): Promise<PaginatedResponse<Review>> {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.append('page', params.page.toString())
  if (params.size !== undefined) query.append('size', params.size.toString())
  if (params.sort) query.append('sort', params.sort)

  const res = await api.get<PaginatedResponse<Review>>(`${BASE}/court/${courtId}?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  return res.data as PaginatedResponse<Review>
}

export async function getLatestCourtReviews(courtId: string | number): Promise<Review[]> {
  const res = await api.get<Review[]>(`${BASE}/court/${courtId}/latest`)
  if (res.error) throw new Error(res.error)
  return res.data as Review[]
}

export async function getCourtReviewStats(courtId: string | number): Promise<{ avgRating: number; reviewCount: number }> {
  const res = await api.get<{ avgRating: number; reviewCount: number }>(`${BASE}/court/${courtId}/stats`)
  if (res.error) throw new Error(res.error)
  return res.data as { avgRating: number; reviewCount: number }
}
