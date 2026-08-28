import { useCallback, useEffect, useRef, useState } from 'react'
import type { GeoLocation, LocationSource } from '../types'
import { getCurrentPosition, GeoError } from '../lib/geoLocation'
import { reverseGeocode } from '../lib/geocode'
import { getIpLocation } from '../lib/ipGeolocation'
import { readUrlParams, writeUrlParams } from '../lib/permalink'

const STORAGE_KEY = 'solartime.location'
const FAVORITES_KEY = 'solartime.locations'

interface StoredLocation {
  location: GeoLocation
  source: LocationSource
}

function loadSaved(): StoredLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredLocation
    if (
      parsed &&
      typeof parsed.location?.latitude === 'number' &&
      typeof parsed.location?.longitude === 'number'
    ) {
      return parsed
    }
  } catch {
    /* ignore */
  }
  return null
}

function persist(entry: StoredLocation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
  } catch {
    /* ignore */
  }
}

/* ---------- Favoriten ---------- */

function loadFavorites(): GeoLocation[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as GeoLocation[]
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (l) => typeof l?.latitude === 'number' && typeof l?.longitude === 'number',
      )
    }
  } catch {
    /* ignore */
  }
  return []
}

function persistFavorites(list: GeoLocation[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

/** Schlüssel für Favoriten-Dedup (auf 2 Nachkommastellen gerundet). */
function favKey(loc: GeoLocation): string {
  return `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`
}

/** Typprüfung für externe Favoriten (z.B. aus Backup-Import). */
function isValidFav(loc: unknown): loc is GeoLocation {
  if (!loc || typeof loc !== 'object') return false
  const o = loc as Record<string, unknown>
  return typeof o.latitude === 'number' && typeof o.longitude === 'number'
}

export interface UseLocationResult {
  location: GeoLocation | null
  source: LocationSource | null
  isLoading: boolean
  error: string | null
  favorites: GeoLocation[]
  /** Ist der aktuelle Standort ein Favorit? */
  isCurrentFavorite: boolean
  /** Holt den Standort über GPS. */
  requestGps: () => Promise<void>
  /** Setzt einen manuell ausgewählten (per Adresse) Standort. */
  setManual: (loc: GeoLocation) => void
  /** Fügt aktuellen Standort zu Favoriten hinzu / entfernt ihn. */
  toggleFavorite: () => void
  /** Ersetzt die Favoriten-Liste komplett (für Daten-Import). */
  setFavorites: (list: GeoLocation[]) => void
  /** Fehlertext aufräumen. */
  clearError: () => void
}

/**
 * Verwaltet den App-Standort: GPS, manuelle Auswahl, Favoriten, URL-Param.
 * Persistiert in localStorage und hält die URL-Parameter aktuell.
 */
export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<GeoLocation | null>(null)
  const [source, setSource] = useState<LocationSource | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavoritesState] = useState<GeoLocation[]>([])
  const reverseInFlight = useRef(false)
  // Sequenz-Token: schützt apply() davor, dass ein veralteter (asynchroner)
  // Aufruf den State nach einer neueren Auswahl überschreibt.
  const applySeq = useRef(0)

  // Initial: URL-Param (höchste Priorität) > gespeicherter Standort.
  useEffect(() => {
    const url = readUrlParams()
    if (url.latitude !== undefined && url.longitude !== undefined) {
      const urlLoc: GeoLocation = {
        latitude: url.latitude,
        longitude: url.longitude,
        label: url.label,
      }
      setLocation(urlLoc)
      setSource('saved')
      return
    }
    const saved = loadSaved()
    if (saved) {
      setLocation(saved.location)
      setSource('saved')
    }
  }, [])

  // Favoriten laden.
  useEffect(() => {
    setFavoritesState(loadFavorites())
  }, [])

  const apply = useCallback(
    async (loc: GeoLocation, src: LocationSource, lookupLabel: boolean) => {
      // Neue Sequenz – nachfolgende Aufrufe invalidieren diesen.
      const seq = ++applySeq.current
      let withLabel = loc
      if (lookupLabel && !loc.label && !reverseInFlight.current) {
        reverseInFlight.current = true
        try {
          const label = await reverseGeocode(loc)
          withLabel = { ...loc, label }
        } catch {
          withLabel = loc
        } finally {
          reverseInFlight.current = false
        }
      }
      // Veralteter Aufruf (zwischenzeitlich wurde eine neuere Auswahl
      // getätigt) → State/URL nicht überschreiben.
      if (seq !== applySeq.current) return
      setLocation(withLabel)
      setSource(src)
      persist({ location: withLabel, source: src })
      // Nur den Standort in die URL schreiben, Sprache unangetastet lassen.
      writeUrlParams(withLabel, undefined)
    },
    [],
  )

  const locationRef = useRef<GeoLocation | null>(null)
  locationRef.current = location

  const requestGps = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const pos = await getCurrentPosition(true)
      await apply(pos, 'gps', true)
    } catch (e) {
      if (e instanceof GeoError) {
        setError(e.code)
        // IP-Fallback nur bei verweigertem/nicht verfügbarem GPS und wenn
        // noch gar kein Standort vorhanden ist (sonst stört es nicht).
        if ((e.code === 'denied' || e.code === 'unavailable') && !locationRef.current) {
          try {
            const ipLoc = await getIpLocation()
            await apply(ipLoc, 'address', false)
            setError('ip-fallback')
          } catch {
            // IP-Fallback auch fehlgeschlagen → Fehlercode bleibt erhalten.
          }
        }
      } else {
        setError('error')
      }
    } finally {
      setIsLoading(false)
    }
  }, [apply])

  const setManual = useCallback(
    (loc: GeoLocation) => {
      setError(null)
      // Adresse kommt bereits mit Label aus der Suche.
      void apply(loc, 'address', false)
    },
    [apply],
  )

  const toggleFavorite = useCallback(() => {
    if (!location) return
    const cur = location
    setFavoritesState((prev) => {
      const key = favKey(cur)
      const exists = prev.some((f) => favKey(f) === key)
      let next: GeoLocation[]
      if (exists) {
        next = prev.filter((f) => favKey(f) !== key)
      } else {
        // Label sichern (ggf. nachträglich per Reverse-Geocoding).
        const entry: GeoLocation = {
          latitude: cur.latitude,
          longitude: cur.longitude,
          label: cur.label,
        }
        next = [...prev, entry]
        // Wenn kein Label vorhanden, asynchron nachladen.
        if (!entry.label && !reverseInFlight.current) {
          reverseInFlight.current = true
          reverseGeocode(cur)
            .then((label) =>
              setFavoritesState((p) => {
                const next = p.map((f) => (favKey(f) === key ? { ...f, label } : f))
                persistFavorites(next)
                return next
              }),
            )
            .catch(() => undefined)
            .finally(() => {
              reverseInFlight.current = false
            })
        }
      }
      persistFavorites(next)
      return next
    })
  }, [location])

  /** Ersetzt die Favoriten-Liste komplett + persistiert. Für Daten-Import. */
  const setFavorites = useCallback((list: GeoLocation[]) => {
    const next = Array.isArray(list) ? list.filter(isValidFav) : []
    setFavoritesState(next)
    persistFavorites(next)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const isCurrentFavorite = location
    ? favorites.some((f) => favKey(f) === favKey(location))
    : false

  return {
    location,
    source,
    isLoading,
    error,
    favorites,
    isCurrentFavorite,
    requestGps,
    setManual,
    toggleFavorite,
    setFavorites,
    clearError,
  }
}
