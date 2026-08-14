'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { SlideOver } from '@/components/ui/SlideOver'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { MarketplaceCategory } from '@/types/metadata'
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useAdminMetadata'
import { useForm } from 'react-hook-form'

interface MetadataCategoriesTabProps {
  categories: MarketplaceCategory[]
  isLoading: boolean
}

type FormData = {
  name: string
  sportType: string
  icon?: string
}

export function MetadataCategoriesTab({ categories, isLoading }: MetadataCategoriesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MarketplaceCategory | null>(null)

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const handleOpenNew = () => {
    setEditingItem(null)
    reset({ name: '', sportType: '', icon: '' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: MarketplaceCategory) => {
    setEditingItem(item)
    reset({ name: item.name, sportType: item.sportType, icon: item.icon || '' })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
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
          <h3 className="text-h6 font-medium text-primary">Categories</h3>
          <p className="text-body-sm text-secondary">Manage sports categories available in the marketplace.</p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      <DataTable<MarketplaceCategory>
        data={categories}
        columns={[
          {
            header: 'Name',
            accessor: (item) => <span className="font-medium text-primary">{item.name}</span>
          },
          {
            header: 'Sport Type',
            accessor: (item) => <span className="text-body-sm">{item.sportType}</span>
          },
          {
            header: 'Icon URL',
            accessor: (item) => (
              <span className="text-body-sm text-tertiary truncate max-w-[200px] block" title={item.icon}>
                {item.icon || '-'}
              </span>
            )
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
        emptyStateDescription="No categories found."
      />

      <SlideOver
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Category' : 'Add New Category'}
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
            <label className="text-body-sm font-medium text-primary">Name *</label>
            <input 
              {...register('name', { required: 'Name is required' })} 
              className="w-full h-10 px-3 rounded-md border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-brand" 
              placeholder="e.g. Rackets" 
            />
            {errors.name && <span className="text-error text-caption">{errors.name.message}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-body-sm font-medium text-primary">Sport Type *</label>
            <input 
              {...register('sportType', { required: 'Sport Type is required' })} 
              className="w-full h-10 px-3 rounded-md border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-brand" 
              placeholder="e.g. TENNIS" 
            />
            {errors.sportType && <span className="text-error text-caption">{errors.sportType.message}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-body-sm font-medium text-primary">Icon URL</label>
            <input 
              {...register('icon')} 
              className="w-full h-10 px-3 rounded-md border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-brand" 
              placeholder="https://..." 
            />
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
