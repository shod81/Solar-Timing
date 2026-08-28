import { memo } from 'react'
import { useI18n } from '../i18n/LanguageContext'
import { computeDailyProfile } from '../lib/dailyProfile'
import { ELEMENT_COLORS, formatWindow } from '../lib/organClock'
import { PLANETS } from '../lib/planetaryHours'

interface DailyProfileCardProps {
  date: Date
  latitude: number
  longitude: number
}

/**
 * Tagesprofil: Synthese aus TCM-Organuhr, Planetenstunde und Mondphase.
 *
 * Zeigt die drei aktuellen Quellen als kompakte Badges und kombiniert sie
 * zu einer konkreten Handlungsempfehlung (organ-spezifischer Tipp aus
 * t.organDetails + planetare Qualität). In der Vollmondwoche erscheint
 * zusätzlich ein Energie-Boost-Hinweis.
 */
function getTranslationString(dict: Record<string, unknown>, key: string | null): string | null {
  if (!key) return null
  const val = dict[key]
  return typeof val === 'string' ? val : null
}

function DailyProfileCard({ date, latitude, longitude }: DailyProfileCardProps) {
  const { t } = useI18n()
  const profile = computeDailyProfile(date, latitude, longitude)

  const organName = t.organs[profile.organ.key] || profile.organ.key
  const organColor = ELEMENT_COLORS[profile.organ.element]
  const organTip = t.organDetails?.[profile.organ.key]?.activities?.[0]
  const nutritionTip = t.organDetails?.[profile.organ.key]?.nutrition?.[0]

  const dict = t as unknown as Record<string, unknown>

  // Planeten-Name + Farbe + Qualitäts-Aussage (via i18n-Key).
  const planet = profile.planet
  const planetName = planet ? PLANETS[planet.planet.key].nameKey : null
  const planetNameResolved = getTranslationString(dict, planetName)
  const planetColor = planet ? planet.planet.color : null
  const planetProfileText = getTranslationString(dict, profile.planetProfileKey)

  // Mond-Phase (übersetzt) + Vollmond-Boost.
  const moon = profile.moon
  const moonPhaseName = t.phases[moon.phase]

  return (
    <section className="card profile-card">
      <h2 className="card-title">
        <span className="dot" style={{ background: organColor, boxShadow: `0 0 10px ${organColor}` }} />
        {t.profileTitle}
      </h2>
      <p className="profile-hint">{t.profileHint}</p>

      {/* Drei Quellen-Badges: Organ · Planet · Mond */}
      <div className="profile-sources">
        <div
          className="profile-source"
          style={{
            borderColor: 'var(--glass-border-strong)',
            borderLeftColor: organColor,
            borderLeftWidth: '4px',
          }}
        >
          <span className="profile-source-label">{t.profileOrganNow}</span>
          <span className="profile-source-value" style={{ color: organColor }}>
            {organName}
          </span>
          <span className="profile-source-sub">{formatWindow(profile.organ.startHour)}</span>
        </div>

        {planet && planetColor && planetNameResolved && (
          <div
            className="profile-source"
            style={{
              borderColor: 'var(--glass-border-strong)',
              borderLeftColor: planetColor,
              borderLeftWidth: '4px',
            }}
          >
            <span className="profile-source-label">{t.profilePlanetNow}</span>
            <span className="profile-source-value" style={{ color: planetColor }}>
              {planet.planet.symbol} {planetNameResolved}
            </span>
            <span className="profile-source-sub">
              {planet.hourNumber}. {planet.isDayHour ? t.diurnalHour : t.nocturnalHour}
            </span>
          </div>
        )}

        <div
          className="profile-source moon-source"
          style={{
            borderColor: 'var(--glass-border-strong)',
            borderLeftColor: 'var(--moon-glow-1)',
            borderLeftWidth: '4px',
          }}
        >
          <span className="profile-source-label">{t.profileMoonNow}</span>
          <span className="profile-source-value moon-value" style={{ color: 'var(--moon-glow-1)' }}>
            🌙 {moonPhaseName}
          </span>
          <span className="profile-source-sub">{Math.round(moon.illumination * 100)}%</span>
        </div>
      </div>

      {/* Haupt-Empfehlung: organ-spezifischer Tipp */}
      {organTip && (
        <div className="profile-tip">
          <div className="profile-tip-label">{t.profileTipLabel}</div>
          <div className="profile-tip-text">{organTip}</div>
        </div>
      )}

      {/* Planetare Qualität */}
      {planetProfileText && (
        <div className="profile-planet-quality">
          {planet?.planet.symbol} {planetProfileText}
        </div>
      )}

      {/* Vollmond-Boost (nur in der Vollmondwoche) */}
      {profile.moonBoost && (
        <div className="profile-moon-boost">🌕 {t.profileMoonBoost}</div>
      )}

      {/* Ernährungs-Tipp */}
      {nutritionTip && (
        <div className="profile-nutrition">
          <span className="profile-nutrition-label">{t.profileNutritionLabel}:</span>{' '}
          {nutritionTip}
        </div>
      )}
    </section>
  )
}

export default memo(DailyProfileCard, (prev, next) => {
  return (
    prev.latitude === next.latitude &&
    prev.longitude === next.longitude &&
    Math.floor(prev.date.getTime() / 60000) === Math.floor(next.date.getTime() / 60000)
  )
})
