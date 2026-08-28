import type { SolarTimeResult } from '../types'

/* ============================================================
   Berechnung der wahren Sonnenzeit (True Solar Time)
   und von Sonnenauf-/untergang nach Standardformeln.

   Quellen / Referenzen:
   - Equation of Time (Spencer/Whitman-Näherung):
       B = 360°/365 · (N − 81)        (N = Tag des Jahres)
       EoT = 9.87·sin(2B) − 7.53·cos(B) − 1.5·sin(B)   [Minuten]
   - True Solar Time:
       TST = UTC(min) + 4·Längengrad + EoT   (modulo 1440)
     (4 min pro Längengrad → Erde dreht sich 360°/24h)
   - Sonnenauf-/untergang (NOAA-Näherung):
       Deklination δ = 23.45°·sin(360°/365·(N + 284))
       Stundenwinkel H₀ = arccos(−tan φ · tan δ)
   ============================================================ */

const DEG = Math.PI / 180

/** Tag des Jahres (1–366) als kontinuierlicher Fließkommawert für stufenlose Zeitgleichung. */
export function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const diff = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  )
  return (diff - start) / 86_400_000
}

/**
 * Gleichung der Zeit (Equation of Time) in Minuten.
 * Positive Werte: die Sonne ist der mittleren Zeit voraus.
 */
export function equationOfTime(N: number): number {
  const B = ((360 / 365) * (N - 81)) * DEG
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)
}

/** Liefert die wahre Sonnenzeit (TST) in Minuten seit lokaler Mitternacht. */
export function trueSolarMinutes(
  date: Date,
  longitude: number,
  eotMin: number,
): number {
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60
  // 4 min pro Längengrad ab UTC-Mittag (Greenwich).
  const tst = utcMinutes + 4 * longitude + eotMin
  return ((tst % 1440) + 1440) % 1440
}

/** Sonnendeklination in Grad (NOAA-Näherung). */
function declination(N: number): number {
  return 23.45 * Math.sin(((360 / 365) * (N + 284)) * DEG)
}

/** Zeitgleichungs-Korrektur (EoT) als Verschiebung in Stunden für Auf-/Untergang. */
function timeEquationHours(N: number): number {
  return equationOfTime(N) / 60
}

/** Berechnet Sonnenaufgang, -untergang und Sonnenmittag (lokale Uhrzeit). */
function sunTimes(
  date: Date,
  latitude: number,
  longitude: number,
  N: number,
): {
  sunrise: Date | null
  sunset: Date | null
  solarNoon: Date | null
  polarStatus: 'polarDay' | 'polarNight' | null
} {
  const lat = latitude * DEG
  const decl = declination(N) * DEG
  const h0 = -0.833 * DEG // Standard-Refraktion (-34') & Sonnenhalbmesser (-16') nach NOAA

  // Stundenwinkel cos H₀ = (sin h₀ − sin φ sin δ) / (cos φ cos δ)
  const cosH = (Math.sin(h0) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl))

  let sunrise: Date | null = null
  let sunset: Date | null = null
  let polarStatus: 'polarDay' | 'polarNight' | null = null

  if (cosH > 1) {
    // Polarnacht: Sonne geht nicht auf.
    polarStatus = 'polarNight'
  } else if (cosH < -1) {
    // Polartag: Sonne geht nicht unter.
    polarStatus = 'polarDay'
  } else {
    const H0 = Math.acos(cosH) / DEG // in Grad
    // Sonnenmittag in UTC-Stunden = 12 − Längengrad/15 − EoT(h)
    const eqH = timeEquationHours(N)
    const noonUtc = 12 - longitude / 15 - eqH
    const halfDay = H0 / 15 // Stunden

    sunrise = makeLocalDate(date, noonUtc - halfDay)
    sunset = makeLocalDate(date, noonUtc + halfDay)
  }

  // Sonnenmittag als lokale Uhrzeit (true solar noon → wall clock).
  const eqH = timeEquationHours(N)
  const noonUtc = 12 - longitude / 15 - eqH
  const solarNoon = makeLocalDate(date, noonUtc)

  return { sunrise, sunset, solarNoon, polarStatus }
}

