'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { SlideOver } from '@/components/ui/SlideOver'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { MarketplaceGender } from '@/types/metadata'
import { useCreateGender, useUpdateGender, useDeleteGender } from '@/hooks/useAdminMetadata'
import { useForm } from 'react-hook-form'

interface MetadataGendersTabProps {
  genders: MarketplaceGender[]
  isLoading: boolean
}

type FormData = {
  gender: string
}

export function MetadataGendersTab({ genders, isLoading }: MetadataGendersTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MarketplaceGender | null>(null)

  const createMutation = useCreateGender()
  const updateMutation = useUpdateGender()
  const deleteMutation = useDeleteGender()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const handleOpenNew = () => {
    setEditingItem(null)
    reset({ gender: '' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: MarketplaceGender) => {
    setEditingItem(item)
    reset({ gender: item.gender })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this gender category?')) {
      deleteMutation.mutate(id)
    }
  }

  const onSubmit = (data: FormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data }, {
        onSuccess: () => setIsModalOpen(false)
      })
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false)
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-4 pt-4">
        <div>
          <h3 className="text-h6 font-medium text-primary">Genders</h3>
          <p className="text-body-sm text-secondary">Manage gender categories for apparel and shoes.</p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus size={16} /> Add Gender
        </Button>
      </div>

      <DataTable<MarketplaceGender>
        data={genders}
        columns={[
          {
            header: 'Gender',
            accessor: (item) => <span className="font-medium text-primary">{item.gender}</span>
          },
          {
            header: 'Actions',
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleOpenEdit(item)}
                >
                  <Edit2 size={16} className="text-secondary" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-error hover:bg-error-bg hover:text-error"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )
          }
        ]}
        keyExtractor={(item) => item.id.toString()}
        isLoading={isLoading}
        emptyStateDescription="No genders found."
      />

      <SlideOver
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Gender' : 'Add New Gender'}
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit(onSubmit)} 
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="text-body-sm font-medium text-primary">Gender *</label>
            <input 
              {...register('gender', { required: 'Gender is required' })} 
              className="w-full h-10 px-3 rounded-md border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-brand" 
              placeholder="e.g. Men" 
            />
            {errors.gender && <span className="text-error text-caption">{errors.gender.message}</span>}
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
