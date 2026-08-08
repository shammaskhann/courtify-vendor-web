'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/forms/Input'
import { PhoneInput } from '@/components/forms/PhoneInput'
import { PasswordInput } from '@/components/forms/PasswordInput'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { AlertCircle, CheckCircle2, MapPin, Map } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import dynamic from 'next/dynamic'

const MapDialog = dynamic(() => import('@/components/common/MapDialog').then(mod => mod.MapDialog), { ssr: false })

// Schemas
const step1Schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+92\s\d{3}\s\d{7}$/, 'Please enter a valid phone number (+92 XXX XXXXXXX)'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'One uppercase letter required')
    .regex(/[a-z]/, 'One lowercase letter required')
    .regex(/[0-9]/, 'One number required'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const step2Schema = z.object({
  lat: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  lng: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

export function RegistrationFlow() {
  const { register, isLoading, error, clearError } = useAuth()
  
  const [step, setStep] = useState<1 | 2 | 3>(1)
  
  const [formData, setFormData] = useState<Step1Data & Partial<Step2Data>>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: ''
  })
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)

  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await response.json()
      if (data && data.address) {
        setFormData(prev => ({
          ...prev,
          lat,
          lng,
          address: data.display_name || '',
          city: data.address.city || data.address.town || data.address.village || '',
          state: data.address.state || ''
        }))
      } else {
        setFormData(prev => ({ ...prev, lat, lng }))
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error)
      setFormData(prev => ({ ...prev, lat, lng }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // For numbers in step 2
    const parsedValue = (name === 'lat' || name === 'lng') ? (value ? parseFloat(value) : undefined) : value
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }))
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    if (error) clearError()
  }

  const handleNextStep1 = () => {
    const result = step1Schema.safeParse(formData)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      setFieldErrors({
        name: errors.name?.[0] || '',
        email: errors.email?.[0] || '',
        phone: errors.phone?.[0] || '',
        password: errors.password?.[0] || '',
        confirmPassword: errors.confirmPassword?.[0] || '',
      })
      return
    }
    setFieldErrors({})
    setStep(2)
  }

  const handleNextStep2 = () => {
    const result = step2Schema.safeParse(formData)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      setFieldErrors({
        lat: errors.lat?.[0] || '',
        lng: errors.lng?.[0] || '',
      })
      return
    }
    setFieldErrors({})
    setStep(3)
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setFieldErrors({ lat: 'Geolocation is not supported by your browser' })
      return
    }
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        await fetchAddressFromCoords(lat, lng)
        setFieldErrors(prev => {
          const next = { ...prev }
          delete next.lat
          delete next.lng
          return next
        })
        setIsGettingLocation(false)
      },
      () => {
        // Fallback to Karachi if geolocation fails or is denied
        const fallbackLat = 24.8607
        const fallbackLng = 67.0011
        fetchAddressFromCoords(fallbackLat, fallbackLng)
        setFieldErrors({ lat: 'Unable to retrieve your location. Falling back to default.' })
        setIsGettingLocation(false)
      }
    )
  }

  const handleMapSelect = async (lat: number, lng: number) => {
    setIsMapOpen(false)
    setIsGettingLocation(true)
    await fetchAddressFromCoords(lat, lng)
    setIsGettingLocation(false)
    setFieldErrors(prev => {
      const next = { ...prev }
      delete next.lat
      delete next.lng
      return next
    })
  }

  const handleSubmit = async () => {
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        lat: formData.lat,
        lng: formData.lng,
        address: formData.address,
        city: formData.city,
      })
    } catch {
      // Error is handled by AuthContext and displayed below
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-border -z-10 -translate-y-1/2" />
        <div className="absolute left-0 top-1/2 h-0.5 bg-brand -z-10 -translate-y-1/2 transition-all duration-300" 
             style={{ width: `${(step - 1) * 50}%` }} />
        
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2 bg-background px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${
              step >= s ? 'bg-brand text-primary' : 'bg-surface border border-border text-tertiary'
            }`}>
              {step > s ? <CheckCircle2 size={16} /> : s}
            </div>
            <span className={`text-caption font-medium ${step >= s ? 'text-primary' : 'text-tertiary'}`}>
              {s === 1 ? 'Account' : s === 2 ? 'Location' : 'Review'}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Typography variant="h3">
            {step === 1 ? 'Create your account' : step === 2 ? 'Where is your facility?' : 'Review details'}
          </Typography>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-error-bg border border-error/20 flex items-start gap-3">
            <AlertCircle className="text-error shrink-0 mt-0.5" size={18} />
            <div className="flex flex-col gap-1">
              <Typography variant="body-sm" color="error" className="font-medium">
                {error}
              </Typography>
              {error.includes('already registered') && (
                <Link href={ROUTES.LOGIN} className="text-caption text-brand hover:underline font-medium">
                  Go to Login
                </Link>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: Account */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={fieldErrors.name}
              maxLength={50}
              required
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email}
              maxLength={100}
              required
            />
            <PhoneInput
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={fieldErrors.phone}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordInput
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                maxLength={64}
                required
              />
              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={fieldErrors.confirmPassword}
                maxLength={64}
                required
              />
            </div>
            <Button fullWidth onClick={handleNextStep1} className="mt-4">
              Continue
            </Button>
            <div className="text-center mt-4">
              <Typography variant="body-sm">
                Already have an account? <Link href={ROUTES.LOGIN} className="text-brand font-medium hover:underline">Log in</Link>
              </Typography>
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Button 
                variant="secondary" 
                onClick={handleGetLocation} 
                isLoading={isGettingLocation}
                className="w-full flex items-center justify-center gap-2"
              >
                <MapPin size={18} />
                Use my current location
              </Button>
              <Typography variant="caption" color="secondary">OR CHOOSE ON MAP</Typography>
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                className="w-full h-32 border-2 border-dashed border-border rounded-lg bg-background hover:bg-surface hover:border-brand/50 transition-colors flex flex-col items-center justify-center gap-2 group relative"
                onClick={() => setIsMapOpen(true)}
                disabled={isGettingLocation}
              >
                <Map className={`text-tertiary group-hover:text-brand transition-colors ${isGettingLocation ? 'opacity-50' : ''}`} size={32} />
                <Typography variant="body-sm" className={`text-tertiary group-hover:text-primary transition-colors ${isGettingLocation ? 'opacity-50' : ''}`}>
                  {isGettingLocation ? 'Loading address...' : (formData.lat ? 'Update selected location' : 'Click to open map and select location')}
                </Typography>
              </button>
              {fieldErrors.lat && <Typography variant="caption" color="error">{fieldErrors.lat}</Typography>}

              {formData.lat && formData.lng && !isGettingLocation && (
                <div className="space-y-4 pt-2">
                  <Input
                    label="Full Address"
                    name="address"
                    value={formData.address ?? ''}
                    onChange={handleChange}
                    placeholder="E.g. 123 Main St..."
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      name="city"
                      value={formData.city ?? ''}
                      onChange={handleChange}
                      placeholder="E.g. Karachi"
                    />
                    <Input
                      label="State/Province"
                      name="state"
                      value={formData.state ?? ''}
                      onChange={handleChange}
                      placeholder="E.g. Sindh"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="ghost" onClick={() => setStep(1)} fullWidth>Back</Button>
              <Button onClick={handleNextStep2} fullWidth disabled={isGettingLocation}>Continue</Button>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-background border border-border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <Typography variant="h4">Account Details</Typography>
                <button onClick={() => setStep(1)} className="text-caption text-brand hover:underline">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="caption" color="secondary">Name</Typography>
                  <Typography variant="body-sm">{formData.name}</Typography>
                </div>
                <div>
                  <Typography variant="caption" color="secondary">Email</Typography>
                  <Typography variant="body-sm">{formData.email}</Typography>
                </div>
                <div>
                  <Typography variant="caption" color="secondary">Phone</Typography>
                  <Typography variant="body-sm">{formData.phone}</Typography>
                </div>
              </div>

              <div className="flex justify-between items-center border-b border-border pb-2 pt-2">
                <Typography variant="h4">Location Details</Typography>
                <button onClick={() => setStep(2)} className="text-caption text-brand hover:underline">Edit</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {formData.address && (
                  <div>
                    <Typography variant="caption" color="secondary">Address</Typography>
                    <Typography variant="body-sm">{formData.address}</Typography>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {formData.city && (
                    <div>
                      <Typography variant="caption" color="secondary">City</Typography>
                      <Typography variant="body-sm">{formData.city}</Typography>
                    </div>
                  )}
                  {formData.state && (
                    <div>
                      <Typography variant="caption" color="secondary">State</Typography>
                      <Typography variant="body-sm">{formData.state}</Typography>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Typography variant="caption" color="secondary">Latitude</Typography>
                    <Typography variant="body-sm">{formData.lat}</Typography>
                  </div>
                  <div>
                    <Typography variant="caption" color="secondary">Longitude</Typography>
                    <Typography variant="body-sm">{formData.lng}</Typography>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setStep(2)} fullWidth disabled={isLoading}>Back</Button>
              <Button onClick={handleSubmit} fullWidth isLoading={isLoading}>Complete Registration</Button>
            </div>
          </div>
        )}
      </div>

      <MapDialog 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        onSelect={handleMapSelect}
        initialLat={formData.lat}
        initialLng={formData.lng}
      />
    </div>
  )
}
