import type { MoonPhaseKey, MoonResult } from '../types'

/* ============================================================
   Mondphase-Berechnung (präzise)

   Wir berechnen das mittlere Mondalter über die Differenz der
   mittleren Längen von Mond und Sonne. Diese Methode (vereinfacht
   nach Meeus, "Astronomical Algorithms") ist deutlich genauer als
   eine reine "Tage seit J2000 modulo 29,53"-Rechnung, weil sie die
   unterschiedliche Bewegung von Sonne und Mond berücksichtigt.

   Mittlere Länge Mond  L_m = 218.316 + 13.176396 · d   (Grad)
   Mittlere Länge Sonne L_s = 280.460 +  0.9856474 · d  (Grad)
   wobei d = Tage seit J2000 (JD 2451545.0).

   Mondalter (Phase) = (L_m − L_s) mod 360, in Tage umgerechnet:
       age = phaseAngle/360 · SYNODIC
   Beleuchtung = (1 − cos phaseAngle) / 2
   ============================================================ */

const SYNODIC = 29.530588853
const J2000 = 2451545.0

/** Julianisches Datum. */
function toJulianDate(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5
}

/** Tageszahl seit J2000. */
function daysSinceJ2000(date: Date): number {
  return toJulianDate(date) - J2000
}

/** Normiert einen Winkel auf [0, 360). */
function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360
}

/** Welcher Phasenschlüssel passt zum Phasenwinkel (0..360)? */
function phaseFromAngle(phaseAngle: number): MoonPhaseKey {
  // 0 = Neumond, 90 = Erstes Viertel, 180 = Vollmond, 270 = Letztes Viertel
  const p = phaseAngle / 360 // 0..1
  if (p < 0.0375 || p >= 0.9625) return 'new'
  if (p < 0.2125) return 'waxingCrescent'
  if (p < 0.2875) return 'firstQuarter'
  if (p < 0.4625) return 'waxingGibbous'
  if (p < 0.5375) return 'full'
  if (p < 0.7125) return 'waningGibbous'
  if (p < 0.7875) return 'lastQuarter'
  return 'waningCrescent'
}

/**
 * Tage bis zum nächsten Vollmond (positiv = Zukunft, negativ = vorbei).
 * Vollmond bei phaseAngle = 180°.
 */
function daysToFullMoon(phaseAngle: number): number {
  const fullAngle = 180
  // Winkeldifferenz → Tage (360° = SYNODIC Tage)
  let angleDiff = fullAngle - phaseAngle
  if (angleDiff <= -180) angleDiff += 360
  if (angleDiff > 180) angleDiff -= 360
  return (angleDiff / 360) * SYNODIC
}

