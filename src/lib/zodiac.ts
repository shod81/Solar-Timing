/** Westliche Astrologie-Elemente (nicht TCM!). */
export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water'

export type ZodiacKey =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces'

export interface ZodiacSignInfo {
  key: ZodiacKey
  symbol: string
  element: ZodiacElement
  color: string
}

export const ZODIAC_SIGNS: readonly ZodiacSignInfo[] = [
  { key: 'aries', symbol: '♈', element: 'fire', color: '#ff6b6b' },
  { key: 'taurus', symbol: '♉', element: 'earth', color: '#81c784' },
  { key: 'gemini', symbol: '♊', element: 'air', color: '#64b5f6' },
  { key: 'cancer', symbol: '♋', element: 'water', color: '#4dd0e1' },
  { key: 'leo', symbol: '♌', element: 'fire', color: '#ffb74d' },
  { key: 'virgo', symbol: '♍', element: 'earth', color: '#aed581' },
  { key: 'libra', symbol: '♎', element: 'air', color: '#ba68c8' },
  { key: 'scorpio', symbol: '♏', element: 'water', color: '#4db6ac' },
  { key: 'sagittarius', symbol: '♐', element: 'fire', color: '#ff8a65' },
  { key: 'capricorn', symbol: '♑', element: 'earth', color: '#90a4ae' },
  { key: 'aquarius', symbol: '♒', element: 'air', color: '#4fc3f7' },
  { key: 'pisces', symbol: '♓', element: 'water', color: '#7986cb' },
] as const

const DEG = Math.PI / 180
const J2000 = 2451545.0

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360
}

function toJulianDate(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5
}

function daysSinceJ2000(date: Date): number {
  return toJulianDate(date) - J2000
}

export interface ZodiacPosition {
  sign: ZodiacSignInfo
  degreeInSign: number // 0° .. 30°
  totalLongitude: number // 0° .. 360°
}

export interface ZodiacResult {
  sun: ZodiacPosition
  moon: ZodiacPosition
}

/**
 * Berechnet das Sonnenzeichen (Sternzeichen) und das Mondzeichen für ein bestimmtes Datum.
 */
export function computeZodiac(date: Date): ZodiacResult {
  const d = daysSinceJ2000(date)

  // 1. Wahre Sonnenlänge (mittlere Länge + Zentrumsgleichung 1. Ordnung)
  const Ls = norm360(280.46 + 0.9856474 * d)
  const Ms = norm360(357.529 + 0.9856003 * d)
  const C = 1.9148 * Math.sin(Ms * DEG) + 0.02 * Math.sin(2 * Ms * DEG)
  const sunLongitude = norm360(Ls + C)
  const sunSignIdx = Math.floor(sunLongitude / 30) % 12
  const sunDeg = Math.floor(sunLongitude % 30)

  // 2. Mondlänge (mit der groben Korrektur 1. Ordnung für die Mondbahn)
  const Lm = norm360(218.316 + 13.176396 * d)
  const Mm = norm360(134.963 + 13.064993 * d)
  const moonLongitude = norm360(Lm + 6.289 * Math.sin(Mm * DEG))
  const moonSignIdx = Math.floor(moonLongitude / 30) % 12
  const moonDeg = Math.floor(moonLongitude % 30)

  return {
    sun: {
      sign: ZODIAC_SIGNS[sunSignIdx],
      degreeInSign: sunDeg,
      totalLongitude: sunLongitude,
    },
    moon: {
      sign: ZODIAC_SIGNS[moonSignIdx],
      degreeInSign: moonDeg,
      totalLongitude: moonLongitude,
    },
  }
}
