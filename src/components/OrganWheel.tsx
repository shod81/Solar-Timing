import { memo } from 'react'
import { ORGAN_SLOTS, ELEMENT_COLORS, formatWindow } from '../lib/organClock'
import { useI18n } from '../i18n/LanguageContext'

interface OrganWheelProps {
  /** Aktive Stunde (0–23). */
  activeHour: number
  selectedKey?: string
  onSelect?: (key: string) => void
  size?: number
}

/**
 * SVG-Kreisrad mit 12 Segmenten – je eines pro TCM-Organfenster.
 * Das aktive Segment ist hervorgehoben (Glow + dickere Linie).
 *
 * Anordnung: 24h-Ring, oben = 03:00 Uhr (Lunge, Beginn der TCM-Nachtfolge).
 */
// Feste interne Koordinaten (viewBox). Die Pixelgröße wird über `size`
// gesteuert, sodass alle Elemente (inkl. Texte) sauber mitskalieren.
const VB = 320

const OrganWheel = memo(function OrganWheel({
  activeHour,
  selectedKey,
  onSelect,
  size = 320,
}: OrganWheelProps) {
  const { t } = useI18n()
  const cx = VB / 2
  const cy = VB / 2
  const rOuter = VB / 2 - 6
  const rInner = rOuter * 0.45

  // Aktiver Slot bestimmen
  const activeSlot = ORGAN_SLOTS.find((s) => {
    if (s.key === 'gallbladder') return activeHour === 23 || activeHour === 0
    if (s.key === 'liver') return activeHour === 1 || activeHour === 2
    return activeHour >= s.startHour && activeHour < s.startHour + 2
  })

  const activeKey = activeSlot?.key

  // 12 Segmente á 30°. Wir beginnen oben (−90°) bei 03:00 (Lunge)
  // und gehen im Uhrzeigersinn weiter.
  const segments = ORGAN_SLOTS.map((slot, i) => {
    const startAngle = -90 + i * 30
    const endAngle = startAngle + 30
    const isActive = slot.key === activeKey
    const isSelected = selectedKey ? slot.key === selectedKey : isActive
    return describeArc(cx, cy, rInner, rOuter, startAngle, endAngle, slot, isActive, isSelected)
  })

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect?.(ORGAN_SLOTS[index].key)
      return
    }

    let nextIndex: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      nextIndex = (index + 1) % ORGAN_SLOTS.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      nextIndex = (index - 1 + ORGAN_SLOTS.length) % ORGAN_SLOTS.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIndex = ORGAN_SLOTS.length - 1
    }

    if (nextIndex !== null) {
      const nextSlot = ORGAN_SLOTS[nextIndex]
      onSelect?.(nextSlot.key)
      setTimeout(() => {
        const el = document.getElementById(`organ-segment-${nextSlot.key}`)
        el?.focus()
      }, 0)
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} role="img" aria-label={t.ariaOrganWheel}>
      <defs>
        <filter id="seg-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {segments.map((seg, i) => (
        <g
          key={seg.slot.key}
          id={`organ-segment-${seg.slot.key}`}
          className="organ-wheel-segment"
          onClick={() => onSelect?.(seg.slot.key)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          tabIndex={0}
          role="button"
          aria-label={`${t.organs[seg.slot.key]} (${formatWindow(seg.slot.startHour)})`}
          aria-pressed={seg.isSelected}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <path
            d={seg.path}
            fill={seg.color}
            fillOpacity={seg.isSelected ? 0.95 : seg.isActive ? 0.75 : 0.28}
            stroke={seg.isSelected ? '#ffe08a' : 'rgba(255,255,255,0.18)'}
            strokeWidth={seg.isSelected ? 2.5 : seg.isActive ? 2 : 1}
            filter={seg.isSelected || seg.isActive ? 'url(#seg-glow)' : undefined}
            style={{ transition: 'fill-opacity 0.2s ease, stroke 0.2s ease' }}
          />
          <text
            x={seg.labelX}
            y={seg.labelY + 4}
            textAnchor="middle"
            fontSize="9"
            fill={seg.isSelected || seg.isActive ? '#0c1224' : 'rgba(255,255,255,0.78)'}
            fontWeight={seg.isSelected || seg.isActive ? 700 : 500}
          >
            {formatWindow(seg.slot.startHour)}
          </text>
        </g>
      ))}

      {/* Zentrum: Anzeige aktives Organ */}
      <circle cx={cx} cy={cy} r={rInner - 2} fill="rgba(8,12,24,0.85)" stroke="rgba(255,255,255,0.12)" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.45)">
        {t.organActiveNow}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize="12"
        fontWeight={700}
        fill="#ffe08a"
      >
        {activeKey ? t.organs[activeKey] : '—'}
      </text>
    </svg>
  )
})

interface SegmentMeta {
  path: string
  color: string
  isActive: boolean
  isSelected: boolean
  labelX: number
  labelY: number
  slot: (typeof ORGAN_SLOTS)[number]
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 0) * Math.PI) / 180.0
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function describeArc(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number,
  slot: (typeof ORGAN_SLOTS)[number],
  isActive: boolean,
  isSelected: boolean,
): SegmentMeta {
  const startOuter = polar(cx, cy, rOuter, startAngle)
  const endOuter = polar(cx, cy, rOuter, endAngle)
  const startInner = polar(cx, cy, rInner, endAngle)
  const endInner = polar(cx, cy, rInner, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1

  const d = [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ')

  const midAngle = (startAngle + endAngle) / 2
  const labelR = (rInner + rOuter) / 2
  const labelPos = polar(cx, cy, labelR, midAngle)

  return {
    path: d,
    color: ELEMENT_COLORS[slot.element],
    isActive,
    isSelected,
    labelX: labelPos.x,
    labelY: labelPos.y,
    slot,
  }
}

export default OrganWheel