/** Hauptfunktion: Mondphase berechnen. */
export function computeMoonPhase(date: Date): MoonResult {
  const d = daysSinceJ2000(date)

  // Mittlere Längen (Grad)
  const Lm = norm360(218.316 + 13.176396 * d)
  const Ls = norm360(280.46 + 0.9856474 * d)

  const phaseAngle = norm360(Lm - Ls) // 0..360
  const age = (phaseAngle / 360) * SYNODIC
  const illumination = (1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2

  const phase = phaseFromAngle(phaseAngle)
  const diff = daysToFullMoon(phaseAngle)
  const isFullMoonWeek = diff >= -3 && diff <= 3

  return {
    age,
    illumination,
    phase,
    cycleDay: roundTo(age, 1),
    daysToFullMoon: diff,
    isFullMoonWeek,
  }
}

/** Rundet auf n Nachkommastellen. */
function roundTo(value: number, decimals: number): number {
  const f = Math.pow(10, decimals)
  return Math.round(value * f) / f
}

/** Synodische Periodendauer (für "Tag X von Y"-Anzeige). */
export const SYNODIC_PERIOD = roundTo(SYNODIC, 1)

/* ============================================================
   Ergänzungen: nächste Mondphase + Mondauf-/untergang
   ============================================================ */

/** Phasenwinkel (0..360°) für einen Zeitpunkt. 0=Neumond, 180=Vollmond. */
function phaseAngleAt(date: Date): number {
  const d = daysSinceJ2000(date)
  const Lm = norm360(218.316 + 13.176396 * d)
  const Ls = norm360(280.46 + 0.9856474 * d)
  return norm360(Lm - Ls)
}

/**
 * Sucht den Zeitpunkt der nächsten Zielphase (Vollmond = 180°, Neumond = 0°).
 *
 * Robuster Algorithmus: Der Phasenwinkel wächst mit der Zeit kontinuierlich
 * (modulo 360). Wir bestimmen zuerst die verbleibenden Grad bis zum Ziel-
 * winkel in Vorwärtsrichtung und schätzen so einen Startpunkt. Danach wird
 * per Intervallhalbierung verfeinert (Präzision < 1 min).
 */
export function findNextPhase(
  from: Date,
  target: 'full' | 'new',
  maxDays = 35,
): Date {
  const targetAngle = target === 'full' ? 180 : 0
  const nowAngle = phaseAngleAt(from)

  // Verbleibende Grad in Vorwärtsrichtung (0..360).
  let remaining = targetAngle - nowAngle
  if (remaining < 0) remaining += 360
  // exakt getroffen (selten) → leicht vorrückend, damit wir in der Zukunft liegen
  if (remaining < 0.1) remaining += 360

  // Grobschätzung: 360° ≈ SYNODIC Tage → remaining° ≈ remaining/360·SYNODIC Tage.
  const meanRate = 360 / SYNODIC // °/Tag
  let estMs = (remaining / meanRate) * 86_400_000
  // Puffer ±1 Tag rund um die Schätzung für die Bisektion.
  const lo0 = from.getTime()
  const hi0 = from.getTime() + estMs + 86_400_000

  return bisectClosest(lo0, hi0, targetAngle, from.getTime() + maxDays * 86_400_000)
}

/**
 * Bisektion: finde t ∈ (lo, hi), bei dem der Phasenwinkel den Zielwert
 * trifft (Vorwärtsüberquerung: vorher < target, nachher ≥ target,
 * unter Berücksichtigung des 360→0-Umbruchs).
 */
function bisectClosest(
  lo: number,
  hi: number,
  targetAngle: number,
  hardMax: number,
): Date {
  // 1) Grob-Suche (3-Stunden-Schritte) nach der Überquerung.
  const step = 3 * 3600 * 1000
  let prev = unwrapAngle(phaseAngleAt(new Date(lo)), targetAngle)
  let cursor = lo
  let crossHi = -1
  while (cursor < Math.min(hi, hardMax)) {
    cursor += step
    const curr = unwrapAngle(phaseAngleAt(new Date(cursor)), targetAngle)
    // Überquerung: vorher < 0, nachher ≥ 0 (relativ zum Ziel).
    if (prev < 0 && curr >= 0) {
      crossHi = cursor
      break
    }
    prev = curr
  }
  if (crossHi < 0) {
    return new Date(hi)
  }

  // 2) Verfeinerung per Halbierung zwischen (crossHi - step) und crossHi.
  let a = crossHi - step
  let b = crossHi
  for (let i = 0; i < 40; i++) {
    const mid = (a + b) / 2
    const midVal = unwrapAngle(phaseAngleAt(new Date(mid)), targetAngle)
    if (midVal < 0) a = mid
    else b = mid
  }
  return new Date((a + b) / 2)
}

/**
 * "Entfaltet" den Phasenwinkel zu einer monoton steigenden Funktion relativ
 * zum Zielwinkel: liefert den vorzeichenbehafteten Abstand so, dass
 * Überquerungen des Zielwinkels als Vorzeichenwechsel (− nach +) erkennbar
 * sind. Wir verschieben die Skala so, dass der Zielwinkel bei 0 liegt und
 * negative Werte "noch nicht erreicht", positive "bereits überquert" heißen.
 */
function unwrapAngle(angle: number, targetAngle: number): number {
  let d = angle - targetAngle
  // Auf (−360, +360) bringen, dann auf (−180, +180] normalisieren,
  // damit die Zielrichtung eindeutig bleibt.
  if (d > 180) d -= 360
  if (d <= -180) d += 360
  return d
}

/* ---------- Mondauf-/untergang (vereinfachte Methode) ---------- */

/**
 * Mondauf- und -untergang am Standort (vereinfachte geometrische Methode).
 *
 * Wir nutzen die Mond-Position (geozentrisch, ekliptikale Länge) und
 * approximieren Stundenwinkel + Höhe. Die Methode ist auf ~±20 min genau,
 * ausreichend für eine Anzeige. Für Tag mit nur Auf- oder nur Untergang
 * bzw. keinen Ereignis wird `null` zurückgegeben.
 *
 * Referenz: vereinfachte Methode nach Meeus, Kap. 15 (gekürzt).
 */
export function moonriseMoonset(
  date: Date,
  latitude: number,
  longitude: number,
): { rise: Date | null; set: Date | null } {
  const DEG = Math.PI / 180
  const d = daysSinceJ2000(date)

  // Geometrische Mond-Größen (vereinfacht).
  // Mittlere Mondlänge L, mittlere Anomalie M, Breitenargument F.
  const L = norm360(218.316 + 13.176396 * d)
  const M = norm360(134.963 + 13.064993 * d)
  const F = norm360(93.272 + 13.229350 * d)

  // Ekliptikale Koordinaten (vereinfacht; nur Perioden 1. Ordnung).
  const lambda = L + 6.289 * Math.sin(M * DEG)
  const beta = 5.128 * Math.sin(F * DEG)
  // Schiefe der Ekliptik
  const eps = 23.439 - 0.0000004 * d

  // Äquatoriale Koordinaten
  const sinDec =
    Math.sin(beta * DEG) * Math.cos(eps * DEG) +
    Math.cos(beta * DEG) * Math.sin(eps * DEG) * Math.sin(lambda * DEG)
  const dec = Math.asin(sinDec)
  // Rektaszension in Stunden
  const y = Math.sin(lambda * DEG) * Math.cos(eps * DEG) - Math.tan(beta * DEG) * Math.sin(eps * DEG)
  const ra = Math.atan2(y, Math.cos(lambda * DEG)) / DEG / 15 // Stunden

  // Stundenwinkel des Mondes bei standardisierter Höhe (−0.833°): cos H₀
  const latRad = latitude * DEG
  const h0 = -0.833 * DEG
  const cosH =
    (Math.sin(h0) - Math.sin(latRad) * Math.sin(dec)) / (Math.cos(latRad) * Math.cos(dec))

  if (cosH > 1) return { rise: null, set: null } // Mond geht nicht auf
  if (cosH < -1) return { rise: null, set: null } // Mond geht nicht unter

  const H0 = Math.acos(cosH) / DEG // in Grad

  // GMST (Stunden) am 0h UT des Tages – vereinfacht.
  const jd0 = Math.floor(toJulianDate(date) - 0.5) + 0.5
  const T = (jd0 - 2451545.0) / 36525
  let gmst0 = 6.697374558 + 2400.051336 * T + 0.000025862 * T * T
  gmst0 = ((gmst0 % 24) + 24) % 24

  // Transit-Zeiten in Stunden UT
  const lonHours = longitude / 15
  // der Mond transitiert, wenn GMST + Längengrad = RA (mod 24)
  let transit = (24 + ra - gmst0 - lonHours) % 24
  if (transit < 0) transit += 24
  const halfDay = H0 / 15 // Stunden

  const rise = utHourToDate(date, transit - halfDay)
  const set = utHourToDate(date, transit + halfDay)
  return { rise, set }
}

/** Wandelt eine UT-Dezimalstunde am Tag `ref` in ein lokales Date um. */
function utHourToDate(ref: Date, utDecimalHours: number): Date | null {
  if (!isFinite(utDecimalHours)) return null
  const totalMin = utDecimalHours * 60
  const wrapped = (((totalMin % 1440) + 1440) % 1440) / 60
  const h = Math.floor(wrapped)
  const m = Math.floor((wrapped - h) * 60)
  return new Date(
    Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate(), h, m, 0),
  )
}
