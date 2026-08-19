'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface VenueMapProps {
  lat: number
  lng: number
  height?: string
}

export function VenueMap({ lat, lng, height = '200px' }: VenueMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{ height, width: '100%' }} className="bg-surface-variant animate-pulse rounded-xl" />
  }

  return (
    <div style={{ height, width: '100%', overflow: 'hidden' }} className="rounded-xl border border-border z-0 relative">
      <MapContainer center={[lat, lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  )
}
