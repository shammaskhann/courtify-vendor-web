import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getMarketplaceMetadata,
  createCategory, updateCategory, deleteCategory,
  createBrand, updateBrand, deleteBrand,
  createApparelSize, updateApparelSize, deleteApparelSize,
  createShoeSize, updateShoeSize, deleteShoeSize,
  createGender, updateGender, deleteGender
} from '@/services/adminMetadataService'
import {
  MarketplaceCategory,
  MarketplaceBrand,
  MarketplaceApparelSize,
  MarketplaceShoeSize,
  MarketplaceGender
} from '@/types/metadata'

const METADATA_KEY = ['adminMarketplaceMetadata']

export const useMarketplaceMetadata = () => {
  return useQuery({
    queryKey: METADATA_KEY,
    queryFn: getMarketplaceMetadata,
  })
}

// ------------------------------------------------------------------
// CATEGORIES
// ------------------------------------------------------------------

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<MarketplaceCategory, 'id'>) => createCategory(data),
    onSuccess: () => {
      toast.success('Category created successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create category')
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<MarketplaceCategory, 'id'> }) => updateCategory(id, data),
    onSuccess: () => {
      toast.success('Category updated successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update category')
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete category')
  })
}

// ------------------------------------------------------------------
// BRANDS
// ------------------------------------------------------------------

export const useCreateBrand = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<MarketplaceBrand, 'id'>) => createBrand(data),
    onSuccess: () => {
      toast.success('Brand created successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create brand')
  })
}

export const useUpdateBrand = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<MarketplaceBrand, 'id'> }) => updateBrand(id, data),
    onSuccess: () => {
      toast.success('Brand updated successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update brand')
  })
}

export const useDeleteBrand = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteBrand(id),
    onSuccess: () => {
      toast.success('Brand deleted successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete brand')
  })
}

// ------------------------------------------------------------------
// APPAREL SIZES
// ------------------------------------------------------------------

export const useCreateApparelSize = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<MarketplaceApparelSize, 'id'>) => createApparelSize(data),
    onSuccess: () => {
      toast.success('Apparel size created successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create apparel size')
  })
}

export const useUpdateApparelSize = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<MarketplaceApparelSize, 'id'> }) => updateApparelSize(id, data),
    onSuccess: () => {
      toast.success('Apparel size updated successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update apparel size')
  })
}

export const useDeleteApparelSize = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteApparelSize(id),
    onSuccess: () => {
      toast.success('Apparel size deleted successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete apparel size')
  })
}

// ------------------------------------------------------------------
// SHOE SIZES
// ------------------------------------------------------------------

export const useCreateShoeSize = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<MarketplaceShoeSize, 'id'>) => createShoeSize(data),
    onSuccess: () => {
      toast.success('Shoe size created successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create shoe size')
  })
}

export const useUpdateShoeSize = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<MarketplaceShoeSize, 'id'> }) => updateShoeSize(id, data),
    onSuccess: () => {
      toast.success('Shoe size updated successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update shoe size')
  })
}

export const useDeleteShoeSize = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteShoeSize(id),
    onSuccess: () => {
      toast.success('Shoe size deleted successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete shoe size')
  })
}

// ------------------------------------------------------------------
// GENDERS
// ------------------------------------------------------------------

export const useCreateGender = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<MarketplaceGender, 'id'>) => createGender(data),
    onSuccess: () => {
      toast.success('Gender created successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create gender')
  })
}

export const useUpdateGender = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<MarketplaceGender, 'id'> }) => updateGender(id, data),
    onSuccess: () => {
      toast.success('Gender updated successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update gender')
  })
}

export const useDeleteGender = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteGender(id),
    onSuccess: () => {
      toast.success('Gender deleted successfully')
      queryClient.invalidateQueries({ queryKey: METADATA_KEY })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete gender')
  })
}
