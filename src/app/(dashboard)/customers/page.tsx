'use client'

import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type ColumnDef } from '@/components/ui/DataTable'
import { StatCard } from '@/components/ui/StatCard'
import { Input } from '@/components/forms/Input'
import { getBookings } from '@/lib/api/bookingApi'
import { deriveCustomers, toWhatsAppLink, LAPSED_AFTER_DAYS, type CustomerSummary } from '@/lib/customers'
import type { Booking } from '@/types/models'
import { Users, Repeat, UserMinus, Banknote, MessageCircle, Phone, Search } from 'lucide-react'

type Segment = 'ALL' | 'REPEAT' | 'LAPSED' | 'NEW'

const SEGMENTS: { label: string; value: Segment }[] = [
  { label: 'All Customers', value: 'ALL' },
  { label: 'Repeat', value: 'REPEAT' },
  { label: 'Lapsed', value: 'LAPSED' },
  { label: 'New', value: 'NEW' },
]

const PAGE_SIZE = 15

function formatLastSeen(days: number): string {
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 60) return 'Last month'
  return `${Math.floor(days / 30)} months ago`
}

export default function CustomersPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [segment, setSegment] = useState<Segment>('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await getBookings({ pageSize: 1000 })
        if (isMounted) setBookings(res.data)
      } catch (err) {
        if (isMounted) setError((err as Error).message || 'Failed to load customers')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [])

  const customers = useMemo(() => deriveCustomers(bookings), [bookings])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return customers.filter((customer) => {
      if (segment === 'REPEAT' && customer.totalBookings < 2) return false
      if (segment === 'LAPSED' && !customer.isLapsed) return false
      if (segment === 'NEW' && customer.totalBookings !== 1) return false

      if (!term) return true
      return (
        customer.name.toLowerCase().includes(term) ||
        customer.contact?.toLowerCase().includes(term) ||
        customer.email?.toLowerCase().includes(term)
      )
    })
  }, [customers, segment, search])

  // Derived data is paginated locally — there is no server-side customer endpoint.
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  )

  const stats = useMemo(() => {
    const repeat = customers.filter((c) => c.totalBookings >= 2).length
    const lapsed = customers.filter((c) => c.isLapsed).length
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0)

    return {
      total: customers.length,
      repeat,
      lapsed,
      averageSpend: customers.length > 0 ? Math.round(totalSpent / customers.length) : 0,
    }
  }, [customers])

  const columns: ColumnDef<CustomerSummary>[] = [
    {
      header: 'Customer',
      render: (customer) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{customer.name}</span>
          <span className="text-caption text-secondary">
            {customer.contact || customer.email || 'No contact on file'}
          </span>
        </div>
      ),
    },
    {
      header: 'Bookings',
      render: (customer) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{customer.totalBookings}</span>
          <span className="text-caption text-secondary">
            {customer.completedBookings} completed
            {customer.cancelledBookings > 0 && ` · ${customer.cancelledBookings} cancelled`}
          </span>
        </div>
      ),
    },
    {
      header: 'Usual Venue',
      render: (customer) => (
        <span className="text-body-sm text-secondary">{customer.topVenueName || '—'}</span>
      ),
    },
    {
      header: 'Total Spent',
      align: 'right',
      render: (customer) => (
        <span className="font-medium text-primary">PKR {customer.totalSpent.toLocaleString()}</span>
      ),
    },
    {
      header: 'Last Booking',
      align: 'right',
      render: (customer) => (
        <div className="flex flex-col items-end">
          <span className="text-body-sm font-medium text-primary">
            {formatLastSeen(customer.daysSinceLastBooking)}
          </span>
          {customer.isLapsed && (
            <span className="mt-1 px-2 py-0.5 rounded-pill text-[11px] font-medium bg-warning-bg text-warning-text border border-warning/20">
              Lapsed
            </span>
          )}
        </div>
      ),
    },
    {
      header: '',
      align: 'right',
      render: (customer) => {
        const whatsapp = toWhatsAppLink(customer.contact)
        return (
          <div className="flex items-center justify-end gap-1">
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                title={`Message ${customer.name} on WhatsApp`}
                className="p-2 rounded-lg text-secondary hover:text-success-text hover:bg-success-bg transition-colors"
              >
                <MessageCircle size={16} />
              </a>
            )}
            {customer.contact && (
              <a
                href={`tel:${customer.contact}`}
                title={`Call ${customer.name}`}
                className="p-2 rounded-lg text-secondary hover:text-brand hover:bg-brand/10 transition-colors"
              >
                <Phone size={16} />
              </a>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <PageHeader
        title="Customers"
        subtitle="Who books with you, how often, and who has stopped coming back."
      />

      {error && (
        <div className="bg-error-bg text-error-text p-4 rounded-lg border border-error/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Customers"
          value={isLoading ? '-' : stats.total.toLocaleString()}
          icon={Users}
          variant="primary"
          isLoading={isLoading}
        />
        <StatCard
          label="Repeat Customers"
          value={isLoading ? '-' : stats.repeat.toLocaleString()}
          icon={Repeat}
          variant="success"
          isLoading={isLoading}
        />
        <StatCard
          label={`Lapsed (${LAPSED_AFTER_DAYS}+ days)`}
          value={isLoading ? '-' : stats.lapsed.toLocaleString()}
          icon={UserMinus}
          variant="warning"
          isLoading={isLoading}
        />
        <StatCard
          label="Average Spend"
          value={isLoading ? '-' : `PKR ${stats.averageSpend.toLocaleString()}`}
          icon={Banknote}
          isLoading={isLoading}
        />
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col h-full">
        <div className="flex items-center shrink-0 overflow-x-auto border-b border-border hide-scrollbar">
          {SEGMENTS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setSegment(tab.value); setPage(1) }}
              className={`px-6 py-4 text-body-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                segment === tab.value
                  ? 'border-brand text-primary'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-border bg-surface-variant/30">
          <div className="max-w-sm">
            <Input
              placeholder="Search by name, phone or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              leftIcon={<Search size={16} />}
            />
          </div>
        </div>

        <div className="flex-1">
          <DataTable
            data={paginated}
            columns={columns}
            isLoading={isLoading}
            keyExtractor={(customer) => customer.key}
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
            emptyStateTitle="No customers yet"
            emptyStateDescription="Customers appear here once bookings come in. Repeat and lapsed segments help you win them back."
            className="border-0 shadow-none rounded-none"
          />
        </div>
      </div>
    </div>
  )
}
