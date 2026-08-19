'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { getPendingTeammatePosts, updateTeammatePostStatus } from '@/lib/api/adminApi'
import { CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminTeammatePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState<{ open: boolean; post?: any; action?: 'APPROVE' | 'DELETE' }>({ open: false })

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const data = await getPendingTeammatePosts()
      setPosts(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to load teammate posts')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleAction = async () => {
    if (!confirm.post || !confirm.action) return
    try {
      const status = confirm.action === 'APPROVE' ? 'OPEN' : 'DELETED'
      const reason = confirm.action === 'DELETE' ? 'Moderated by Admin' : undefined
      await updateTeammatePostStatus(confirm.post.id, status, reason)
      
      toast.success(`Post successfully ${confirm.action === 'APPROVE' ? 'approved' : 'deleted'}!`)
      setConfirm({ open: false })
      fetchPosts()
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    }
  }

  const columns = [
    {
      header: 'Player',
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{row.userName || 'Unknown'}</span>
          <span className="text-xs text-secondary">{row.userEmail || 'No email'}</span>
        </div>
      )
    },
    {
      header: 'Post Content',
      accessor: (row: any) => (
        <div className="flex flex-col gap-1 max-w-sm">
          <span className="text-sm font-medium text-primary">Sport: {row.sportType || 'Any'} | Level: {row.skillLevel || 'Any'}</span>
          <span className="text-sm text-secondary truncate" title={row.description}>"{row.description || 'No description'}"</span>
        </div>
      )
    },
    {
      header: 'Location & Time',
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="text-sm text-primary">{row.city || row.location || 'Any location'}</span>
          <span className="text-xs text-secondary">{row.preferredTime || 'Any time'}</span>
        </div>
      )
    },
    {
      header: 'Posted Date',
      accessor: (row: any) => (
        <span className="text-sm text-secondary">
          {row.createdAt ? format(new Date(row.createdAt), 'PP') : 'N/A'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="primary" onClick={() => setConfirm({ open: true, post: row, action: 'APPROVE' })}>
            <CheckCircle size={14} className="mr-1" /> Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setConfirm({ open: true, post: row, action: 'DELETE' })}>
            <Trash2 size={14} className="mr-1" /> Delete
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Teammate Moderation"
        subtitle="Review pending social board posts."
        actions={
          <Button variant="secondary" size="icon" onClick={fetchPosts} title="Refresh">
            <RefreshCw size={16} />
          </Button>
        }
      />

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable
          columns={columns as any}
          data={posts}
          isLoading={loading}
          keyExtractor={(row) => row.id.toString()}
          emptyStateTitle="No pending teammate posts."
          emptyStateDescription="All caught up! There are no posts awaiting moderation right now."
        />
      </div>

      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false })}
        onConfirm={handleAction}
        title={confirm.action === 'APPROVE' ? 'Approve Post' : 'Delete Post'}
        message={confirm.action === 'APPROVE' ? 'Approve this post and make it visible on the social board?' : 'Delete this post due to inappropriate content?'}
        confirmVariant={confirm.action === 'DELETE' ? 'danger' : 'primary'}
        confirmLabel={confirm.action === 'APPROVE' ? 'Approve' : 'Delete'}
      />
    </div>
  )
}
