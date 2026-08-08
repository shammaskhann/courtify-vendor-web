'use client'

import React, { useState, useRef } from 'react'
import { Input } from '../forms/Input'
import { Dropdown } from '../forms/Dropdown'
import { Button } from '../ui/Button'
import { Check, X, Plus } from 'lucide-react'
import { useMetadata } from '@/contexts/MetadataContext'
import { uploadCourtImages } from '@/lib/api/uploadApi'
import { WEEK_DAYS } from '@/types/models'

interface CourtFormProps {
  initialData?: any
  venues: { label: string; value: string }[]
  preselectedVenueId?: string
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function CourtForm({ initialData, venues, preselectedVenueId, onSubmit, onCancel }: CourtFormProps) {
  const { sportTypes } = useMetadata()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format helper
  const formatTimeForInput = (timeString?: string | null) => {
    if (!timeString) return ''
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return timeString
    let hours = parseInt(match[1])
    const mins = match[2]
    const ampm = match[3].toUpperCase()
    
    if (ampm === 'PM' && hours < 12) hours += 12
    if (ampm === 'AM' && hours === 12) hours = 0
    
    return `${hours.toString().padStart(2, '0')}:${mins}`
  }

  const formatTimeForApi = (timeString?: string | null) => {
    if (!timeString || !timeString.includes(':')) return timeString
    const [h, m] = timeString.split(':')
    let hours = parseInt(h)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    
    hours = hours % 12
    if (hours === 0) hours = 12
    
    return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`
  }

  // Initialize form state
  const hasPeakPricing = !!initialData?.peakStartTime
  const [isPeakEnabled, setIsPeakEnabled] = useState(hasPeakPricing)

  const [formData, setFormData] = useState({
    venueId: initialData?.venueId || preselectedVenueId || (venues.length > 0 ? venues[0].value : ''),
    name: initialData?.name || initialData?.courtName || '',
    sportType: initialData?.sportType || [],
    isHalfHourSlot: initialData?.isHalfHourSlot ?? false,
    pricingType: initialData?.pricingType || 'CONSTANT',
    openWeekdays: initialData?.openWeekdays || [...WEEK_DAYS],
    images: initialData?.images || [],
    
    // Constant
    constantPriceOffPeak: initialData?.constantPriceOffPeak || initialData?.constantPrice || '',
    constantPricePeak: initialData?.constantPricePeak || '',
    
    // Weekday / Weekend
    weekdayPriceOffPeak: initialData?.weekdayPriceOffPeak || initialData?.weekdayPrice || '',
    weekendPriceOffPeak: initialData?.weekendPriceOffPeak || initialData?.weekendPrice || '',
    weekdayPricePeak: initialData?.weekdayPricePeak || '',
    weekendPricePeak: initialData?.weekendPricePeak || '',

    // Per day
    pricePerDayOffPeak: initialData?.pricePerDayOffPeak || initialData?.pricePerDay || {},
    pricePerDayPeak: initialData?.pricePerDayPeak || {},

    // Peak times
    peakStartTime: formatTimeForInput(initialData?.peakStartTime),
    peakEndTime: formatTimeForInput(initialData?.peakEndTime),
  })

  // Images state
  const [uploadingImages, setUploadingImages] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<{file: File, preview: string}[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleNext = () => {
    setError(null)
    
    // Step 1 Validation
    if (step === 1 && !formData.venueId) {
      setError('Please select a venue.')
      return
    }
    
    // Step 2 Validation
    if (step === 2) {
      if (!formData.name) {
        setError('Court name is required.')
        return
      }
      if (formData.sportType.length === 0) {
        setError('Please select at least one sport.')
        return
      }
    }

    // Step 3 Validation
    if (step === 3) {
      if (formData.pricingType === 'CONSTANT') {
        if (!formData.constantPriceOffPeak) return setError('Off-peak price is required.')
        if (isPeakEnabled && !formData.constantPricePeak) return setError('Peak price is required.')
      }
      if (formData.pricingType === 'WEEKDAY_WEEKEND') {
        if (!formData.weekdayPriceOffPeak || !formData.weekendPriceOffPeak) return setError('Weekday and weekend off-peak prices are required.')
        if (isPeakEnabled && (!formData.weekdayPricePeak || !formData.weekendPricePeak)) return setError('Peak prices are required.')
      }
      if (formData.pricingType === 'PER_DAY') {
        const days = formData.openWeekdays
        for (const day of days) {
          if (!formData.pricePerDayOffPeak[day]) return setError(`Off-peak price for ${day} is required.`)
          if (isPeakEnabled && !formData.pricePerDayPeak[day]) return setError(`Peak price for ${day} is required.`)
        }
      }
      if (isPeakEnabled && (!formData.peakStartTime || !formData.peakEndTime)) {
        return setError('Peak start and end times are required when peak pricing is enabled.')
      }
    }

    // Step 4 Validation
    if (step === 4 && formData.openWeekdays.length === 0) {
      setError('Select at least one operating day.')
      return
    }

    setStep(step + 1)
  }

  const handlePrev = () => setStep(step - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 5) {
      handleNext()
      return
    }
    
    if (formData.images.length === 0 && pendingFiles.length === 0) {
      setError('Please upload at least one image.')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)

      let uploadedUrls: string[] = []
      if (pendingFiles.length > 0) {
        setUploadingImages(true)
        try {
           uploadedUrls = await uploadCourtImages(pendingFiles.map(pf => pf.file))
        } catch (uploadErr: any) {
           setError('Failed to upload images: ' + uploadErr.message)
           setUploadingImages(false)
           setIsSubmitting(false)
           return
        }
        setUploadingImages(false)
      }

      const finalImages = [...formData.images, ...uploadedUrls]

      // Build payload based on pricing type
      const payload: any = {
        venueId: formData.venueId,
        name: formData.name,
        sportType: formData.sportType,
        openWeekdays: formData.openWeekdays,
        isHalfHourSlot: formData.isHalfHourSlot,
        pricingType: formData.pricingType,
        images: finalImages,
      }

      if (isPeakEnabled) {
        payload.peakStartTime = formatTimeForApi(formData.peakStartTime)
        payload.peakEndTime = formatTimeForApi(formData.peakEndTime)
      } else {
        payload.peakStartTime = null
        payload.peakEndTime = null
      }

      const num = (val: any) => val ? parseFloat(val) : undefined

      if (formData.pricingType === 'CONSTANT') {
        payload.constantPriceOffPeak = num(formData.constantPriceOffPeak)
        if (isPeakEnabled) payload.constantPricePeak = num(formData.constantPricePeak)
      } else if (formData.pricingType === 'WEEKDAY_WEEKEND') {
        payload.weekdayPriceOffPeak = num(formData.weekdayPriceOffPeak)
        payload.weekendPriceOffPeak = num(formData.weekendPriceOffPeak)
        if (isPeakEnabled) {
          payload.weekdayPricePeak = num(formData.weekdayPricePeak)
          payload.weekendPricePeak = num(formData.weekendPricePeak)
        }
      } else if (formData.pricingType === 'PER_DAY') {
        payload.pricePerDayOffPeak = {}
        payload.pricePerDayPeak = {}
        formData.openWeekdays.forEach((day: string) => {
          payload.pricePerDayOffPeak[day] = num(formData.pricePerDayOffPeak[day])
          if (isPeakEnabled) {
            payload.pricePerDayPeak[day] = num(formData.pricePerDayPeak[day])
          }
        })
        if (!isPeakEnabled) payload.pricePerDayPeak = null
      }

      await onSubmit(payload)
    } catch (err: any) {
      setError(err.message || 'Failed to submit court.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const files = Array.from(e.target.files)
    
    const newPending = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    setPendingFiles([...pendingFiles, ...newPending])
    
    if (fileInputRef.current) fileInputRef.current.value = ''
    setError(null)
  }

  const removeImage = (indexToRemove: number) => {
    if (indexToRemove < formData.images.length) {
      setFormData({
        ...formData,
        images: formData.images.filter((_: any, i: number) => i !== indexToRemove)
      })
    } else {
      const pendingIndex = indexToRemove - formData.images.length
      setPendingFiles(pendingFiles.filter((_, i) => i !== pendingIndex))
    }
  }

  const toggleSport = (sport: string) => {
    const current = formData.sportType
    if (current.includes(sport)) {
      setFormData({ ...formData, sportType: current.filter((s: string) => s !== sport) })
    } else {
      setFormData({ ...formData, sportType: [...current, sport] })
    }
  }

  const toggleDay = (day: string) => {
    const current = formData.openWeekdays
    if (current.includes(day)) {
      setFormData({ ...formData, openWeekdays: current.filter((d: string) => d !== day) })
    } else {
      setFormData({ ...formData, openWeekdays: [...current, day] })
    }
  }

  const handlePerDayChange = (day: string, type: 'offPeak' | 'peak', value: string) => {
    const field = type === 'offPeak' ? 'pricePerDayOffPeak' : 'pricePerDayPeak'
    setFormData({
      ...formData,
      [field]: { ...formData[field as keyof typeof formData] as Record<string, string>, [day]: value }
    })
  }

  return (
    <>
      {/* Steps Header */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border -z-10" />
        {[
          { num: 1, label: 'Venue' },
          { num: 2, label: 'Details' },
          { num: 3, label: 'Pricing' },
          { num: 4, label: 'Schedule' },
          { num: 5, label: 'Images' },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-surface px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-body-sm font-semibold transition-colors ${
              step === s.num ? 'bg-brand text-white' : 
              step > s.num ? 'bg-brand/20 text-brand' : 'bg-surface-variant text-secondary'
            }`}>
              {step > s.num ? <Check size={16} /> : s.num}
            </div>
            <span className={`text-caption font-medium hidden sm:block ${step >= s.num ? 'text-primary' : 'text-secondary'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 mb-6 rounded-lg bg-error/10 border border-error/20 text-error-text text-body-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          
          {/* STEP 1: Venue */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-h4 font-semibold text-primary mb-1">Select Venue</h3>
              <p className="text-body-sm text-secondary mb-4">Which venue does this court belong to?</p>
              
              <Dropdown
                label="Venue"
                required
                options={venues}
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                disabled={!!preselectedVenueId}
              />
            </div>
          )}

          {/* STEP 2: Basic Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-h4 font-semibold text-primary mb-1">Court Details</h3>
                <p className="text-body-sm text-secondary">Basic information about the court.</p>
              </div>
              
              <Input
                label="Court Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Futsal Court A"
              />

              <div>
                <label className="block text-body-sm font-medium text-primary mb-2">
                  Sport Types (Select all that apply) <span className="text-error">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {sportTypes.map((sport) => {
                    const isSelected = formData.sportType.includes(sport.name)
                    return (
                      <button
                        key={sport.id}
                        type="button"
                        onClick={() => toggleSport(sport.name)}
                        className={`px-3 py-1.5 rounded-full text-caption font-medium border transition-colors ${
                          isSelected 
                            ? 'bg-brand/10 border-brand text-brand' 
                            : 'bg-surface-variant border-border text-secondary hover:border-brand/50'
                        }`}
                      >
                        {sport.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-variant border border-border rounded-xl">
                <div>
                  <h4 className="text-body-sm font-semibold text-primary">Half-Hour Slots</h4>
                  <p className="text-caption text-secondary">Allow customers to book 30-minute intervals (e.g. 1.5 hours)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.isHalfHourSlot}
                    onChange={(e) => setFormData({ ...formData, isHalfHourSlot: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Pricing */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-h4 font-semibold text-primary mb-1">Pricing Configuration</h3>
                <p className="text-body-sm text-secondary">Set up how much it costs to book this court.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'CONSTANT', label: 'Constant', desc: 'Same price every day' },
                  { id: 'WEEKDAY_WEEKEND', label: 'Weekday / Weekend', desc: 'Different weekend rates' },
                  { id: 'PER_DAY', label: 'Per Day', desc: 'Specific price per day' },
                ].map(model => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, pricingType: model.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.pricingType === model.id 
                        ? 'border-brand bg-brand/5 ring-1 ring-brand' 
                        : 'border-border bg-surface hover:border-brand/50'
                    }`}
                  >
                    <div className="font-semibold text-body-sm text-primary">{model.label}</div>
                    <div className="text-caption text-secondary mt-1">{model.desc}</div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-variant border border-border rounded-xl">
                <div>
                  <h4 className="text-body-sm font-semibold text-primary">Enable Peak Pricing</h4>
                  <p className="text-caption text-secondary">Charge different rates during busy hours.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={isPeakEnabled}
                    onChange={(e) => setIsPeakEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                </label>
              </div>

              {isPeakEnabled && (
                <div className="grid grid-cols-2 gap-4 p-4 border border-border rounded-xl">
                  <Input
                    label="Peak Start Time"
                    type="time"
                    required
                    value={formData.peakStartTime}
                    onChange={(e) => setFormData({ ...formData, peakStartTime: e.target.value })}
                  />
                  <Input
                    label="Peak End Time"
                    type="time"
                    required
                    value={formData.peakEndTime}
                    onChange={(e) => setFormData({ ...formData, peakEndTime: e.target.value })}
                  />
                </div>
              )}

              <div className="p-4 border border-border rounded-xl bg-surface space-y-4">
                {formData.pricingType === 'CONSTANT' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={isPeakEnabled ? "Off-Peak Price (PKR)" : "Price (PKR)"}
                      type="number"
                      required
                      value={formData.constantPriceOffPeak}
                      onChange={(e) => setFormData({ ...formData, constantPriceOffPeak: e.target.value })}
                    />
                    {isPeakEnabled && (
                      <Input
                        label="Peak Price (PKR)"
                        type="number"
                        required
                        value={formData.constantPricePeak}
                        onChange={(e) => setFormData({ ...formData, constantPricePeak: e.target.value })}
                      />
                    )}
                  </div>
                )}

                {formData.pricingType === 'WEEKDAY_WEEKEND' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-body-sm">Weekday Pricing</h4>
                      <Input
                        label={isPeakEnabled ? "Off-Peak (PKR)" : "Price (PKR)"}
                        type="number"
                        required
                        value={formData.weekdayPriceOffPeak}
                        onChange={(e) => setFormData({ ...formData, weekdayPriceOffPeak: e.target.value })}
                      />
                      {isPeakEnabled && (
                        <Input
                          label="Peak Price (PKR)"
                          type="number"
                          required
                          value={formData.weekdayPricePeak}
                          onChange={(e) => setFormData({ ...formData, weekdayPricePeak: e.target.value })}
                        />
                      )}
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-body-sm">Weekend Pricing</h4>
                      <Input
                        label={isPeakEnabled ? "Off-Peak (PKR)" : "Price (PKR)"}
                        type="number"
                        required
                        value={formData.weekendPriceOffPeak}
                        onChange={(e) => setFormData({ ...formData, weekendPriceOffPeak: e.target.value })}
                      />
                      {isPeakEnabled && (
                        <Input
                          label="Peak Price (PKR)"
                          type="number"
                          required
                          value={formData.weekendPricePeak}
                          onChange={(e) => setFormData({ ...formData, weekendPricePeak: e.target.value })}
                        />
                      )}
                    </div>
                  </div>
                )}

