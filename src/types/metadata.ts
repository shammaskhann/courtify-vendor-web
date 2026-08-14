export interface MarketplaceCategory {
  id: number
  name: string
  sportType: string
  icon?: string
}

export interface MarketplaceBrand {
  id: number
  name: string
  logoUrl?: string
}

export interface MarketplaceApparelSize {
  id: number
  size: string
}

export interface MarketplaceShoeSize {
  id: number
  sizeType: string
  size: string
}

export interface MarketplaceGender {
  id: number
  gender: string
}

export interface MarketplaceMetadataResponse {
  categories: MarketplaceCategory[]
  brands: MarketplaceBrand[]
  apparelSizes: MarketplaceApparelSize[]
  shoeSizes: MarketplaceShoeSize[]
  genders: MarketplaceGender[]
}
