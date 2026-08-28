import type { GeoLocation } from '../types'

/* ============================================================
   Geocoding mit robusten Fallbacks.

   Provider-Kette (primär → sekundär):
     Forward (Adresse → Koordinaten):
       1. OpenStreetMap Nominatim
       2. Photon (Komoot)
     Reverse (Koordinaten → Name):
       1. OpenStreetMap Nominatim
       2. BigDataCloud

   Jeder Request hat ein Timeout (AbortController, 8 s), damit bei
   hängenden Servern nicht endlos gewartet wird. Schlägt der primäre
   Provider fehl/Zeitüberschreitung, wird der sekundäre probiert.

   Nutzungsbedingungen (Nominatim): ≤1 Anfrage/Sekunde (im Hook per
   Debounce gesichert), gültiger Referer, Attribution im Footer.
   ============================================================ */

const GEO_TIMEOUT_MS = 8000

export interface SearchResult {
  label: string
  latitude: number
  longitude: number
}

/** fetch mit Timeout (AbortController). Wirft bei Zeitüberschreitung. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = GEO_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timer)
  }
}

/** Versucht nacheinander asynchrone Factory-Funktionen; liefert erstes Erfolg. */
async function tryInOrder<T>(fns: Array<() => Promise<T>>): Promise<T> {
  let lastErr: unknown
  for (const fn of fns) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('All providers failed')
}

export interface StandardAddress {
  street?: string
  houseNumber?: string
  district?: string
  city?: string
  postcode?: string
  state?: string
  country?: string
}

/** Formatiert eine strukturierte Adresse sprach- und kulturspezifisch. */
export function formatStructuredAddress(addr: StandardAddress, displayName: string, lang = 'de'): string {
  const streetName = addr.street?.trim() || ''
  const houseNum = addr.houseNumber?.trim() || ''
  const city = addr.city?.trim() || ''
  const district = addr.district?.trim() || ''
  const postcode = addr.postcode?.trim() || ''
  const state = addr.state?.trim() || ''
  const country = addr.country?.trim() || ''

  const mainPlace = city || district || state

  // Falls gar keine verwertbaren Einzelfelder da sind -> Fallback aus displayName
  if (!streetName && !mainPlace) {
    return buildFallbackLabel(displayName)
  }

  const langPrefix = lang.slice(0, 2).toLowerCase()

  // 1. Ostasiatisch (Chinesisch / Japanisch): Land -> Bundesland -> Stadt -> Straße Hausnummer
  if (langPrefix === 'zh' || langPrefix === 'ja') {
    const streetPart = streetName ? (houseNum ? `${streetName}${houseNum}` : streetName) : ''
    const parts = [country, state, mainPlace, streetPart].filter(Boolean)
    return parts.join(' ')
  }

  // 2. Englisch (US/UK): Hausnummer Straße, Stadt, Bundesland PLZ, Land
  if (langPrefix === 'en') {
    const streetPart = streetName ? (houseNum ? `${houseNum} ${streetName}` : streetName) : ''
    const cityStatePostcode = [mainPlace, state, postcode].filter(Boolean).join(' ')
    const parts = [streetPart, cityStatePostcode, country].filter(Boolean)
    return parts.join(', ')
  }

  // 3. Deutsch (de) sowie Kontinentaleuropäisch (da, nl, sv, no, fi, pl, ru, fr, es, it, pt):
  // Format: Straße Hausnummer, PLZ Ort, Land
  const streetPart = streetName ? (houseNum ? `${streetName} ${houseNum}` : streetName) : ''
  const cityPart = postcode ? `${postcode} ${mainPlace}` : mainPlace
  const parts = [streetPart, cityPart, country].filter(Boolean)

  if (parts.length > 0) {
    return parts.join(', ')
  }

  return buildFallbackLabel(displayName)
}

/** Fallback wenn keine strukturierten Adressdaten vorliegen: Erhält das Land am Ende! */
function buildFallbackLabel(displayName: string): string {
  const parts = displayName.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length <= 2) return displayName
  const head = parts.slice(0, 2).join(', ')
  const country = parts[parts.length - 1]
  if (head.includes(country)) return head
  return `${head}, ${country}`
}

/* ---------- Forward Geocoding (Adress-/Ortssuche) ---------- */

