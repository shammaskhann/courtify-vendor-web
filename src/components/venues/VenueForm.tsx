'use client'

import React, { useState, useRef } from 'react'
import { Input } from '../forms/Input'
import { Dropdown } from '../forms/Dropdown'
import { Button } from '../ui/Button'
import { Check, MapPin, UploadCloud, Map as MapIcon, X } from 'lucide-react'
import { useMetadata } from '@/contexts/MetadataContext'
import { uploadVenueImage } from '@/lib/api/uploadApi'
import dynamic from 'next/dynamic'

const MapDialog = dynamic(() => import('@/components/common/MapDialog').then(mod => mod.MapDialog), { ssr: false })

interface VenueFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  editSection?: 'basic' | 'location' | 'amenities' | 'hours' | 'image' | null
}

export function VenueForm({ initialData, onSubmit, onCancel, editSection }: VenueFormProps) {
  const { cities, amenities } = useMetadata()
  const isEditing = !!initialData
  const totalSteps = editSection ? 1 : (isEditing ? 4 : 5)
  const initialStep = editSection === 'basic' ? 1 
    : editSection === 'location' ? 2 
    : editSection === 'amenities' ? 3 
    : editSection === 'hours' ? 4 
    : editSection === 'image' ? 5 
    : 1
    
  const [step, setStep] = useState(initialStep)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const formatTimeForInput = (timeString: string) => {
    if (!timeString) return '06:00'
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return timeString
    let hours = parseInt(match[1])
    const mins = match[2]
    const ampm = match[3].toUpperCase()
    
    if (ampm === 'PM' && hours < 12) hours += 12
    if (ampm === 'AM' && hours === 12) hours = 0
    
    return `${hours.toString().padStart(2, '0')}:${mins}`
  }

  const formatTimeForApi = (timeString: string) => {
    if (!timeString || !timeString.includes(':')) return timeString
    const [h, m] = timeString.split(':')
    let hours = parseInt(h)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    
    hours = hours % 12
    if (hours === 0) hours = 12
    
    return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`
  }

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    openingTime: formatTimeForInput(initialData?.openingTime || '06:00 AM'),
    closingTime: formatTimeForInput(initialData?.closingTime || '11:00 PM'),
    amenities: initialData?.amenities || ([] as string[]),
    image: initialData?.image || '',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    isApproved: initialData?.isApproved,
    isDisabled: initialData?.isDisabled,
  })

  const [isMapOpen, setIsMapOpen] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState(initialData?.venueImage || initialData?.image || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const validateStep = (currentStep: number): boolean => {
    setError(null)
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Venue Name is required')
        return false
      }
      if (!formData.description.trim()) {
        setError('Description is required')
        return false
      }
    } else if (currentStep === 2) {
      if (!formData.city) {
        setError('City is required')
        return false
      }
      if (!formData.address.trim()) {
        setError('Address is required')
        return false
      }
      if (!formData.latitude || !formData.longitude) {
        setError('Location coordinates are required. Please use the map.')
        return false
      }
    } else if (currentStep === 3) {
      if (formData.amenities.length === 0) {
        setError('Please select at least one amenity')
        return false
      }
    } else if (currentStep === 4) {
      if (!formData.openingTime) {
        setError('Opening time is required')
        return false
      }
      if (!formData.closingTime) {
        setError('Closing time is required')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }
  const handlePrev = () => setStep(step - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editSection && step < totalSteps) {
      handleNext()
      return
    }
    
    if (!validateStep(step)) return

    try {
      setIsSubmitting(true)
      setError(null)
      
      let imageUrl = formData.image
      
      if (!isEditing && !editSection) {
        if (!selectedFile) {
          setError('Please select a venue image')
          setIsSubmitting(false)
          return
        }
        
        try {
          setUploadingImage(true)
          imageUrl = await uploadVenueImage(selectedFile)
        } catch (uploadErr) {
          setError('Failed to upload image: ' + (uploadErr as Error).message)
          setUploadingImage(false)
          setIsSubmitting(false)
          return
        }
        setUploadingImage(false)
      } else if (editSection === 'image') {
        if (selectedFile) {
          try {
            setUploadingImage(true)
            imageUrl = await uploadVenueImage(selectedFile)
          } catch (uploadErr) {
            setError('Failed to upload image: ' + (uploadErr as Error).message)
            setUploadingImage(false)
            setIsSubmitting(false)
            return
          }
          setUploadingImage(false)
        }
      }

      let payload: any = {}
      if (editSection === 'basic') {
        payload = { name: formData.name, description: formData.description }
      } else if (editSection === 'location') {
        payload = { address: formData.address, city: formData.city, latitude: formData.latitude, longitude: formData.longitude }
      } else if (editSection === 'amenities') {
        payload = { amenities: formData.amenities }
      } else if (editSection === 'hours') {
        payload = { openingTime: formatTimeForApi(formData.openingTime), closingTime: formatTimeForApi(formData.closingTime) }
      } else if (editSection === 'image') {
        payload = { image: imageUrl }
      } else {
        payload = {
          ...formData,
          image: imageUrl,
          openingTime: formatTimeForApi(formData.openingTime),
          closingTime: formatTimeForApi(formData.closingTime)
        }
      }

      await onSubmit(payload)
    } catch (err) {
      setError((err as Error).message || 'Failed to save venue')
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
  
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await response.json()
      if (data && data.address) {
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: data.display_name || prev.address,
          city: data.address.city || data.address.town || data.address.village || prev.city
        }))
      } else {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error)
      setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
    }
  }

  const handleMapSelect = async (lat: number, lng: number) => {
    setIsMapOpen(false)
    setIsGettingLocation(true)
    await fetchAddressFromCoords(lat, lng)
    setIsGettingLocation(false)
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) return
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await fetchAddressFromCoords(position.coords.latitude, position.coords.longitude)
        setIsGettingLocation(false)
      },
      () => setIsGettingLocation(false)
    )
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setSelectedFile(file)
    const objectUrl = URL.createObjectURL(file)
    setPreviewImage(objectUrl)
    setError(null)
  }

  const removeImage = () => {
    setPreviewImage('')
    setSelectedFile(null)
    setFormData(prev => ({ ...prev, image: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {!editSection && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={`h-2 w-8 sm:w-12 rounded-pill ${
                  s <= step ? 'bg-brand' : 'bg-surface-variant'
                } transition-colors duration-base`}
              />
            ))}
          </div>
          <span className="text-caption text-secondary">Step {step} of {totalSteps}</span>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-error-bg border border-error/20 text-error text-body-sm rounded-lg">
          {error}
        </div>
      )}

      {isEditing && (
        <div className="mb-4 flex gap-2">
           {formData.isApproved ? (
             <span className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full">Approved</span>
           ) : (
             <span className="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded-full">Pending Approval</span>
           )}
           {formData.isDisabled && (
             <span className="px-2 py-1 bg-error/10 text-error text-xs font-medium rounded-full">Disabled</span>
           )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-h4 font-semibold text-primary mb-4">Basic Details</h3>
            <Input
              label="Venue Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Trap's Arena - DHA"
            />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-label text-primary">Description</label>
              <textarea
                className="w-full p-3 rounded-md bg-surface border border-border text-body text-primary placeholder:text-tertiary transition-all focus:border-brand focus:ring-2 focus:ring-brand outline-none min-h-[120px] resize-none"
                placeholder="Tell customers about your facility..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-h4 font-semibold text-primary mb-4">Location</h3>
            
            <div className="flex flex-col items-center gap-3">
              <Button 
                type="button"
                variant="secondary" 
                onClick={handleGetLocation} 
                isLoading={isGettingLocation}
                className="w-full flex items-center justify-center gap-2"
              >
                <MapPin size={18} />
                Use my current location
              </Button>
            </div>
            
            <button 
              type="button"
              className="w-full h-32 border-2 border-dashed border-border rounded-lg bg-background hover:bg-surface hover:border-brand/50 transition-colors flex flex-col items-center justify-center gap-2 group relative"
              onClick={() => setIsMapOpen(true)}
              disabled={isGettingLocation}
            >
              <MapIcon className={`text-tertiary group-hover:text-brand transition-colors ${isGettingLocation ? 'opacity-50' : ''}`} size={32} />
              <span className={`text-body-sm text-tertiary group-hover:text-primary transition-colors ${isGettingLocation ? 'opacity-50' : ''}`}>
                {isGettingLocation ? 'Loading address...' : (formData.latitude ? 'Update selected location' : 'Click to open map and select location')}
              </span>
            </button>
            
            <div className="space-y-4 pt-2">
              <Dropdown
                label="City"
                required
                options={cities.map(c => ({ label: c.name, value: c.name }))}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="Street Address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Plot 123, 26th Street"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-h4 font-semibold text-primary mb-4">Amenities</h3>
            <div className="pt-2">
              <p className="text-caption text-secondary mb-3">Select all facilities available at this venue.</p>
              
              <div className="grid grid-cols-2 gap-3">
                {amenities.map((amenityObj) => {
                  const isSelected = formData.amenities.includes(amenityObj.name)
                  return (
                    <button
                      key={amenityObj.id}
                      type="button"
                      onClick={() => toggleAmenity(amenityObj.name)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        isSelected 
                          ? 'border-brand bg-brand/5 text-primary' 
                          : 'border-border bg-surface text-secondary hover:border-border-strong'
                      }`}
                    >
                      <span className="text-body-sm font-medium">{amenityObj.name}</span>
                      {isSelected && <Check size={16} className="text-brand" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-h4 font-semibold text-primary mb-4">Operating Hours</h3>
            <div className="grid grid-cols-2 gap-4">
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

        {step === 5 && !isEditing && (
          <div className="space-y-4">
            <h3 className="text-h4 font-semibold text-primary mb-4">Venue Image</h3>
            <p className="text-body-sm text-secondary mb-4">Upload a high-quality cover image for your venue. This will be the first thing customers see.</p>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            
            {!previewImage ? (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full h-48 border-2 border-dashed border-border rounded-xl bg-surface hover:bg-surface-variant transition-colors flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} />
                </div>
                <div className="text-center">
                  <span className="text-body-sm font-medium text-primary block">Click to select image</span>
                  <span className="text-caption text-secondary">PNG, JPG up to 5MB</span>
                </div>
              </button>
            ) : (
              <div className="relative w-full h-48 rounded-xl border border-border overflow-hidden group">
                <img src={previewImage} alt="Venue preview" className="w-full h-full object-cover" />
                
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="w-10 h-10 rounded-full bg-error text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                    title="Remove image"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sticky -bottom-6 -mx-6 px-6 pb-6 pt-4 mt-auto flex justify-between border-t border-border bg-surface z-10">
        <Button
          type="button"
          variant="secondary"
          onClick={(!editSection && step === 1) || editSection ? onCancel : handlePrev}
          disabled={isSubmitting || uploadingImage}
        >
          {(!editSection && step === 1) || editSection ? 'Cancel' : 'Back'}
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting || uploadingImage}
          disabled={isSubmitting || uploadingImage}
        >
          {(!editSection && step === totalSteps) || editSection ? (isEditing ? 'Save Changes' : 'Create Venue') : 'Continue'}
        </Button>
      </div>
    </form>

      <MapDialog 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        onSelect={handleMapSelect}
        initialLat={formData.latitude || 24.8607} 
        initialLng={formData.longitude || 67.0011}
      />
    </>
  )
}
