import { memo } from 'react'
import type { MoonResult } from '../types'
import { SYNODIC_PERIOD } from '../lib/moonPhase'
import { useI18n } from '../i18n/LanguageContext'

interface MoonTimelineProps {
  moon: MoonResult
}

/**
 * Horizontaler Zeitstrahl des Mond-Monats.
 *
 * Aufbau (analog zur ursprünglichen SolarTiming-App):
 *   - Links (0%)  = Neumond
 *   - Mitte (50%) = Vollmond  ← das helle, leuchtende Zentrum
 *   - Rechts(100%)= nächstes Neumond
 *
 * Der Mond-Icon wandert entsprechend phaseFraction (0..1) über den Strahl.
 * Während der Vollmondwoche pulsiert das Zentrum gelb-orange.
 */
const MoonTimeline = memo(function MoonTimeline({ moon }: MoonTimelineProps) {
  const { t } = useI18n()
  // Position 0..1 des Mondes auf dem Strahl (Neumond → Vollmond → Neumond).
  const phaseFraction = moon.age / SYNODIC_PERIOD
  const posPct = Math.max(0, Math.min(100, phaseFraction * 100))

  const isFullWeek = moon.isFullMoonWeek

  return (
    <div className="moon-timeline" role="img" aria-label={t.ariaMoonTimeline
      .replace('{cycleDay}', String(moon.cycleDay))
      .replace('{total}', String(SYNODIC_PERIOD))
      .replace('{pct}', posPct.toFixed(0))}>
      {/* Endpunkt links: Neumond */}
      <span className="tl-end tl-left">
        <span className="tl-moon tl-new" />
        <span className="tl-label">{t.phases.new}</span>
      </span>

      {/* Die Schiene */}
      <div className={`tl-track ${isFullWeek ? 'glowing' : ''}`}>
        {/* Vollmondwoche-Bereich auf dem Zeitstrahl (3 Tage vor bis 3 Tage nach Vollmond) */}
        <div className={`tl-fullmoon-zone ${isFullWeek ? 'glowing' : ''}`} />

        {/* Gelbes Vollmond-Zentrum */}
        <span className="tl-center" />
        {/* Mond-Icon (wandernd) mit Zeiger "jetzt hier" */}
        <span className="tl-knob" style={{ left: `${posPct}%` }}>
          <span className="tl-pointer-badge">
            <span className="tl-pointer-text">{t.nowHere}</span>
            <svg className="tl-pointer-arrow" viewBox="0 0 12 7" fill="currentColor">
              <path d="M6 7L0 0h12L6 7z" />
            </svg>
          </span>
          <span
            className={`tl-knob-moon illum-${Math.round(moon.illumination * 10)} ${isFullWeek ? 'glowing' : ''}`}
          />
        </span>
        {/* Mittig: Vollmond-Marker */}
        <span className="tl-center-label">{t.phases.full}</span>
      </div>

      {/* Endpunkt rechts: Neumond */}
      <span className="tl-end tl-right">
        <span className="tl-moon tl-new" />
        <span className="tl-label">{t.phases.new}</span>
      </span>
    </div>
  )
})

export default MoonTimeline
