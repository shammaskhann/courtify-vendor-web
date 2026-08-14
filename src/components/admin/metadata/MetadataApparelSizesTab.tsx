'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { SlideOver } from '@/components/ui/SlideOver'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { MarketplaceApparelSize } from '@/types/metadata'
import { useCreateApparelSize, useUpdateApparelSize, useDeleteApparelSize } from '@/hooks/useAdminMetadata'
import { useForm } from 'react-hook-form'

interface MetadataApparelSizesTabProps {
  sizes: MarketplaceApparelSize[]
  isLoading: boolean
}

type FormData = {
  size: string
}

export function MetadataApparelSizesTab({ sizes, isLoading }: MetadataApparelSizesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MarketplaceApparelSize | null>(null)

  const createMutation = useCreateApparelSize()
  const updateMutation = useUpdateApparelSize()
  const deleteMutation = useDeleteApparelSize()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const handleOpenNew = () => {
    setEditingItem(null)
    reset({ size: '' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: MarketplaceApparelSize) => {
    setEditingItem(item)
    reset({ size: item.size })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this size?')) {
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
          <h3 className="text-h6 font-medium text-primary">Apparel Sizes</h3>
          <p className="text-body-sm text-secondary">Manage standard apparel sizes (e.g., S, M, L, XL).</p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus size={16} /> Add Size
        </Button>
      </div>

      <DataTable<MarketplaceApparelSize>
        data={sizes}
        columns={[
          {
            header: 'Size',
            accessor: (item) => <span className="font-medium text-primary">{item.size}</span>
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
        emptyStateDescription="No apparel sizes found."
      />

      <SlideOver
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Apparel Size' : 'Add New Apparel Size'}
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
            <label className="text-body-sm font-medium text-primary">Size *</label>
            <input 
              {...register('size', { required: 'Size is required' })} 
              className="w-full h-10 px-3 rounded-md border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-brand" 
              placeholder="e.g. XL" 
            />
            {errors.size && <span className="text-error text-caption">{errors.size.message}</span>}
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
