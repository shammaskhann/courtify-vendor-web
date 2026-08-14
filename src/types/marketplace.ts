export type MarketListingCondition = 'NEW' | 'USED'
export type MarketListingStatus = 'ACTIVE' | 'SOLD' | 'SUSPENDED' | 'BANNED' | 'PENDING'

export interface MarketListing {
  id: string | number
  title: string
  description: string
  price: number
  condition: MarketListingCondition
  sportType: string
  images: string[]
  city: string
  area?: string
  status: MarketListingStatus
  sellerId: string | number
  sellerName: string
  sellerPhone: string
  createdAt: string
}

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED'

export interface MarketReport {
  id: string | number
  reason: string
  reporterId: string | number
  reporterName?: string
  listingId: string | number
  listingTitle?: string
  status: ReportStatus
  createdAt: string
}
