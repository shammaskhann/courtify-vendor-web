'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getCities, getAmenities, getSportTypes } from '@/lib/api/metadataApi'
import type { CommonItem } from '@/types/models'

interface MetadataContextType {
  cities: CommonItem[]
  amenities: CommonItem[]
  sportTypes: CommonItem[]
  isLoading: boolean
  error: string | null
}

const MetadataContext = createContext<MetadataContextType>({
  cities: [],
  amenities: [],
  sportTypes: [],
  isLoading: true,
  error: null,
})

export function MetadataProvider({ children }: { children: React.ReactNode }) {
  const [cities, setCities] = useState<CommonItem[]>([])
  const [amenities, setAmenities] = useState<CommonItem[]>([])
  const [sportTypes, setSportTypes] = useState<CommonItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    
    async function fetchMetadata() {
      try {
        setIsLoading(true)
        const [citiesData, amenitiesData, sportTypesData] = await Promise.all([
          getCities(),
          getAmenities(),
          getSportTypes()
        ])
        
        if (mounted) {
          setCities(citiesData)
          setAmenities(amenitiesData)
          setSportTypes(sportTypesData)
          setError(null)
        }
      } catch (err) {
        console.error('Failed to load global metadata', err)
        if (mounted) {
          setError('Failed to load metadata. Please refresh the page.')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchMetadata()
    
    return () => {
      mounted = false
    }
  }, [])

  return (
    <MetadataContext.Provider value={{ cities, amenities, sportTypes, isLoading, error }}>
      {children}
    </MetadataContext.Provider>
  )
}

export function useMetadata() {
  return useContext(MetadataContext)
}
