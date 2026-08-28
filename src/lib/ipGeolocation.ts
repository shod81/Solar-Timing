import type { GeoLocation } from '../types'

/* ============================================================
   IP-basierter Standort-Fallback (grobe Position).

   Wird genutzt, wenn GPS verweigert/nicht verfügbar ist und kein
   gespeicherter Standort existiert. Genauigkeit: Stadt-/Regionsebene
   (reicht für Sonnenzeit-Minuten-Korrekturen gut aus).

   Provider-Kette (primär → sekundär), jeweils frei & ohne API-Key:
     1. ipapi.co          (JSON mit latitude/longitude/city)
     2. ipwho.is          (freies HTTPS-Geocoding, robuster Fallback)
   ============================================================ */

const IP_TIMEOUT_MS = 6000

async function fetchJsonTimeout(url: string, timeoutMs = IP_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    window.clearTimeout(timer)
  }
}

/** Provider 1: ipapi.co */
async function fromIpapiCo(): Promise<GeoLocation> {
  const res = await fetchJsonTimeout('https://ipapi.co/json/')
  if (!res.ok) throw new Error(`ipapi.co ${res.status}`)
  const d = (await res.json()) as {
    latitude?: number
    longitude?: number
    city?: string
    country_name?: string
  }
  if (typeof d.latitude !== 'number' || typeof d.longitude !== 'number') {
    throw new Error('ipapi.co: no coords')
  }
  return {
    latitude: d.latitude,
    longitude: d.longitude,
    label: [d.city, d.country_name].filter(Boolean).join(', ') || undefined,
  }
}

/** Provider 2: ipwho.is (freies HTTPS-Geocoding als robuster Fallback). */
async function fromIpWhoIs(): Promise<GeoLocation> {
  const res = await fetchJsonTimeout('https://ipwho.is/')
  if (!res.ok) throw new Error(`ipwho.is ${res.status}`)
  const d = (await res.json()) as {
    success?: boolean
    latitude?: number
    longitude?: number
    city?: string
    country?: string
  }
  if (d.success === false || typeof d.latitude !== 'number' || typeof d.longitude !== 'number') {
    throw new Error('ipwho.is: no coords')
  }
  return {
    latitude: d.latitude,
    longitude: d.longitude,
    label: [d.city, d.country].filter(Boolean).join(', ') || undefined,
  }
}

/**
 * Liefert einen groben IP-basierten Standort.
 * Wirft, wenn alle Provider fehlschlagen (Aufrufer behandelt Graceful).
 */
export async function getIpLocation(): Promise<GeoLocation> {
  const providers = [fromIpapiCo, fromIpWhoIs]
  let lastErr: unknown
  for (const p of providers) {
    try {
      return await p()
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('IP geolocation failed')
}
