import { memo } from 'react'
import type { MoonPhaseKey } from '../types'
import { useI18n } from '../i18n/LanguageContext'

interface MoonGraphicProps {
  phase: MoonPhaseKey
  /** Beleuchteter Anteil 0..1. */
  illumination: number
  size?: number
  /** Ist aktuell Vollmondwoche (±3 Tage)? */
  isFullMoonWeek?: boolean
}

/**
 * Mond-Scheibe mit korrekt beleuchtetem Anteil.
 *
 * Geometrie: Die rechte Hälfte (bei wachsendem Mond) bzw. linke Hälfte
 * (bei abnehmendem Mond) ist die "Tagseite" der Scheibe. Der Terminator
 * (Grenzlinie hell/dunkel) ist eine Ellipse, deren Breite (x-Radius) von
 * der Beleuchtung abhängt: bei 0/100% illumination → r oder −r, bei 50% → 0.
 *
 * Die helle Sichel wird aus zwei Halbellipsen (Kreisbogen + Terminator)
 * zusammengesetzt.
 */
const MoonGraphic = memo(function MoonGraphic({
  phase,
  illumination,
  size = 120,
  isFullMoonWeek = false,
}: MoonGraphicProps) {
  const { t } = useI18n()
  const r = 50 // viewBox-Einheiten
  const cx = 50
  const cy = 50

  const lit = Math.max(0, Math.min(1, illumination))

  const isWaxing =
    phase === 'waxingCrescent' || phase === 'firstQuarter' || phase === 'waxingGibbous'
  const isFull = phase === 'full'
  const isNew = phase === 'new'

  // x-Radius der Terminator-Ellipse
  const rx = Math.abs(1 - 2 * lit) * r

  // Pfad für den beleuchteten Bereich.
  let litPath: string
  if (isFull || lit >= 0.995) {
    litPath = fullDiscPath(cx, cy, r)
  } else if (isNew || lit <= 0.005) {
    litPath = ''
  } else {
    // 1) Äußerer Halbkreis (Limb): Start oben (cx, cy-r) -> unten (cx, cy+r)
    //    Wachsend (isWaxing) -> rechter Halbkreis (sweep = 1)
    //    Abnehmend (!isWaxing) -> linker Halbkreis (sweep = 0)
    const outerSweep = isWaxing ? 1 : 0

    // 2) Terminator-Ellipse: Rückweg von unten (cx, cy+r) nach oben (cx, cy-r)
    //    Wachsend: lit < 0.5 ? 0 (Sichel rechts) : 1 (Bauch links)
    //    Abnehmend: lit < 0.5 ? 1 (Sichel links) : 0 (Bauch rechts)
    const termSweep = isWaxing ? (lit < 0.5 ? 0 : 1) : lit < 0.5 ? 1 : 0

    litPath = [
      `M ${cx} ${cy - r}`,
      `A ${r} ${r} 0 0 ${outerSweep} ${cx} ${cy + r}`,
      `A ${rx.toFixed(2)} ${r} 0 0 ${termSweep} ${cx} ${cy - r}`,
      'Z',
    ].join(' ')
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`moon-graphic ${isFullMoonWeek ? 'glowing-fullmoon' : ''}`}
      role="img"
      aria-label={t.ariaMoonGraphic
        .replace('{phase}', t.phases[phase] || phase)
        .replace('{lit}', String(Math.round(lit * 100)))}
    >
      <defs>
        <radialGradient id="mg-lit" cx="35%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#fff8e6" />
          <stop offset="60%" stopColor="#f1e4b6" />
          <stop offset="100%" stopColor="#cdb87e" />
        </radialGradient>
        <radialGradient id="mg-dark" cx="50%" cy="50%" r="62%">
          <stop offset="0%" stopColor="#1a2138" />
          <stop offset="100%" stopColor="#0a0f1e" />
        </radialGradient>
        <filter id="mg-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dunkle Scheibe (Hintergrund) */}
      <circle cx={cx} cy={cy} r={r} fill="url(#mg-dark)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />

      {/* Beleuchteter Bereich */}
      {litPath && (
        <path
          d={litPath}
          fill="url(#mg-lit)"
          className="moon-lit-path"
          filter={isFull ? 'url(#mg-glow)' : undefined}
        />
      )}
    </svg>
  )
})

/** Komplett beleuchtete Scheibe (Vollmond). */
function fullDiscPath(cx: number, cy: number, r: number): string {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`
}

export default MoonGraphic
