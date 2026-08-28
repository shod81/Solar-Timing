import type { GeoLocation } from '../types'

/** Fehler-Typ für GPS-Probleme mit Schlüssel für i18n. */
export class GeoError extends Error {
  constructor(
    public readonly code: 'denied' | 'unavailable' | 'error',
    message: string,
  ) {
    super(message)
    this.name = 'GeoError'
  }
}

/**
 * Holt den aktuellen Standort über die Geolocation-API des Browsers.
 * Löst ein Promise mit {latitude, longitude} auf.
 */
export function getCurrentPosition(highAccuracy = true): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new GeoError('unavailable', 'Geolocation API not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new GeoError('denied', 'Permission denied'))
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          reject(new GeoError('unavailable', 'Position unavailable'))
        } else {
          reject(new GeoError('error', err.message || 'Geolocation error'))
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: 15000,
        maximumAge: 60000,
      },
    )
  })
}
