import { memo, useMemo } from 'react'
import { useI18n } from '../i18n/LanguageContext'

interface AnalogClockProps {
  /** Stunden 0–24 (mit Nachkommastellen). */
  hours: number
  size?: number
}

/**
 * SVG-Analoguhr mit Stunden-, Minuten- und Sekundenzeigern.
 * Die Stunde kann > 12 sein (24h-Skala), der Stundenzeiger rotiert
 * entsprechend über die volle 360°-Skala.
 */
const AnalogClock = memo(function AnalogClock({ hours, size = 180 }: AnalogClockProps) {
  const { t } = useI18n()
  // Aus den Dezimalstunden Minuten/Sekunden zurückgewinnen.
  const { h, m, s } = useMemo(() => {
    const total = ((hours % 24) + 24) % 24
    const h = Math.floor(total)
    const mFloat = (total - h) * 60
    const m = Math.floor(mFloat)
    const s = Math.floor((mFloat - m) * 60)
    return { h, m, s }
  }, [hours])

  // Winkel: 12h-Uhr-Logik, aber Stundenzeiger läuft über 24h (volle Drehung/Tag).
  // Für ein vertrautes Zifferblatt nehmen wir 12h-Modulo für die Skala.
  const h12 = h % 12
  const hourAngle = (h12 + m / 60) * 30 // 360/12
  const minAngle = (m + s / 60) * 6 // 360/60
  const secAngle = s * 6

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 6

  // Stundenstriche
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    const x1 = cx + (r - 8) * Math.cos(angle)
    const y1 = cy + (r - 8) * Math.sin(angle)
    const x2 = cx + r * Math.cos(angle)
    const y2 = cy + r * Math.sin(angle)
    return { x1, y1, x2, y2, major: i % 3 === 0 }
  })

  const hourNums = [
    { n: '12', x: cx, y: 24 },
    { n: '3', x: size - 18, y: cy + 5 },
    { n: '6', x: cx, y: size - 16 },
    { n: '9', x: 18, y: cy + 5 },
  ]

  return (
    <svg
      className="analog-clock"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={t.ariaAnalogClock}
    >
      <defs>
        <radialGradient id="clock-face" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#1a2440" />
          <stop offset="100%" stopColor="#0c1224" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={r} fill="url(#clock-face)" stroke="rgba(245,185,76,0.35)" strokeWidth="2" />

      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={t.major ? 'rgba(245,185,76,0.8)' : 'rgba(255,255,255,0.3)'}
          strokeWidth={t.major ? 2 : 1}
        />
      ))}

      {hourNums.map((hn) => (
        <text
          key={hn.n}
          x={hn.x}
          y={hn.y}
          textAnchor="middle"
          fontSize="13"
          fontFamily="var(--mono)"
          fill="rgba(255,255,255,0.55)"
        >
          {hn.n}
        </text>
      ))}

      {/* Stundenzeiger */}
      <Hand angle={hourAngle} length={r * 0.5} cx={cx} cy={cy} width={4} color="#ffe08a" />
      {/* Minutenzeiger */}
      <Hand angle={minAngle} length={r * 0.72} cx={cx} cy={cy} width={3} color="#f5b94c" />
      {/* Sekundenzeiger */}
      <Hand angle={secAngle} length={r * 0.82} cx={cx} cy={cy} width={1.5} color="#ff9e3d" />

      <circle cx={cx} cy={cy} r={4} fill="#ffe08a" />
    </svg>
  )
})

function Hand({
  angle,
  length,
  cx,
  cy,
  width,
  color,
}: {
  angle: number
  length: number
  cx: number
  cy: number
  width: number
  color: string
}) {
  return (
    <line
      x1={cx}
      y1={cy}
      x2={cx + length * Math.cos((angle - 90) * (Math.PI / 180))}
      y2={cy + length * Math.sin((angle - 90) * (Math.PI / 180))}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
    />
  )
}

export default AnalogClock
