'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { RefreshCw, UserPlus, CheckCircle, XCircle, ShieldCheck } from 'lucide-react'
import { getUsersByRole, enableUser, disableUser, approveUser, unapproveUser, markUserAsVerified } from '@/lib/api/adminApi'
import type { AdminUser } from '@/types/models'

type UserRoleFilter = 'all' | 'admin' | 'user' | 'courtowner' | 'courtmanager'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<UserRoleFilter>('all')
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState<{ open: boolean; user?: AdminUser; action?: 'APPROVE' | 'UNAPPROVE' | 'ENABLE' | 'DISABLE' | 'VERIFY' }>({ open: false })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const resp = await getUsersByRole(filter === 'all' ? '' : filter)
      // The API returns either PaginatedResponse or an array directly
      const data = Array.isArray(resp) ? resp : (resp as any).content || (resp as any).data || []
      setUsers(data)
    } catch (err) {
      console.error(String(err))
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const handleAction = async () => {
    if (!confirm.user || !confirm.action) return
    try {
      if (confirm.action === 'APPROVE') await approveUser(confirm.user.id)
      else if (confirm.action === 'UNAPPROVE') await unapproveUser(confirm.user.id)
      else if (confirm.action === 'ENABLE') await enableUser(confirm.user.id)
      else if (confirm.action === 'DISABLE') await disableUser(confirm.user.id)
      else if (confirm.action === 'VERIFY') await markUserAsVerified(confirm.user.id)
      
      setConfirm({ open: false })
      fetchUsers()
    } catch (err) {
      console.error(String(err))
    }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
  })

  const getConfirmProps = () => {
    if (!confirm.action || !confirm.user) return { title: '', message: '', type: 'danger' as const }
    const name = confirm.user.name || confirm.user.email
    switch (confirm.action) {
      case 'APPROVE': return { title: 'Approve User', message: `Approve "${name}"?`, type: 'info' as const }
      case 'UNAPPROVE': return { title: 'Unapprove User', message: `Unapprove "${name}"?`, type: 'warning' as const }
      case 'ENABLE': return { title: 'Enable User', message: `Enable "${name}"?`, type: 'info' as const }
      case 'DISABLE': return { title: 'Disable User', message: `Disable "${name}"?`, type: 'danger' as const }
      case 'VERIFY': return { title: 'Verify User', message: `Mark "${name}" as verified?`, type: 'info' as const }
    }
  }

  const confirmProps = getConfirmProps()

  const columns = [
    { header: '#', accessor: (_: AdminUser, i: number) => i + 1 },
    {
      header: 'User',
      accessor: (row: AdminUser) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-bold text-primary">
            {(row.name || row.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-body">{row.name || 'Unnamed'}</p>
            <span className="text-sm text-secondary">{row.email}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Role', 
      accessor: (row: AdminUser) => (
        <span className="badge badge-brand text-xs px-2 py-0.5">{row.role}</span>
      )
    },
    {
      header: 'Status',
      accessor: (row: AdminUser) => {
        if (row.isDisabled) return <StatusBadge status="DISABLED" />
        if (!row.isVerified) return <StatusBadge status="PENDING" />
        if (!row.isApproved && row.role === 'COURTOWNER') return <StatusBadge status="PENDING" />
        return <StatusBadge status="ACTIVE" />
      }
    },
    {
      header: 'Actions',
      accessor: (row: AdminUser) => (
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {!row.isVerified && (
            <Button size="sm" variant="secondary" onClick={() => setConfirm({ open: true, user: row, action: 'VERIFY' })}>
              <ShieldCheck size={14} className="mr-1" /> Verify
            </Button>
          )}
          {row.role === 'COURTOWNER' && !row.isApproved && (
            <Button size="sm" variant="primary" onClick={() => setConfirm({ open: true, user: row, action: 'APPROVE' })}>
              <CheckCircle size={14} className="mr-1" /> Approve
            </Button>
          )}
          {row.role === 'COURTOWNER' && row.isApproved && (
            <Button size="sm" variant="secondary" onClick={() => setConfirm({ open: true, user: row, action: 'UNAPPROVE' })}>
              <XCircle size={14} className="mr-1" /> Unapprove
            </Button>
          )}
          {row.isDisabled ? (
            <Button size="sm" variant="secondary" onClick={() => setConfirm({ open: true, user: row, action: 'ENABLE' })}>
              Enable
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => setConfirm({ open: true, user: row, action: 'DISABLE' })}>
              Disable
            </Button>
          )}
        </div>
      )
    }
  ]

  const roles: { label: string, value: UserRoleFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Admins', value: 'admin' },
    { label: 'Court Owners', value: 'courtowner' },
    { label: 'Court Managers', value: 'courtmanager' },
    { label: 'Users', value: 'user' },
  ]

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Users Management"
        subtitle={`Managing ${users.length} users`}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="primary">
              <UserPlus size={16} className="mr-2" /> Add Admin
            </Button>
            <Button variant="secondary" size="icon" onClick={fetchUsers} title="Refresh">
              <RefreshCw size={16} />
            </Button>
          </div>
        }
      />

      <div className="flex bg-surface-variant p-1 rounded-lg w-max">
        {roles.map(r => (
          <button
            key={r.value}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === r.value ? 'bg-surface shadow-sm text-primary' : 'text-secondary hover:text-primary'}`}
            onClick={() => setFilter(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <FilterBar
        configs={[{ key: 'search', label: 'Search', type: 'search', placeholder: 'Search by name or email...' }]}
        onFilterChange={(f) => setSearch(f.search || '')}
      />

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={loading}
          keyExtractor={(row) => row.id.toString()}
          emptyStateTitle={search ? 'No users match your search.' : 'No users found.'}
          emptyStateDescription=""
        />
      </div>

      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false })}
        onConfirm={handleAction}
        title={confirmProps.title}
        message={confirmProps.message}
        confirmVariant={confirmProps.type === 'danger' ? 'danger' : 'primary'}
        confirmLabel={confirm.action === 'APPROVE' || confirm.action === 'VERIFY' || confirm.action === 'ENABLE' ? 'Confirm' : confirm.action === 'DISABLE' ? 'Disable' : 'Unapprove'}
      />
    </div>
  )
}
