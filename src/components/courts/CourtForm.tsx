'use client'

import React, { useState } from 'react'
import { Input } from '../forms/Input'
import { Dropdown } from '../forms/Dropdown'
import { Button } from '../ui/Button'
import { SPORT_TYPE_OPTIONS } from '@/lib/mock/data/metadata'

interface CourtFormProps {
  initialData?: any
  venues: { label: string; value: string }[]
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function CourtForm({ initialData, venues, onSubmit, onCancel }: CourtFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    venueId: initialData?.venueId || (venues.length > 0 ? venues[0].value : ''),
    name: initialData?.name || '',
    sportType: initialData?.sportType || '',
    hourlyRate: initialData?.hourlyRate?.toString() || '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    isIndoor: initialData?.isIndoor !== undefined ? initialData.isIndoor : false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await onSubmit({
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate)
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4">
        <Dropdown
          label="Venue"
          required
          options={venues}
          value={formData.venueId}
          onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
          helperText="Select which venue this court belongs to."
        />
        
        <Input
          label="Court Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Futsal Court A"
        />

        <Dropdown
          label="Sport Type"
          required
          options={SPORT_TYPE_OPTIONS.map(s => ({ label: s, value: s }))}
          value={formData.sportType}
          onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
        />

        <Input
          label="Hourly Rate (PKR)"
          required
          type="number"
          min="0"
          step="100"
          value={formData.hourlyRate}
          onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
          placeholder="e.g. 2500"
        />

        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="isIndoor"
              checked={formData.isIndoor}
              onChange={(e) => setFormData({ ...formData, isIndoor: e.target.checked })}
              className="w-4 h-4 text-brand rounded border-border focus:ring-brand accent-brand"
            />
            <label htmlFor="isIndoor" className="text-body-sm text-primary">
              This is an indoor court
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-brand rounded border-border focus:ring-brand accent-brand"
            />
            <label htmlFor="isActive" className="text-body-sm text-primary">
              Court is active and available for booking
            </label>
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
          {initialData ? 'Save Changes' : 'Create Court'}
        </Button>
      </div>
    </form>
  )
}