                {formData.pricingType === 'PER_DAY' && (
                  <div className="space-y-3">
                    <div className={`grid ${isPeakEnabled ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mb-2`}>
                      <span className="font-medium text-caption text-secondary">Day</span>
                      <span className="font-medium text-caption text-secondary">Off-Peak (PKR)</span>
                      {isPeakEnabled && <span className="font-medium text-caption text-secondary">Peak (PKR)</span>}
                    </div>
                    {formData.openWeekdays.map((day: string) => (
                      <div key={day} className={`grid ${isPeakEnabled ? 'grid-cols-3' : 'grid-cols-2'} gap-4 items-center`}>
                        <span className="text-body-sm font-medium capitalize">{day.toLowerCase()}</span>
                        <Input
                          type="number"
                          required
                          value={(formData.pricePerDayOffPeak as any)[day] || ''}
                          onChange={(e) => handlePerDayChange(day, 'offPeak', e.target.value)}
                          placeholder="e.g. 1500"
                        />
                        {isPeakEnabled && (
                          <Input
                            type="number"
                            required
                            value={(formData.pricePerDayPeak as any)[day] || ''}
                            onChange={(e) => handlePerDayChange(day, 'peak', e.target.value)}
                            placeholder="e.g. 2000"
                          />
                        )}
                      </div>
                    ))}
                    {formData.openWeekdays.length === 0 && (
                      <p className="text-caption text-error text-center py-4">Please select operating days in the next step first.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Operating Days */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-h4 font-semibold text-primary mb-1">Operating Days</h3>
                <p className="text-body-sm text-secondary">Select the days this court is open for booking.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {WEEK_DAYS.map((day) => {
                  const isSelected = formData.openWeekdays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`flex items-center justify-between gap-2 p-3 rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-brand bg-brand/5 ring-1 ring-brand text-primary' 
                          : 'border-border bg-surface text-secondary hover:border-brand/50'
                      }`}
                    >
                      <span className="text-body-sm font-semibold capitalize truncate">{day.toLowerCase()}</span>
                      <div className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center border ${
                        isSelected ? 'bg-brand border-brand text-white' : 'border-border'
                      }`}>
                        {isSelected && <Check size={12} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Images */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-h4 font-semibold text-primary mb-1">Court Images</h3>
                <p className="text-body-sm text-secondary">Upload photos to show off your court.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...formData.images, ...pendingFiles.map(pf => pf.preview)].map((url: string, i: number) => (
                  <div key={i} className="relative aspect-video rounded-xl border border-border overflow-hidden group">
                    <img src={url} alt={`Court ${i}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="w-8 h-8 rounded-full bg-error text-white flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="aspect-video rounded-xl border-2 border-dashed border-border bg-surface-variant hover:bg-surface hover:border-brand transition-colors flex flex-col items-center justify-center gap-2 text-secondary hover:text-brand disabled:opacity-50"
                >
                  {uploadingImages ? (
                    <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Plus size={24} />
                      <span className="text-body-sm font-medium">Add Photo</span>
                    </>
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          )}

        </div>

        <div className="sticky -bottom-6 -mx-6 px-6 pb-6 pt-4 mt-auto flex justify-between border-t border-border bg-surface z-10">
          <Button
            type="button"
            variant="secondary"
            onClick={step === 1 ? onCancel : handlePrev}
            disabled={isSubmitting || uploadingImages}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting || uploadingImages}
          >
            {step === 5 ? (initialData ? 'Save Changes' : 'Create Court') : 'Continue'}
          </Button>
        </div>
      </form>
    </>
  )
}
