'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { Users, MapPin, Tent, ArrowRight, CheckCircle, Clock, Building2 } from 'lucide-react'
import { getAdminVenues, getPendingVenues, getPendingCourts } from '@/lib/api/adminApi'
import type { AdminVenue, Court } from '@/types/models'
import { ROUTES } from '@/lib/constants'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: '—', // Endpoint failing in admin panel, placeholder
    pendingVenues: 0,
    pendingCourts: 0,
    totalVenues: 0,
  })
  const [pendingVenuesList, setPendingVenuesList] = useState<AdminVenue[]>([])
  const [pendingCourtsList, setPendingCourtsList] = useState<Court[]>([])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [allV, pendV, pendC] = await Promise.allSettled([
          getAdminVenues(0, 1),
          getPendingVenues(0, 5),
          getPendingCourts(0, 5)
        ])

        if (isMounted) {
          const allVenues = allV.status === 'fulfilled' ? allV.value : null
          const pendingVenues = pendV.status === 'fulfilled' ? pendV.value : null
          const pendingCourts = pendC.status === 'fulfilled' ? pendC.value : null

          setStats({
            totalUsers: '—',
            pendingVenues: pendingVenues?.total ?? pendingVenues?.data?.length ?? 0,
            pendingCourts: pendingCourts?.total ?? pendingCourts?.data?.length ?? 0,
            totalVenues: allVenues?.total ?? 0,
          })

          setPendingVenuesList(pendingVenues?.data?.slice(0, 4) ?? [])
          setPendingCourtsList(pendingCourts?.data?.slice(0, 4) ?? [])
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', String(err))
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Welcome back! Here's an overview of Courtify platform."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={stats.totalUsers !== '—' ? { value: 8, direction: 'up' } : undefined}
        />
        <StatCard
          label="Pending Venues"
          value={loading ? '—' : stats.pendingVenues}
          icon={MapPin}
          trend={stats.pendingVenues > 0 ? { value: stats.pendingVenues, direction: 'up' } : undefined}
        />
        <StatCard
          label="Pending Courts"
          value={loading ? '—' : stats.pendingCourts}
          icon={Tent}
          trend={stats.pendingCourts > 0 ? { value: stats.pendingCourts, direction: 'up' } : undefined}
        />
        <StatCard
          label="Total Venues"
          value={stats.totalVenues}
          icon={Building2}
          trend={stats.totalVenues > 0 ? { value: 12, direction: 'up' } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Venues Panel */}
        <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-h4">Pending Venue Approvals</h3>
          </div>
          <div className="p-4 flex-1">
            {loading ? (
              <div className="text-secondary text-sm">Loading...</div>
            ) : pendingVenuesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-secondary">
                <CheckCircle size={32} className="text-success mb-2" />
                <p>All venues are reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVenuesList.map(venue => (
                  <div key={venue.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                        {(venue.businessName || venue.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-body">{venue.businessName || venue.name}</p>
                        <p className="text-sm text-secondary">{venue.city || venue.address}</p>
                      </div>
                    </div>
                    <span className="badge badge-warning text-xs flex items-center gap-1">
                      <Clock size={12} /> Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {pendingVenuesList.length > 0 && (
            <div className="p-4 border-t border-border mt-auto">
              <Button variant="ghost" className="w-full justify-center" onClick={() => router.push(ROUTES.ADMIN_VENUES)}>
                See all pending <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Pending Courts Panel */}
        <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-h4">Pending Court Approvals</h3>
          </div>
          <div className="p-4 flex-1">
            {loading ? (
              <div className="text-secondary text-sm">Loading...</div>
            ) : pendingCourtsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-secondary">
                <CheckCircle size={32} className="text-success mb-2" />
                <p>All courts are reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCourtsList.map(court => (
                  <div key={court.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                        {(court.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-body">{court.name}</p>
                        <p className="text-sm text-secondary">{court.sportType || 'Unknown'}</p>
                      </div>
                    </div>
                    <span className="badge badge-warning text-xs flex items-center gap-1">
                      <Clock size={12} /> Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {pendingCourtsList.length > 0 && (
            <div className="p-4 border-t border-border mt-auto">
              <Button variant="ghost" className="w-full justify-center" onClick={() => router.push(ROUTES.ADMIN_COURTS)}>
                See all pending <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
