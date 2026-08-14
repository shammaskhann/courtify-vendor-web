import { api } from '@/lib/api-client'
import {
  MarketplaceMetadataResponse,
  MarketplaceCategory,
  MarketplaceBrand,
  MarketplaceApparelSize,
  MarketplaceShoeSize,
  MarketplaceGender
} from '@/types/metadata'

// ------------------------------------------------------------------
// GLOBAL FETCH
// ------------------------------------------------------------------

export async function getMarketplaceMetadata(): Promise<MarketplaceMetadataResponse> {
  // Use any to bypass the typed response for a moment since the raw API response differs from the frontend type
  const res = await api.get<any>('/common/marketplace-metadata')
  if (res.error) throw new Error(res.error)

  const raw = res.data!

  // Transform Categories Map -> Flat Array
  const flatCategories: MarketplaceCategory[] = []
  if (raw.categories) {
    Object.entries(raw.categories).forEach(([sportType, items]: [string, any]) => {
      items.forEach((item: any) => {
        flatCategories.push({
          id: item.id,
          name: item.label,
          sportType: sportType,
          icon: item.key
        })
      })
    })
  }

  // Transform Brands Map -> Flat Array
  const flatBrands: MarketplaceBrand[] = []
  if (raw.brands) {
    Object.entries(raw.brands).forEach(([_, items]: [string, any]) => {
      items.forEach((item: any) => {
        flatBrands.push({
          id: item.id,
          name: item.label,
          logoUrl: item.key
        })
      })
    })
  }

  // Transform Apparel Sizes List -> Flat Array
  const flatApparel: MarketplaceApparelSize[] = []
  if (raw.apparelSizes) {
    raw.apparelSizes.forEach((item: any) => {
      flatApparel.push({
        id: item.id,
        size: item.label || item.value || item.size || item.key
      })
    })
  }

  // Transform Shoe Sizes Map -> Flat Array
  const flatShoes: MarketplaceShoeSize[] = []
  if (raw.shoeSizes) {
    Object.entries(raw.shoeSizes).forEach(([sizeType, items]: [string, any]) => {
      items.forEach((item: any) => {
        flatShoes.push({
          id: item.id,
          sizeType: sizeType,
          size: item.value || item.label || String(item.size || '')
        })
      })
    })
  }

  // Transform Gender List -> Flat Array
  const flatGenders: MarketplaceGender[] = []
  if (raw.gender || raw.genders) {
    const genList = raw.gender || raw.genders
    genList.forEach((item: any) => {
      flatGenders.push({
        id: item.id,
        gender: item.label || item.value || item.gender || item.key
      })
    })
  }

  return {
    categories: flatCategories,
    brands: flatBrands,
    apparelSizes: flatApparel,
    shoeSizes: flatShoes,
    genders: flatGenders
  }
}

// ------------------------------------------------------------------
// CATEGORIES
// ------------------------------------------------------------------

export async function createCategory(data: { name: string; sportType: string; icon?: string }): Promise<MarketplaceCategory> {
  const res = await api.post<MarketplaceCategory>('/v1/admin/marketplace-metadata/categories', data)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function updateCategory(id: number, data: { name: string; sportType: string; icon?: string }): Promise<MarketplaceCategory> {
  const res = await api.put<MarketplaceCategory>(`/v1/admin/marketplace-metadata/categories/${id}`, data)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await api.delete<null>(`/v1/admin/marketplace-metadata/categories/${id}`)
  if (res.error) throw new Error(res.error)
}

// ------------------------------------------------------------------
// BRANDS
// ------------------------------------------------------------------

export async function createBrand(data: { name: string; logoUrl?: string }): Promise<MarketplaceBrand> {
  const res = await api.post<MarketplaceBrand>('/v1/admin/marketplace-metadata/brands', data)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function updateBrand(id: number, data: { name: string; logoUrl?: string }): Promise<MarketplaceBrand> {
  const res = await api.put<MarketplaceBrand>(`/v1/admin/marketplace-metadata/brands/${id}`, data)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function deleteBrand(id: number): Promise<void> {
  const res = await api.delete<null>(`/v1/admin/marketplace-metadata/brands/${id}`)
  if (res.error) throw new Error(res.error)
}

// ------------------------------------------------------------------
// APPAREL SIZES
// ------------------------------------------------------------------

export async function createApparelSize(data: { size: string }): Promise<MarketplaceApparelSize> {
  const res = await api.post<MarketplaceApparelSize>('/v1/admin/marketplace-metadata/apparel-sizes', data)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function updateApparelSize(id: number, data: { size: string }): Promise<MarketplaceApparelSize> {
  const res = await api.put<MarketplaceApparelSize>(`/v1/admin/marketplace-metadata/apparel-sizes/${id}`, data)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function deleteApparelSize(id: number): Promise<void> {
  const res = await api.delete<null>(`/v1/admin/marketplace-metadata/apparel-sizes/${id}`)
  if (res.error) throw new Error(res.error)
}

// ------------------------------------------------------------------
// SHOE SIZES
// ------------------------------------------------------------------

export async function createShoeSize(data: { sizeType: string; size: string }): Promise<MarketplaceShoeSize> {
  const res = await api.post<MarketplaceShoeSize>('/v1/admin/marketplace-metadata/shoe-sizes', data)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function updateShoeSize(id: number, data: { sizeType: string; size: string }): Promise<MarketplaceShoeSize> {
  const res = await api.put<MarketplaceShoeSize>(`/v1/admin/marketplace-metadata/shoe-sizes/${id}`, data)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function deleteShoeSize(id: number): Promise<void> {
  const res = await api.delete<null>(`/v1/admin/marketplace-metadata/shoe-sizes/${id}`)
  if (res.error) throw new Error(res.error)
}

// ------------------------------------------------------------------
// GENDERS
// ------------------------------------------------------------------

export async function createGender(data: { gender: string }): Promise<MarketplaceGender> {
  const res = await api.post<MarketplaceGender>('/v1/admin/marketplace-metadata/genders', data)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function updateGender(id: number, data: { gender: string }): Promise<MarketplaceGender> {
  const res = await api.put<MarketplaceGender>(`/v1/admin/marketplace-metadata/genders/${id}`, data)
  if (res.error) throw new Error(res.error)
  return res.data!
}

export async function deleteGender(id: number): Promise<void> {
  const res = await api.delete<null>(`/v1/admin/marketplace-metadata/genders/${id}`)
  if (res.error) throw new Error(res.error)
}
