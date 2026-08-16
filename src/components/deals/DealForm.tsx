'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '../forms/Input'
import { Dropdown } from '../forms/Dropdown'
import { Button } from '../ui/Button'
import { DEAL_TYPES } from '@/types/models'
import type { Deal, Venue, Court } from '@/types/models'
import { Calendar, Tag } from 'lucide-react'
import { getVenues } from '@/lib/api/venueApi'
import { getCourtsByVenue } from '@/lib/api/courtApi'

interface DealFormProps {
  initialData?: Deal | null
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function DealForm({ initialData, onSubmit, onCancel }: DealFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [venues, setVenues] = useState<Venue[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [loadingVenues, setLoadingVenues] = useState(true)
  const [loadingCourts, setLoadingCourts] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    promoCode: initialData?.promoCode || '',
    dealType: initialData?.dealType || 'PERCENTAGE_OFF',
    dealValue: initialData?.dealValue?.toString() || '',
    validFrom: initialData?.validFrom ? initialData.validFrom.split('T')[0] : '',
    validTo: initialData?.validTo ? initialData.validTo.split('T')[0] : '',
    maxUses: initialData?.maxUses?.toString() || '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    venueId: initialData?.venueId?.toString() || '',
    applyOnAllCourts: initialData?.applyOnAllCourts ?? true,
    courtIds: initialData?.courtIds?.map(String) || [],
  })

  useEffect(() => {
    getVenues({ pageSize: 100 }).then(res => {
      setVenues(res.data)
      if (res.data.length > 0 && !formData.venueId) {
        setFormData(prev => ({ ...prev, venueId: res.data[0].id.toString() }))
      }
      setLoadingVenues(false)
    }).catch(err => {
      console.error(err)
      setLoadingVenues(false)
    })
  }, [])

  useEffect(() => {
    if (!formData.venueId) {
      setCourts([])
      return
    }
    setLoadingCourts(true)
    getCourtsByVenue(formData.venueId, { pageSize: 100 }).then(res => {
      setCourts(res.data)
      setLoadingCourts(false)
    }).catch(err => {
      console.error(err)
      setLoadingCourts(false)
    })
  }, [formData.venueId])

  const toggleCourt = (courtId: string) => {
    setFormData(prev => {
      const ids = new Set(prev.courtIds)
      if (ids.has(courtId)) ids.delete(courtId)
      else ids.add(courtId)
      return { ...prev, courtIds: Array.from(ids) }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await onSubmit({
        ...formData,
        dealValue: parseFloat(formData.dealValue),
        maxUses: parseInt(formData.maxUses, 10),
        courtIds: formData.applyOnAllCourts ? [] : formData.courtIds.map(id => parseInt(id, 10)),
        venueId: parseInt(formData.venueId, 10),
        // Mocking some required fields for now
        applicableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
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

        {/* Placement Options */}
        <div className="space-y-4 bg-surface border border-border p-4 rounded-xl">
          <h4 className="text-body font-semibold text-primary">Placement Options</h4>

          <Dropdown
            label="Select Venue"
            required
            options={venues.map(v => ({ label: v.name, value: v.id.toString() }))}
            value={formData.venueId}
            onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
            disabled={loadingVenues || !!initialData} // Don't let them change venue on edit if the API doesn't support it
          />

          <div className="pt-2">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="applyOnAllCourts"
                checked={formData.applyOnAllCourts}
                onChange={(e) => setFormData({ ...formData, applyOnAllCourts: e.target.checked })}
                className="w-4 h-4 text-brand rounded border-border focus:ring-brand accent-brand"
              />
              <label htmlFor="applyOnAllCourts" className="text-body-sm font-medium text-primary">
                Apply to all courts in this venue
              </label>
            </div>

            {!formData.applyOnAllCourts && (
              <div className="pl-7 space-y-2">
                <p className="text-caption text-secondary mb-2">Select the specific courts for this deal:</p>
                {loadingCourts ? (
                  <p className="text-caption text-secondary">Loading courts...</p>
                ) : courts.length === 0 ? (
                  <p className="text-caption text-error">No courts found in this venue.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {courts.map(court => (
                      <label key={court.id} className="flex items-center gap-2 p-2 border border-border rounded-lg bg-surface-variant/30 hover:bg-surface-variant cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.courtIds.includes(court.id.toString())}
                          onChange={() => toggleCourt(court.id.toString())}
                          className="w-4 h-4 text-brand rounded border-border focus:ring-brand accent-brand"
                        />
                        <span className="text-body-sm text-primary truncate">{court.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Deal Basics */}
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
                maxLength={15}
                value={formData.promoCode}
                onChange={(e) => {
                  const sanitized = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15)
                  setFormData({ ...formData, promoCode: sanitized })
                }}
                placeholder="e.g. SUMMER20"
                leftIcon={<Tag size={16} />}
              />
            </div>
          </div>
        </div>

        {/* Discount Logic */}
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

        {/* Validity & Limits */}
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
          disabled={!formData.applyOnAllCourts && formData.courtIds.length === 0}
        >
          {initialData ? 'Save Changes' : 'Create Deal'}
        </Button>
      </div>
    </form>
  )
}
