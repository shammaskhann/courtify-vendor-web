'use client'

import React, { useState } from 'react'
import { Input } from '../forms/Input'
import { Dropdown } from '../forms/Dropdown'
import { Button } from '../ui/Button'
import { CITY_OPTIONS, AMENITY_OPTIONS } from '@/lib/mock/data/metadata'
import { Check, MapPin } from 'lucide-react'

// Simple mock for a multi-step venue form
// In a real app this would use react-hook-form + zod, as done in RegistrationFlow

interface VenueFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function VenueForm({ initialData, onSubmit, onCancel }: VenueFormProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    openingTime: initialData?.openingTime || '06:00 AM',
    closingTime: initialData?.closingTime || '11:00 PM',
    amenities: initialData?.amenities || ([] as string[]),
    image: initialData?.image || 'https://picsum.photos/seed/newvenue/800/450',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  })

  const handleNext = () => setStep(step + 1)
  const handlePrev = () => setStep(step - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      handleNext()
      return
    }
    try {
      setIsSubmitting(true)
      await onSubmit({ ...formData, latitude: 24.8607, longitude: 67.0011 }) // Mock coords
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const current = prev.amenities
      return {
        ...prev,
        amenities: current.includes(amenity)
          ? current.filter((a: string) => a !== amenity)
          : [...current, amenity],
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-pill ${
                s <= step ? 'bg-brand' : 'bg-surface-variant'
              } transition-colors duration-base`}
            />
          ))}
        </div>
        <span className="text-caption text-secondary">Step {step} of 3</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-h4 font-semibold text-primary mb-4">Basic Details</h3>
            <Input
              label="Venue Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alpha Sports Club"
            />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-label text-primary">Description</label>
              <textarea
                className="w-full p-3 rounded-md bg-surface border border-border text-body text-primary placeholder:text-tertiary transition-all focus:border-brand focus:ring-2 focus:ring-brand outline-none min-h-[100px] resize-none"
                placeholder="Tell customers about your facility..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div className="flex items-center gap-3 mt-4">
              <input 
                type="checkbox" 
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-brand rounded border-border focus:ring-brand accent-brand"
              />
              <label htmlFor="isActive" className="text-body-sm text-primary">
                Venue is active and visible to customers
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-h4 font-semibold text-primary mb-4">Location & Hours</h3>
            <Dropdown
              label="City"
              required
              options={CITY_OPTIONS.map(c => ({ label: c, value: c }))}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Street Address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Plot 123, 26th Street"
              leftIcon={<MapPin size={16} />}
            />
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Input
                label="Opening Time"
                type="time"
                required
                value={formData.openingTime}
                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
              />
              <Input
                label="Closing Time"
                type="time"
                required
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-h4 font-semibold text-primary mb-2">Amenities</h3>
            <p className="text-body-sm text-secondary mb-4">Select all facilities available at this venue.</p>
            
            <div className="grid grid-cols-2 gap-3">
              {AMENITY_OPTIONS.map((amenity) => {
                const isSelected = formData.amenities.includes(amenity)
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      isSelected 
                        ? 'border-brand bg-brand/5 text-primary' 
                        : 'border-border bg-surface text-secondary hover:border-border-strong'
                    }`}
                  >
                    <span className="text-body-sm font-medium">{amenity}</span>
                    {isSelected && <Check size={16} className="text-brand" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 mt-auto flex justify-between border-t border-border bg-surface">
        <Button
          type="button"
          variant="secondary"
          onClick={step === 1 ? onCancel : handlePrev}
          disabled={isSubmitting}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
        >
          {step === 3 ? (initialData ? 'Save Changes' : 'Create Venue') : 'Continue'}
        </Button>
      </div>
    </form>
  )
}
