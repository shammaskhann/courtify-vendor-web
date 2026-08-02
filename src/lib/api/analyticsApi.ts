import { api } from '@/lib/api-client'
import type { AnalyticsSummary } from '@/types/models'

export async function getDashboardAnalytics(params?: { timeRange?: string }): Promise<AnalyticsSummary> {
  const query = new URLSearchParams()
  if (params?.timeRange) query.append('timeRange', params.timeRange)
  
  const res = await api.get<AnalyticsSummary>(`/dashboard/analytics?${query.toString()}`)
  if (res.error) throw new Error(res.error)
  return res.data as AnalyticsSummary
}
