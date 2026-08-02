'use client'

import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, X, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/forms/Input'

interface MapDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
}

// Default fallback is Karachi
const DEFAULT_LAT = 24.8607
const DEFAULT_LNG = 67.0011

function MapEvents({ onMoveEnd }: { onMoveEnd: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter()
      onMoveEnd(center.lat, center.lng)
    },
  })
  return null
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, map.getZoom())
  }, [center, map])
  return null
}

export function MapDialog({ isOpen, onClose, onSelect, initialLat, initialLng }: MapDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const [currentLat, setCurrentLat] = useState(initialLat || DEFAULT_LAT)
  const [currentLng, setCurrentLng] = useState(initialLng || DEFAULT_LNG)
  const [mapCenter, setMapCenter] = useState<[number, number]>([currentLat, currentLng])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const lat = initialLat || DEFAULT_LAT
      const lng = initialLng || DEFAULT_LNG
      setCurrentLat(lat)
      setCurrentLng(lng)
      setMapCenter([lat, lng])
    }
  }, [isOpen, initialLat, initialLng])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Error searching location:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setMapCenter([lat, lng])
    setCurrentLat(lat)
    setCurrentLng(lng)
    setSearchResults([])
    setSearchQuery(result.display_name)
  }

  const handleConfirm = () => {
    onSelect(currentLat, currentLng)
  }

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col h-[80vh] max-h-[800px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-h4 font-semibold text-primary">Select Location</h2>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors text-secondary">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 relative z-10 bg-surface">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a location..."
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
            </div>
            <Button type="submit" isLoading={isSearching}>Search</Button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left px-4 py-3 hover:bg-background border-b border-border last:border-0 transition-colors"
                >
                  <p className="text-sm text-primary truncate">{result.display_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="relative flex-1 bg-background z-0">
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Component to update map center programmatically */}
            <MapUpdater center={mapCenter} />
            
            {/* Component to track map movement and update state */}
            <MapEvents onMoveEnd={(lat, lng) => {
              setCurrentLat(lat)
              setCurrentLng(lng)
            }} />
          </MapContainer>
          
          {/* Fixed center marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none drop-shadow-md">
            <MapPin size={40} className="text-brand -mt-10" fill="currentColor" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3 bg-surface">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm Location</Button>
        </div>
      </div>
    </div>
  )
}
