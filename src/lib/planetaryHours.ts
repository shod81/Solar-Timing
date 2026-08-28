import { computeSolarTime } from './solarTime'

export type PlanetKey = 'saturn' | 'jupiter' | 'mars' | 'sun' | 'venus' | 'mercury' | 'moon'

export interface PlanetInfo {
  key: PlanetKey
  symbol: string
  nameKey: string
  color: string
}

export const PLANETS: Record<PlanetKey, PlanetInfo> = {
  sun: { key: 'sun', symbol: '☉', nameKey: 'planetSun', color: '#ffb938' },
  venus: { key: 'venus', symbol: '♀', nameKey: 'planetVenus', color: '#e573a7' },
  mercury: { key: 'mercury', symbol: '☿', nameKey: 'planetMercury', color: '#64b5f6' },
  moon: { key: 'moon', symbol: '☽', nameKey: 'planetMoon', color: '#e0e0e0' },
  saturn: { key: 'saturn', symbol: '🪐', nameKey: 'planetSaturn', color: '#b0bec5' },
  jupiter: { key: 'jupiter', symbol: '♃', nameKey: 'planetJupiter', color: '#ba68c8' },
  mars: { key: 'mars', symbol: '♂', nameKey: 'planetMars', color: '#ef5350' },
}

/** Chaldäische Reihe (Saturn -> Jupiter -> Mars -> Sonne -> Venus -> Merkur -> Mond) */
const CHALDEAN_ORDER: PlanetKey[] = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon']

/** Tagesherrscher für Wochentage (0 = Sonntag ... 6 = Samstag) */
const DAY_RULERS: Record<number, PlanetKey> = {
  0: 'sun', // Sonntag -> Sonne
  1: 'moon', // Montag -> Mond
  2: 'mars', // Dienstag -> Mars
  3: 'mercury', // Mittwoch -> Merkur
  4: 'jupiter', // Donnerstag -> Jupiter
  5: 'venus', // Freitag -> Venus
  6: 'saturn', // Samstag -> Saturn
}

export interface PlanetaryHourResult {
  planet: PlanetInfo
  dayRuler: PlanetInfo
  isDayHour: boolean
  hourNumber: number // 1 bis 12 (Tagstunde oder Nachtstunde)
  startTime: Date
  endTime: Date
  progressPercent: number
}

/**
 * Berechnet die aktuelle Planetenstunde am Standort nach der traditionellen chaldäischen Methode.
 */
export function computePlanetaryHour(
  date: Date,
  latitude: number,
  longitude: number,
): PlanetaryHourResult | null {
  const solarToday = computeSolarTime(date, latitude, longitude)
  if (!solarToday.sunrise || !solarToday.sunset) {
    // Bei Polartag/Polarnacht ohne Sonnenaufgang nicht definiert
    return null
  }

  const nowMs = date.getTime()
  const todaySunriseMs = solarToday.sunrise.getTime()
  const todaySunsetMs = solarToday.sunset.getTime()

  // Gestern und Morgen für Nachtstunden-Verschachtelung
  const yesterday = new Date(date.getTime() - 86_400_000)
  const tomorrow = new Date(date.getTime() + 86_400_000)
  const solarYesterday = computeSolarTime(yesterday, latitude, longitude)
  const solarTomorrow = computeSolarTime(tomorrow, latitude, longitude)

  let isDayHour = false
  let hourNumber = 1
  let startTimeMs = 0
  let endTimeMs = 0
  let dayRulerKey: PlanetKey = 'sun'
  let planetIndex = 0

  if (nowMs >= todaySunriseMs && nowMs < todaySunsetMs) {
    // 1. TAGSTUNDE (Sonnenaufgang bis Sonnenuntergang)
    isDayHour = true
    const dayDuration = todaySunsetMs - todaySunriseMs
    const hourLength = dayDuration / 12
    const elapsed = nowMs - todaySunriseMs
    hourNumber = Math.min(12, Math.floor(elapsed / hourLength) + 1)
    startTimeMs = todaySunriseMs + (hourNumber - 1) * hourLength
    endTimeMs = startTimeMs + hourLength

    dayRulerKey = DAY_RULERS[date.getDay()]
    const rulerIdx = CHALDEAN_ORDER.indexOf(dayRulerKey)
    planetIndex = (rulerIdx + (hourNumber - 1)) % 7
  } else if (nowMs >= todaySunsetMs) {
    // 2. NACHTSTUNDE (heute Sonnenuntergang bis morgen Sonnenaufgang)
    isDayHour = false
    const nextSunriseMs = solarTomorrow.sunrise ? solarTomorrow.sunrise.getTime() : todaySunsetMs + 43_200_000
    const nightDuration = nextSunriseMs - todaySunsetMs
    const hourLength = nightDuration / 12
    const elapsed = nowMs - todaySunsetMs
    hourNumber = Math.min(12, Math.floor(elapsed / hourLength) + 1)
    startTimeMs = todaySunsetMs + (hourNumber - 1) * hourLength
    endTimeMs = startTimeMs + hourLength

    dayRulerKey = DAY_RULERS[date.getDay()]
    const rulerIdx = CHALDEAN_ORDER.indexOf(dayRulerKey)
    planetIndex = (rulerIdx + 12 + (hourNumber - 1)) % 7
  } else {
    // 3. NACHTSTUNDE VOR SONNENAUFGANG (gestern Sonnenuntergang bis heute Sonnenaufgang)
    isDayHour = false
    const prevSunsetMs = solarYesterday.sunset ? solarYesterday.sunset.getTime() : todaySunriseMs - 43_200_000
    const nightDuration = todaySunriseMs - prevSunsetMs
    const hourLength = nightDuration / 12
    const elapsed = nowMs - prevSunsetMs
    hourNumber = Math.min(12, Math.floor(elapsed / hourLength) + 1)
    startTimeMs = prevSunsetMs + (hourNumber - 1) * hourLength
    endTimeMs = startTimeMs + hourLength

    const prevDay = (date.getDay() - 1 + 7) % 7
    dayRulerKey = DAY_RULERS[prevDay]
    const rulerIdx = CHALDEAN_ORDER.indexOf(dayRulerKey)
    planetIndex = (rulerIdx + 12 + (hourNumber - 1)) % 7
  }

  const activePlanetKey = CHALDEAN_ORDER[planetIndex]
  const durationTotal = endTimeMs - startTimeMs
  const elapsedCurrent = nowMs - startTimeMs
  const progressPercent = Math.max(0, Math.min(100, (elapsedCurrent / durationTotal) * 100))

  return {
    planet: PLANETS[activePlanetKey],
    dayRuler: PLANETS[dayRulerKey],
    isDayHour,
    hourNumber,
    startTime: new Date(startTimeMs),
    endTime: new Date(endTimeMs),
    progressPercent,
  }
}
