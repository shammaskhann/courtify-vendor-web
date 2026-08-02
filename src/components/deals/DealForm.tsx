'use client'

import React, { useState } from 'react'
import { Input } from '../forms/Input'
import { Dropdown } from '../forms/Dropdown'
import { Button } from '../ui/Button'
import { DEAL_TYPES } from '@/types/models'
import type { Deal } from '@/types/models'
import { Calendar, Tag } from 'lucide-react'

interface DealFormProps {
  initialData?: Deal | null
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function DealForm({ initialData, onSubmit, onCancel }: DealFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    promoCode: initialData?.promoCode || '',
    dealType: initialData?.dealType || 'PERCENTAGE_OFF',
    dealValue: initialData?.dealValue?.toString() || '',
    validFrom: initialData?.validFrom ? initialData.validFrom.split('T')[0] : '',
    validTo: initialData?.validTo ? initialData.validTo.split('T')[0] : '',
    maxUses: initialData?.maxUses?.toString() || '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await onSubmit({
        ...formData,
        dealValue: parseFloat(formData.dealValue),
        maxUses: parseInt(formData.maxUses, 10),
        // Mocking some required fields for now
        applicableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
        usedCount: initialData?.usedCount || 0,
        priority: initialData?.priority || 1,
        isStackable: initialData?.isStackable || false,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = 'COURT'
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, promoCode: result }))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-5">
        <div className="space-y-4 bg-surface border border-border p-4 rounded-xl">
          <h4 className="text-body font-semibold text-primary">Deal Basics</h4>
          <Input
            label="Deal Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Summer Special 20%"
          />
          
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <label className="text-label text-primary">Promo Code <span className="text-error">*</span></label>
              <button type="button" onClick={generatePromoCode} className="text-[11px] text-brand hover:underline font-medium">
                Generate Random
              </button>
            </div>
            <div className="relative">
              <Input
                required
                value={formData.promoCode}
                onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                placeholder="e.g. SUMMER20"
                leftIcon={<Tag size={16} />}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-surface border border-border p-4 rounded-xl">
          <h4 className="text-body font-semibold text-primary">Discount Logic</h4>
          <Dropdown
            label="Deal Type"
            required
            options={DEAL_TYPES.map(t => ({ label: t.replace(/_/g, ' '), value: t }))}
            value={formData.dealType}
            onChange={(e) => setFormData({ ...formData, dealType: e.target.value as Deal['dealType'] })}
          />

          <Input
            label={formData.dealType === 'PERCENTAGE_OFF' ? 'Discount Percentage (%)' : 'Discount Amount (PKR)'}
            required
            type="number"
            min="0"
            max={formData.dealType === 'PERCENTAGE_OFF' ? "100" : undefined}
            value={formData.dealValue}
            onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
            placeholder={formData.dealType === 'PERCENTAGE_OFF' ? '20' : '500'}
          />
        </div>

        <div className="space-y-4 bg-surface border border-border p-4 rounded-xl">
          <h4 className="text-body font-semibold text-primary">Validity & Limits</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valid From"
              type="date"
              required
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              leftIcon={<Calendar size={16} />}
            />
            <Input
              label="Valid To"
              type="date"
              required
              value={formData.validTo}
              onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
              leftIcon={<Calendar size={16} />}
            />
          </div>
          
          <Input
            label="Maximum Uses"
            type="number"
            required
            min="1"
            value={formData.maxUses}
            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
            placeholder="e.g. 100"
            helperText="Total number of times this promo code can be used."
          />

          <div className="pt-2">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-brand rounded border-border focus:ring-brand accent-brand"
              />
              <label htmlFor="isActive" className="text-body-sm text-primary">
                Deal is active and can be used by customers
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 mt-auto flex justify-end gap-3 border-t border-border bg-surface">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
        >
          {initialData ? 'Save Changes' : 'Create Deal'}
        </Button>
      </div>
    </form>
  )
}
