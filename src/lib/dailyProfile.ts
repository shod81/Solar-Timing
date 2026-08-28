import type { MoonResult, OrganSlot } from '../types'
import { computeSolarTime } from './solarTime'
import { getActiveSlot } from './organClock'
import { computePlanetaryHour, type PlanetKey, type PlanetaryHourResult } from './planetaryHours'
import { computeMoonPhase } from './moonPhase'

/* ============================================================
   Tagesprofil: Synthese aus Organuhr, Planetenstunde und
   Mondphase zu einer kontextbezogenen Empfehlung.

   Strategie: Statt einer riesigen 12×7-Kreuzungsmatrix (84 Keys)
   kombinieren wir zwei unabhängige, gut wartbare Quellen:
     1. Organ-spezifischer Tipp aus t.organDetails[organ].activities[0]
        – lokalisiert, bereits vorhanden, spezifisch für das Fenster.
     2. Planeten-Qualität aus t.planetProfile[planetKey]
        – eine kurze Charakteristik pro Planet (7 Keys statt 84).
   Beide werden in der Karte kombiniert dargestellt. Zudem gibt es
   einen Vollmond-Boost-Hinweis (boolean), falls isFullMoonWeek.
   ============================================================ */

export interface DailyProfileResult {
  /** Aktives Organ-Fenster (TCM). */
  organ: OrganSlot
  /** Aktive Planetenstunde (null bei Polartag/-nacht). */
  planet: PlanetaryHourResult | null
  /** Aktuelle Mondphase. */
  moon: MoonResult
  /** Liegt der Zeitpunkt in der Vollmondwoche (Energie-Boost)? */
  moonBoost: boolean
  /** i18n-Key für die planetare Qualitäts-Aussage. */
  planetProfileKey: string | null
  /** Wahre Sonnenzeit in Stunden (für Synthese-Satz). */
  trueSolarHours: number
}

/** Die 7 Planeten-Keys in kanonischer Reihenfolge. */
export const PLANET_KEYS: readonly PlanetKey[] = [
  'sun',
  'moon',
  'mars',
  'mercury',
  'jupiter',
  'venus',
  'saturn',
]

/**
 * Berechnet das Tagesprofil am Standort für einen Zeitpunkt.
 * Liefert immer ein Ergebnis (planet kann null sein bei Polartag/-nacht).
 */
export function computeDailyProfile(
  date: Date,
  latitude: number,
  longitude: number,
): DailyProfileResult {
  const solar = computeSolarTime(date, latitude, longitude)
  const organ = getActiveSlot(Math.floor(((solar.trueSolarHours % 24) + 24) % 24))
  const planet = computePlanetaryHour(date, latitude, longitude)
  const moon = computeMoonPhase(date)

  return {
    organ,
    planet,
    moon,
    moonBoost: moon.isFullMoonWeek,
    // i18n-Key der Form 'planetProfileSun' … 'planetProfileSaturn'.
    planetProfileKey: planet ? `planetProfile${capitalize(planet.planet.key)}` : null,
    trueSolarHours: solar.trueSolarHours,
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
