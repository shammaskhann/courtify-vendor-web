'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { AdminVenueCard } from '@/components/admin/AdminVenueCard'
import { Users, MapPin, Tent, ArrowRight, CheckCircle, Clock, Building2 } from 'lucide-react'
import { getAdminVenues, getPendingVenues, getPendingCourts } from '@/lib/api/adminApi'
import { getCourtDisplayName, getSportLabel } from '@/lib/venue'
import type { AdminVenue, Court } from '@/types/models'
import { ROUTES } from '@/lib/constants'

const PENDING_VENUE_PREVIEW = 6
const PENDING_COURT_PREVIEW = 6

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
          getPendingVenues(0, PENDING_VENUE_PREVIEW),
          getPendingCourts(0, PENDING_COURT_PREVIEW)
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

          setPendingVenuesList(pendingVenues?.data?.slice(0, PENDING_VENUE_PREVIEW) ?? [])
          setPendingCourtsList(pendingCourts?.data?.slice(0, PENDING_COURT_PREVIEW) ?? [])
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

      {/* Pending Venue Approvals */}
      <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-h4">Pending Venue Approvals</h2>
              <p className="text-caption text-secondary">
                {loading
                  ? 'Loading…'
                  : `${stats.pendingVenues} venue${stats.pendingVenues === 1 ? '' : 's'} awaiting review`}
              </p>
            </div>
          </div>
          <span className="badge badge-warning inline-flex items-center gap-1 text-xs">
            <Clock size={12} /> Action needed
          </span>
        </div>

        <div className="flex-1 p-4">
          {loading ? (
            <VenueCardSkeletons />
          ) : pendingVenuesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-secondary">
              <CheckCircle size={36} className="text-success" />
              <p className="text-body font-medium text-primary">All venues are reviewed</p>
              <p className="text-body-sm">Nothing is waiting on an admin decision.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pendingVenuesList.map(venue => (
                <AdminVenueCard key={venue.id} venue={venue} showActions={false} />
              ))}
            </div>
          )}
        </div>

        {pendingVenuesList.length > 0 && (
          <div className="border-t border-border p-4">
            <Button
              variant="ghost"
              className="w-full justify-center"
              onClick={() => router.push(ROUTES.ADMIN_VENUES)}
            >
              See all pending <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        )}
      </section>

      {/* Pending Court Approvals */}
      <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Tent size={18} />
            </div>
            <div>
              <h2 className="text-h4">Pending Court Approvals</h2>
              <p className="text-caption text-secondary">
                {loading
                  ? 'Loading…'
                  : `${stats.pendingCourts} court${stats.pendingCourts === 1 ? '' : 's'} awaiting review`}
              </p>
            </div>
          </div>
          <span className="badge badge-warning inline-flex items-center gap-1 text-xs">
            <Clock size={12} /> Action needed
          </span>
        </div>

        <div className="flex-1 p-4">
          {loading ? (
            <CourtRowSkeletons />
          ) : pendingCourtsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-secondary">
              <CheckCircle size={36} className="text-success" />
              <p className="text-body font-medium text-primary">All courts are reviewed</p>
              <p className="text-body-sm">Nothing is waiting on an admin decision.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {pendingCourtsList.map(court => (
                <div
                  key={court.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-all duration-base hover:border-border-strong hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand font-bold">
                    {getCourtDisplayName(court).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-body text-primary">
                      {getCourtDisplayName(court)}
                    </p>
                    <p className="truncate text-body-sm text-secondary">{getSportLabel(court)}</p>
                  </div>
                  <span className="badge badge-warning shrink-0 text-xs">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {pendingCourtsList.length > 0 && (
          <div className="border-t border-border p-4">
            <Button
              variant="ghost"
              className="w-full justify-center"
              onClick={() => router.push(ROUTES.ADMIN_COURTS)}
            >
              See all pending <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}

function VenueCardSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: PENDING_VENUE_PREVIEW }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface animate-pulse"
        >
          <div className="h-32 w-full bg-surface-variant" />
          <div className="flex flex-col gap-2.5 p-4">
            <div className="h-5 w-3/4 rounded bg-surface-variant" />
            <div className="h-4 w-full rounded bg-surface-variant" />
            <div className="h-4 w-1/2 rounded bg-surface-variant" />
          </div>
        </div>
      ))}
    </div>
  )
}

function CourtRowSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: PENDING_COURT_PREVIEW }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 animate-pulse">
          <div className="h-10 w-10 shrink-0 rounded-full bg-surface-variant" />
          <div className="flex-1">
            <div className="h-4 w-2/3 rounded bg-surface-variant" />
            <div className="mt-2 h-3 w-1/3 rounded bg-surface-variant" />
          </div>
        </div>
      ))}
    </div>
  )
}
