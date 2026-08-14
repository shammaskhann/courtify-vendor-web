'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { SlideOver } from '@/components/ui/SlideOver'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { MarketplaceBrand } from '@/types/metadata'
import { useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/hooks/useAdminMetadata'
import { useForm } from 'react-hook-form'

interface MetadataBrandsTabProps {
  brands: MarketplaceBrand[]
  isLoading: boolean
}

type FormData = {
  name: string
  logoUrl?: string
}

export function MetadataBrandsTab({ brands, isLoading }: MetadataBrandsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MarketplaceBrand | null>(null)

  const createMutation = useCreateBrand()
  const updateMutation = useUpdateBrand()
  const deleteMutation = useDeleteBrand()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const handleOpenNew = () => {
    setEditingItem(null)
    reset({ name: '', logoUrl: '' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: MarketplaceBrand) => {
    setEditingItem(item)
    reset({ name: item.name, logoUrl: item.logoUrl || '' })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
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
          <h3 className="text-h6 font-medium text-primary">Brands</h3>
          <p className="text-body-sm text-secondary">Manage brands available for marketplace items.</p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus size={16} /> Add Brand
        </Button>
      </div>

      <DataTable<MarketplaceBrand>
        data={brands}
        columns={[
          {
            header: 'Name',
            accessor: (item) => <span className="font-medium text-primary">{item.name}</span>
          },
          {
            header: 'Logo URL',
            accessor: (item) => (
              <span className="text-body-sm text-tertiary truncate max-w-[250px] block" title={item.logoUrl}>
                {item.logoUrl || '-'}
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
        emptyStateDescription="No brands found."
      />

      <SlideOver
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Brand' : 'Add New Brand'}
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
              placeholder="e.g. Nike" 
            />
            {errors.name && <span className="text-error text-caption">{errors.name.message}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-body-sm font-medium text-primary">Logo URL</label>
            <input 
              {...register('logoUrl')} 
              className="w-full h-10 px-3 rounded-md border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-brand" 
              placeholder="https://..." 
            />
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