/**
 * Wandelt eine UTC-Dezimalstunde am Tag `ref` in ein lokales Date um,
 * angepasst um den lokalen Zeitzonen-Offset des Browsers/Standorts.
 */
function makeLocalDate(ref: Date, utcDecimalHours: number): Date {
  const tzOffsetMin = ref.getTimezoneOffset()
  const localDecimalHours = utcDecimalHours - tzOffsetMin / 60
  const totalMin = localDecimalHours * 60
  const wrappedMin = ((totalMin % 1440) + 1440) % 1440
  const h = Math.floor(wrappedMin / 60)
  const m = Math.floor(wrappedMin % 60)
  return new Date(
    Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate(), h, m, 0),
  )
}

/**
 * Hauptfunktion: berechnet die wahre Sonnenzeit und Begleitwerte.
 */
export function computeSolarTime(date: Date, latitude: number, longitude: number): SolarTimeResult {
  const N = dayOfYear(date)
  const eot = equationOfTime(N)
  const tstMin = trueSolarMinutes(date, longitude, eot)

  // TST in Stunden (mit Nachkommastellen für die analoge Uhr).
  const trueSolarHours = tstMin / 60

  // "trueSolarDate" als Hülle für die Formatierung (HH:MM:SS der TST).
  const hours = Math.floor(trueSolarHours)
  const minutes = Math.floor((trueSolarHours - hours) * 60)
  const seconds = Math.floor((((trueSolarHours - hours) * 60) - minutes) * 60)
  const trueSolarDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes, seconds),
  )

  const { sunrise, sunset, solarNoon, polarStatus } = sunTimes(date, latitude, longitude, N)

  // Längengrad-Korrektur (4 min/°, bezogen auf UTC-Mittag).
  // Dargestellt wird der reine Längengrad-Beitrag.
  const longitudeCorrection = 4 * longitude

  return {
    trueSolarDate,
    trueSolarHours,
    equationOfTime: eot,
    longitudeCorrection,
    sunrise,
    sunset,
    solarNoon,
    polarStatus,
    dayOfYear: Math.floor(N),
  }
}

/* ---------- Format-Helfer ---------- */

