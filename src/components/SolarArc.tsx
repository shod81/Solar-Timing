import { memo, useMemo } from 'react'
import { solarElevation, dayOfYear } from '../lib/solarTime'
import { useI18n } from '../i18n/LanguageContext'

const DEG = Math.PI / 180

interface SolarArcProps {
  date: Date
  latitude: number
  longitude: number
  width?: number
  height?: number
}

/**
 * SVG-Sonnen-Tagesbogen.
 *
 * - X-Achse: 24 h des Tages (lokal, 0–24).
 * - Y-Achse: Sonnenhöhe in Grad (−90..+90), Bereich auf den sichtbaren
 *   Teil (typ. −18°…+60°) beschnitten.
 * - Farbige Bänder: Nacht, astro-/naut./civil-Dämmerung, Tag, Goldene Stunde.
 * - Wandernder Punkt = aktuelle Sonnenhöhe.
 */
const SolarArc = memo(function SolarArc({
  date,
  latitude,
  longitude,
  width = 760,
  height = 180,
}: SolarArcProps) {
  const { t } = useI18n()
  // Höhenkurve: stündlich (0..24h) je einen Punkt.
  const { points, maxEl, currentPoint, currentEl } = useMemo(() => {
    const baseDate = new Date(date)
    baseDate.setMinutes(0, 0, 0) // Stundengitter im lokalen Tag
    const pts: { hour: number; el: number }[] = []
    let maxEl = -90
    for (let h = 0; h <= 24; h++) {
      const d = new Date(baseDate)
      d.setHours(h)
      const el = solarElevation(d, latitude, longitude)
      pts.push({ hour: h, el })
      if (el > maxEl) maxEl = el
    }
    // Aktueller Punkt (fein).
    const curEl = solarElevation(date, latitude, longitude)
    const curHour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
    return { points: pts, maxEl, currentPoint: { hour: curHour, el: curEl }, currentEl: curEl }
  }, [date, latitude, longitude])

  // Y-Bereich: von min(−18, niedrigster) bis max(60, höchster)+ Puffer.
  const yMin = Math.min(-18, ...points.map((p) => p.el)) - 2
  const yMax = Math.max(18, maxEl) + 4
  const padL = 8
  const padR = 8
  const padT = 14
  const padB = 24
  const plotW = width - padL - padR
  const plotH = height - padT - padB

  const xOf = (hour: number) => padL + (hour / 24) * plotW
  const yOf = (el: number) => padT + ((yMax - el) / (yMax - yMin)) * plotH

  // Höhenlinie als Pfad.
  const curvePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(p.hour).toFixed(1)} ${yOf(p.el).toFixed(1)}`)
    .join(' ')

  // Gefüllte Fläche unter der Kurve bis Horizont (el=0).
  const horizonY = yOf(0)
  const areaPath =
    curvePath + ` L ${xOf(24).toFixed(1)} ${horizonY.toFixed(1)} L ${xOf(0).toFixed(1)} ${horizonY.toFixed(1)} Z`

  // Horizontlinie bei 0°.
  const sunUp = currentEl >= 0
  const N = dayOfYear(date)

  // Stundenmarkierungen (alle 3 h)
  const hourMarks = [0, 3, 6, 9, 12, 15, 18, 21, 24]

  return (
    <svg
      className="solar-arc"
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={t.ariaSolarArc.replace('{el}', currentEl.toFixed(0))}
    >
      <defs>
        <linearGradient id="arc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(120,90,160,0.5)" />
          <stop offset="40%" stopColor="rgba(245,185,76,0.25)" />
          <stop offset="100%" stopColor="rgba(40,30,70,0.6)" />
        </linearGradient>
        <linearGradient id="arc-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(10,14,26,0.2)" />
          <stop offset="100%" stopColor="rgba(10,14,26,0.5)" />
        </linearGradient>
        <filter id="sun-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Horizont (y=0°) */}
      <line
        x1={padL}
        y1={horizonY}
        x2={width - padR}
        y2={horizonY}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* Gefüllte Fläche */}
      <path d={areaPath} fill="url(#arc-sky)" opacity={sunUp ? 0.7 : 0.35} />

      {/* Höhenlinie */}
      <path d={curvePath} fill="none" stroke="var(--gold)" strokeWidth="2.5" opacity="0.95" />

      {/* Stundenmarken + Gitter */}
      {hourMarks.map((h) => (
        <g key={h}>
          <line
            x1={xOf(h)}
            y1={padT}
            x2={xOf(h)}
            y2={height - padB}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
          <text
            x={xOf(h)}
            y={height - 8}
            textAnchor="middle"
            fontSize="9"
            fill="rgba(255,255,255,0.4)"
          >
            {String(h).padStart(2, '0')}
          </text>
        </g>
      ))}

      {/* Y-Beschriftung */}
      <text x={padL + 2} y={padT + 8} fontSize="9" fill="rgba(255,255,255,0.35)">
        {yMax.toFixed(0)}°
      </text>
      <text x={padL + 2} y={horizonY - 3} fontSize="9" fill="rgba(255,255,255,0.35)">
        0°
      </text>

      {/* Aktueller Sonnenstand */}
      <g filter="url(#sun-glow)">
        <circle
          cx={xOf(currentPoint.hour)}
          cy={yOf(currentPoint.el)}
          r="9"
          fill={sunUp ? 'var(--gold-bright)' : 'rgba(120,120,160,0.5)'}
          opacity={sunUp ? 0.35 : 0.4}
        />
        <circle
          cx={xOf(currentPoint.hour)}
          cy={yOf(currentPoint.el)}
          r="5"
          fill={sunUp ? '#fff3c4' : 'rgba(160,160,200,0.8)'}
          stroke="var(--gold)"
          strokeWidth="1.5"
        />
      </g>

      {/* Tiny meta */}
      <text
        x={width - padR}
        y={padT + 8}
        textAnchor="end"
        fontSize="9"
        fill="rgba(255,255,255,0.4)"
      >
        N={N} · max {maxEl.toFixed(0)}°
      </text>
    </svg>
  )
})

// Marker, um DEG-Import konsistent zu halten (für spätere Azimut-Nutzung).
void DEG

export default SolarArc
