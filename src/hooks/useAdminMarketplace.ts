import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getAdminListings,
  getAdminListingById,
  updateAdminListingStatus,
  deleteAdminListing,
  getAdminReports,
  resolveAdminReport,
  GetAdminListingsParams,
  GetAdminReportsParams,
} from '@/services/adminMarketplaceService'
import { MarketListingStatus, ReportStatus } from '@/types/marketplace'

// ------------------------------------------------------------------
// LISTINGS
// ------------------------------------------------------------------

export const useAdminListings = (params: GetAdminListingsParams = { status: 'ALL' }) => {
  return useQuery({
    queryKey: ['adminMarketplaceListings', params],
    queryFn: () => getAdminListings(params),
  })
}

export const useAdminListing = (id: string | number) => {
  return useQuery({
    queryKey: ['adminMarketplaceListing', id],
    queryFn: () => getAdminListingById(id),
    enabled: !!id,
  })
}

export const useUpdateListingStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: MarketListingStatus }) =>
      updateAdminListingStatus(id, status),
    onSuccess: (_, { status }) => {
      toast.success(`Listing status updated to ${status}`)
      queryClient.invalidateQueries({ queryKey: ['adminMarketplaceListings'] })
      queryClient.invalidateQueries({ queryKey: ['adminMarketplaceListing'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update listing status')
    },
  })
}

export const useDeleteListing = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => deleteAdminListing(id),
    onSuccess: () => {
      toast.success('Listing permanently deleted')
      queryClient.invalidateQueries({ queryKey: ['adminMarketplaceListings'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete listing')
    },
  })
}

// ------------------------------------------------------------------
// REPORTS
// ------------------------------------------------------------------

export const useAdminReports = (params: GetAdminReportsParams = { status: 'ALL' }) => {
  return useQuery({
    queryKey: ['adminMarketplaceReports', params],
    queryFn: () => getAdminReports(params),
  })
}

export const useResolveReport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: ReportStatus }) =>
      resolveAdminReport(id, status),
    onSuccess: (_, { status }) => {
      toast.success(`Report marked as ${status.toLowerCase()}`)
      queryClient.invalidateQueries({ queryKey: ['adminMarketplaceReports'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update report status')
    },
  })
}
