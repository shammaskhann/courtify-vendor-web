import { api } from '@/lib/api-client'
import { MarketListing, MarketListingStatus, MarketReport, ReportStatus } from '@/types/marketplace'

// Paginated response type for lists
export interface PaginatedResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

// ------------------------------------------------------------------
// LISTINGS
// ------------------------------------------------------------------

export interface GetAdminListingsParams {
  page?: number
  size?: number
  q?: string
  status?: MarketListingStatus | 'ALL'
  sportType?: string
  city?: string
  condition?: string
}

export async function getAdminListings(params?: GetAdminListingsParams): Promise<PaginatedResponse<MarketListing>> {
  const query = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        query.append(key, String(val))
      }
    })
  }

  // Uses the admin prefixed route as per our plan.
  const res = await api.get<PaginatedResponse<MarketListing>>(`/v1/admin/marketplace/listings?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function getAdminListingById(id: string | number): Promise<MarketListing> {
  const res = await api.get<MarketListing>(`/v1/admin/marketplace/listings/${id}`)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function updateAdminListingStatus(id: string | number, status: MarketListingStatus): Promise<void> {
  const res = await api.patch<null>(`/v1/admin/marketplace/listings/${id}/status`, { status })
  if (res.error) throw new Error(res.error)
}

export async function deleteAdminListing(id: string | number): Promise<void> {
  const res = await api.delete<null>(`/v1/admin/marketplace/listings/${id}`)
  if (res.error) throw new Error(res.error)
}

// ------------------------------------------------------------------
// REPORTS
// ------------------------------------------------------------------

export interface GetAdminReportsParams {
  page?: number
  size?: number
  status?: ReportStatus | 'ALL'
}

export async function getAdminReports(params?: GetAdminReportsParams): Promise<PaginatedResponse<MarketReport>> {
  const query = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        query.append(key, String(val))
      }
    })
  }

  const res = await api.get<PaginatedResponse<MarketReport>>(`/v1/admin/marketplace/reports?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function resolveAdminReport(id: string | number, status: ReportStatus): Promise<void> {
  const res = await api.patch<null>(`/v1/admin/marketplace/reports/${id}/status`, { status })
  if (res.error) throw new Error(res.error)
}
