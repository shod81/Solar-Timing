import { memo, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GeoLocation } from '../types'

interface LocationMapProps {
  location: GeoLocation
  /** Optional Callback bei Standort-Auswahl per Klick oder Pin-Drag. */
  onLocationSelect?: (loc: GeoLocation) => void
  /** Kartenhöhe in CSS-Pixeln. */
  height?: number
  /** Zoom-Stufe 0–19. */
  zoom?: number
}

const customPinIcon = L.divIcon({
  className: 'leaflet-custom-pin',
  html: `
    <div class="custom-pin-glow"></div>
    <div class="custom-pin-core"></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

/**
 * Interaktive Leaflet-Karte mit Drag-&-Drop Pin-Marker und Klick-Auswahl.
 */
export default memo(function LocationMap({
  location,
  onLocationSelect,
  height = 200,
  zoom = 13,
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const isInternalUpdate = useRef(false)
  const onSelectRef = useRef(onLocationSelect)
  onSelectRef.current = onLocationSelect

  // Map-Initialisierung
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // React-StrictMode ruft Effekte im Dev-Modus doppelt aus (Mount → Cleanup
    // → Mount). Leaflet merkt sich `_leaflet_id` am Container; ein erneutes
    // L.map() auf denselben Container wirft sonst "Map container is already
    // initialized". Deshalb bereinigen wir die ID beim Re-Mount explizit.
    // @ts-expect-error – interne Leaflet-Eigenschaft, nicht typisiert
    if (container._leaflet_id != null) {
      // @ts-expect-error – interne Leaflet-Eigenschaft
      container._leaflet_id = null
    }

    const map = L.map(container, {
      center: [location.latitude, location.longitude],
      zoom,
      zoomControl: true,
      attributionControl: false,
    })

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    tileLayer.on('tileerror', () => {
      tileLayer.setUrl('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png')
    })

    const marker = L.marker([location.latitude, location.longitude], {
      icon: customPinIcon,
      draggable: true,
    }).addTo(map)

    // Event: Pin gezogen
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      isInternalUpdate.current = true
      onSelectRef.current?.({
        latitude: pos.lat,
        longitude: pos.lng,
      })
    })

    // Event: Auf Karte geklickt
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      marker.setLatLng([lat, lng])
      isInternalUpdate.current = true
      onSelectRef.current?.({
        latitude: lat,
        longitude: lng,
      })
    })

    mapRef.current = map
    markerRef.current = marker

    // Invalidate size nach kurzer Verzögerung (für Container-Messung).
    // Timer im Cleanup cleared, damit er nicht nach Unmount auf einer
    // entfernten/zerstörten Map feuert (z.B. StrictMode oder View-Wechsel).
    const invalidateTimer = window.setTimeout(() => {
      map.invalidateSize()
    }, 100)

    return () => {
      window.clearTimeout(invalidateTimer)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, []) // Nur beim Mounten

  // Positions-Update bei Prop-Änderungen von außen (z.B. GPS oder Adresssuche)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    const map = mapRef.current
    const marker = markerRef.current
    if (map && marker) {
      const newPos: L.LatLngTuple = [location.latitude, location.longitude]
      marker.setLatLng(newPos)
      map.setView(newPos, zoom, { animate: true })
    }
  }, [location.latitude, location.longitude, zoom])

  return (
    <div className="location-map-wrap" style={{ height, borderRadius: 12, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
})