/** Formatiert ein Date als HH:MM:SS (24h), interpretiert dessen UTC-Felder. */
export function formatHMS(d: Date | null): string {
  if (!d) return '—'
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  const s = String(d.getUTCSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

/** Formatiert ein Date als HH:MM. */
export function formatHM(d: Date | null): string {
  if (!d) return '—'
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

/** Formatiert die Längengrad-Korrektur mit Vorzeichen. */
export function formatSignedMinutes(min: number): string {
  const sign = min >= 0 ? '+' : '−'
  return `${sign}${Math.abs(min).toFixed(1)} min`
}

/* ============================================================
   Sonnen-Tagesbogen: Höhenwinkel, Azimut, Dämmerung & Goldene Stunde

   Formeln (NOAA / Standard-Sphäre):
     Stundenwinkel  H = 15° · (TST_h − 12)
     Deklination    δ = 23.45° · sin(360°/365 · (N + 284))
     Höhe           sin h = sin φ·sin δ + cos φ·cos δ·cos H
     Azimut (S=0)   cos A = (sin δ − sin φ·sin h) / (cos φ·cos h)
   ============================================================ */

/** Sonnendeklination in Grad (öffentlich, für externe Nutzung). */
export function solarDeclination(N: number): number {
  return declination(N)
}

/**
 * Sonnenhöhe (Elevation) in Grad für einen Zeitpunkt am Standort.
 * Negativ = Sonne unter dem Horizont.
 */
export function solarElevation(date: Date, latitude: number, longitude: number): number {
  const N = dayOfYear(date)
  const eot = equationOfTime(N)
  const tstMin = trueSolarMinutes(date, longitude, eot)
  const tstHours = tstMin / 60
  const H = (15 * (tstHours - 12)) * DEG // Stundenwinkel im Bogenmaß
  const dec = declination(N) * DEG
  const lat = latitude * DEG
  const sinh = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H)
  return (Math.asin(sinh) / DEG)
}

/**
 * Sonnenazimut in Grad (0 = Nord, im Uhrzeigersinn).
 */
export function solarAzimuth(date: Date, latitude: number, longitude: number): number {
  const N = dayOfYear(date)
  const eot = equationOfTime(N)
  const tstHours = trueSolarMinutes(date, longitude, eot) / 60
  const H = (15 * (tstHours - 12)) * DEG
  const dec = declination(N) * DEG
  const lat = latitude * DEG
  const sinh = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H)
  const h = Math.asin(sinh)
  const cosA = (Math.sin(dec) - Math.sin(lat) * Math.sin(h)) / (Math.cos(lat) * Math.cos(h))
  let az = Math.acos(Math.max(-1, Math.min(1, cosA))) / DEG
  // Azimut-Vorzeichen: vormittags (H<0) im Osten → 360−A, nachmittags (H>0) im Westen → A
  if (H < 0) az = 360 - az
  return az
}

/** Zeitpunkt, an dem die Sonne eine bestimmte Höhe (Grad) erreicht (lokale Uhrzeit).
 *  Liefert Aufstieg (rise) bzw. Untergang (set) des Höhenwerts am Tag `date`. */
function timeAtElevation(
  date: Date,
  latitude: number,
  longitude: number,
  N: number,
  targetElevationDeg: number,
): { rise: Date | null; set: Date | null } {
  const lat = latitude * DEG
  const dec = declination(N) * DEG
  const target = targetElevationDeg * DEG
  // Stundenwinkel bei der Zielhöhe: cos H = (sin h − sin φ sin δ) / (cos φ cos δ)
  const cosH = (Math.sin(target) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec))
  if (cosH > 1 || cosH < -1) {
    // Zielhöhe wird an diesem Tag nie erreicht (oder immer).
    return { rise: null, set: null }
  }
  const H0 = Math.acos(cosH) / DEG
  const eqH = timeEquationHours(N)
  const noonUtc = 12 - longitude / 15 - eqH
  return {
    rise: makeLocalDate(date, noonUtc - H0 / 15),
    set: makeLocalDate(date, noonUtc + H0 / 15),
  }
}

/** Dämmerungs- und Goldene-Stunde-Zeiten eines Tages. */
export function twilightTimes(
  date: Date,
  latitude: number,
  longitude: number,
): {
  astronomicalDawn: Date | null
  nauticalDawn: Date | null
  civilDawn: Date | null
  sunrise: Date | null
  goldenEndMorning: Date | null
  goldenStartEvening: Date | null
  sunset: Date | null
  civilDusk: Date | null
  nauticalDusk: Date | null
  astronomicalDusk: Date | null
} {
  const N = dayOfYear(date)
  const astro = timeAtElevation(date, latitude, longitude, N, -18)
  const nautical = timeAtElevation(date, latitude, longitude, N, -12)
  const civil = timeAtElevation(date, latitude, longitude, N, -6)
  const sun = timeAtElevation(date, latitude, longitude, N, -0.833)
  const goldenM = timeAtElevation(date, latitude, longitude, N, 6)
  // Goldene Stunde endet vormittags bei +6°, beginnt abends wieder bei +6°.
  // Für die Abend-Goldene-Stunde nehmen wir die "set"-Zeit der +6°-Höhe.
  return {
    astronomicalDawn: astro.rise,
    nauticalDawn: nautical.rise,
    civilDawn: civil.rise,
    sunrise: sun.rise,
    goldenEndMorning: goldenM.rise,
    goldenStartEvening: goldenM.set,
    sunset: sun.set,
    civilDusk: civil.set,
    nauticalDusk: nautical.set,
    astronomicalDusk: astro.set,
  }
}