// Provider 1: OpenStreetMap Nominatim
async function searchNominatim(query: string, lang = 'en'): Promise<SearchResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'json')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '5')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('accept-language', lang)
  const res = await fetchWithTimeout(url.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Language': lang,
    },
  })
  if (!res.ok) throw new Error(`Nominatim ${res.status}`)
  const data = (await res.json()) as Array<{
    display_name: string
    lat: string
    lon: string
    address?: {
      road?: string
      pedestrian?: string
      footway?: string
      amenity?: string
      building?: string
      house_number?: string
      suburb?: string
      neighbourhood?: string
      quarter?: string
      city_district?: string
      city?: string
      town?: string
      village?: string
      municipality?: string
      county?: string
      state?: string
      postcode?: string
      country?: string
    }
  }>
  return data.map((d) => {
    const a = d.address || {}
    const std: StandardAddress = {
      street: a.road || a.pedestrian || a.footway || a.amenity || a.building,
      houseNumber: a.house_number,
      district: a.suburb || a.neighbourhood || a.quarter || a.city_district,
      city: a.city || a.town || a.village || a.municipality || a.county,
      postcode: a.postcode,
      state: a.state,
      country: a.country,
    }
    return {
      label: formatStructuredAddress(std, d.display_name, lang),
      latitude: parseFloat(d.lat),
      longitude: parseFloat(d.lon),
    }
  })
}

// Provider 2: Photon (Komoot) – freies OpenSource-Geocoding auf OSM-Daten.
async function searchPhoton(query: string, lang = 'en'): Promise<SearchResult[]> {
  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '5')
  url.searchParams.set('lang', lang.slice(0, 2))
  const res = await fetchWithTimeout(url.toString(), { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Photon ${res.status}`)
  const data = (await res.json()) as {
    features: Array<{
      properties: {
        name?: string
        street?: string
        housenumber?: string
        city?: string
        district?: string
        locality?: string
        postcode?: string
        state?: string
        country?: string
      }
      geometry: { coordinates: [number, number] }
    }>
  }
  return (data.features || []).map((f) => {
    const p = f.properties
    const std: StandardAddress = {
      street: p.street || p.name,
      houseNumber: p.housenumber,
      district: p.district || p.locality,
      city: p.city,
      postcode: p.postcode,
      state: p.state,
      country: p.country,
    }
    const fallback = [p.name, p.city, p.state, p.country].filter(Boolean).join(', ')
    return {
      label: formatStructuredAddress(std, fallback, lang),
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
    }
  })
}

/** Adress-/Ortssuche über Provider-Kette (primär → sekundär). */
export async function searchAddress(query: string, lang = 'en'): Promise<SearchResult[]> {
  const q = query.trim()
  if (!q) return []
  return tryInOrder([
    () => searchNominatim(q, lang),
    () => searchPhoton(q, lang),
  ])
}

/* ---------- Reverse Geocoding (Koordinaten → Name) ---------- */

// Provider 1: OpenStreetMap Nominatim
async function reverseNominatim(loc: GeoLocation): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'json')
  url.searchParams.set('lat', loc.latitude.toFixed(6))
  url.searchParams.set('lon', loc.longitude.toFixed(6))
  url.searchParams.set('zoom', '12')
  url.searchParams.set('addressdetails', '1')
  const res = await fetchWithTimeout(url.toString(), { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Nominatim reverse ${res.status}`)
  const data = (await res.json()) as {
    display_name?: string
    address?: {
      road?: string
      pedestrian?: string
      footway?: string
      amenity?: string
      building?: string
      house_number?: string
      suburb?: string
      neighbourhood?: string
      quarter?: string
      city_district?: string
      city?: string
      town?: string
      village?: string
      municipality?: string
      county?: string
      state?: string
      postcode?: string
      country?: string
    }
  }
  const a = data.address
  if (a) {
    const std: StandardAddress = {
      street: a.road || a.pedestrian || a.footway || a.amenity || a.building,
      houseNumber: a.house_number,
      district: a.suburb || a.neighbourhood || a.quarter || a.city_district,
      city: a.city || a.town || a.village || a.municipality || a.county,
      postcode: a.postcode,
      state: a.state,
      country: a.country,
    }
    const label = formatStructuredAddress(std, data.display_name || '', 'de')
    if (label) return label
  }
  if (data.display_name) return buildFallbackLabel(data.display_name)
  throw new Error('Nominatim: no result')
}

// Provider 2: BigDataCloud – freies Reverse-Geocoding ohne API-Key.
async function reverseBigDataCloud(loc: GeoLocation): Promise<string> {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client')
  url.searchParams.set('latitude', loc.latitude.toFixed(6))
  url.searchParams.set('longitude', loc.longitude.toFixed(6))
  url.searchParams.set('localityLanguage', typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en')
  const res = await fetchWithTimeout(url.toString(), { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`BigDataCloud ${res.status}`)
  const data = (await res.json()) as {
    city?: string
    locality?: string
    principalSubdivision?: string
    countryName?: string
  }
  const place = data.city || data.locality || data.principalSubdivision || ''
  const label = [place, data.countryName].filter(Boolean).join(', ')
  if (label) return label
  throw new Error('BigDataCloud: no result')
}

/** Reverse-Geocoding über Provider-Kette; fällt auf Koordinaten zurück. */
export async function reverseGeocode(loc: GeoLocation): Promise<string> {
  try {
    return await tryInOrder([() => reverseNominatim(loc), () => reverseBigDataCloud(loc)])
  } catch {
    return `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}`
  }
}
