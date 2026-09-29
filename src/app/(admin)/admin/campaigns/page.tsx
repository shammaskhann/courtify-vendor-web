'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type ColumnDef } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Plus, Rocket, BarChart2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCampaigns, launchCampaign } from '@/lib/api/campaignApi'
import type { Campaign } from '@/types/models'
import { CreateCampaignSlideOver } from '@/components/admin/campaigns/CreateCampaignSlideOver'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { toast } from 'react-hot-toast'

export default function CampaignsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [launchCampaignId, setLaunchCampaignId] = useState<string | number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page],
    queryFn: () => getCampaigns({ page: page - 1, size: pageSize })
  })

  const launchMutation = useMutation({
    mutationFn: launchCampaign,
    onSuccess: () => {
      toast.success('Campaign launched successfully!')
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      setLaunchCampaignId(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to launch campaign')
      setLaunchCampaignId(null)
    }
  })

  const handleLaunch = (campaign: Campaign) => {
    setLaunchCampaignId(campaign.id)
  }

  const columns: ColumnDef<Campaign>[] = [
    {
      header: 'Title',
      key: 'title',
      render: (item) => (
        <div>
          <p className="font-medium text-primary">{item.title}</p>
          <p className="text-xs text-secondary line-clamp-1">{item.messageBody}</p>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      header: 'Audience',
      key: 'targetAudience',
      render: (item) => (
        <span className="text-body-sm text-secondary">
          {item.targetAudience.replace('_', ' ')}
          {item.targetData && <span className="block text-xs opacity-70">{item.targetData}</span>}
        </span>
      )
    },
    {
      header: 'Stats',
      key: 'totalRecipients',
      render: (item) => {
        if (item.status === 'DRAFT') return <span className="text-body-sm text-tertiary">-</span>
        return (
          <div className="flex items-center gap-2 text-body-sm text-secondary">
            <BarChart2 size={16} className="text-brand" />
            <span>{item.sentCount || 0} / {item.totalRecipients || 0}</span>
          </div>
        )
      }
    },
    {
      header: 'Created',
      key: 'createdAt',
      render: (item) => (
        <span className="text-body-sm text-secondary">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex justify-end gap-2">
          {item.status === 'DRAFT' && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleLaunch(item) }}
              leftIcon={Rocket}
            >
              Launch
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Campaign Broadcasts"
          subtitle="Manage and launch marketing campaigns and system broadcasts."
        />
        <Button
          onClick={() => setIsCreateOpen(true)}
          leftIcon={Plus}
        >
          Create Draft
        </Button>
      </div>

      <DataTable
        data={(data as any)?.content || data?.data || []}
        columns={columns}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        emptyStateTitle="No campaigns found"
        emptyStateDescription="Create a new campaign to start engaging with your users."
        page={page}
        pageSize={pageSize}
        total={(data as any)?.totalElements || data?.total || 0}
        onPageChange={setPage}
      />

      <CreateCampaignSlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <ConfirmationModal
        isOpen={!!launchCampaignId}
        onClose={() => setLaunchCampaignId(null)}
        onConfirm={() => launchCampaignId && launchMutation.mutate(launchCampaignId)}
        title="Launch Campaign"
        message="Are you sure you want to launch this campaign? This will send push notifications and in-app alerts to the targeted users immediately."
        confirmLabel="Yes, Launch Now"
        cancelLabel="Cancel"
        isLoading={launchMutation.isPending}
      />
    </div>
  )
}
