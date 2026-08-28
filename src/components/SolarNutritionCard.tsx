import { memo } from 'react'
import { useI18n } from '../i18n/LanguageContext'
import { getGrowthZone } from '../lib/solarNutrition'
import { computeMoonPhase } from '../lib/moonPhase'

interface SolarNutritionCardProps {
  /** Aktuelles Datum (für Vollmondwochen-Berechnung). */
  date: Date
  /** Wahre Sonnenzeit als Dezimalstunden (0–24). */
  trueSolarHours: number
}

/**
 * Solar Nutrition Karte nach den Regeln von Adano Ley (Swami Nitty Gritty).
 * Zeigt die aktuelle Growth Zone (1, 2 oder 3) basierend auf der wahren Sonnenzeit.
 * In der Vollmondwoche wird ein spezieller Warnhinweis eingeblendet.
 */
const SolarNutritionCard = memo(function SolarNutritionCard({
  date,
  trueSolarHours,
}: SolarNutritionCardProps) {
  const { t } = useI18n()
  const zoneInfo = getGrowthZone(trueSolarHours)
  const moon = computeMoonPhase(date)

  const zone1Title = t.growthZone1Title
  const zone1Desc = t.growthZone1Desc
  const zone2Title = t.growthZone2Title
  const zone2Desc = t.growthZone2Desc
  const zone3Title = t.growthZone3Title
  const zone3Desc = t.growthZone3Desc

  const currentTitle =
    zoneInfo.zone === 1 ? zone1Title : zoneInfo.zone === 2 ? zone2Title : zone3Title
  const currentDesc =
    zoneInfo.zone === 1 ? zone1Desc : zoneInfo.zone === 2 ? zone2Desc : zone3Desc

  return (
    <section className="card solar-nutrition-card">
      <h2 className="card-title">
        <span
          className="dot"
          style={{
            background: zoneInfo.color,
            boxShadow: `0 0 10px ${zoneInfo.color}`,
          }}
        />
        {t.solarNutritionTitle || 'Solar Nutrition'}
      </h2>

      <p className="nutrition-subtitle">
        {t.solarNutritionSubtitle || 'Nach den Regeln von Adano Ley (Swami Nitty Gritty)'}
      </p>

      {/* Vollmondwochen-Warnhinweis */}
      {moon.isFullMoonWeek && (
        <div className="nutrition-fullmoon-warning">
          <span className="warning-icon" aria-hidden="true">
            🌕
          </span>
          <p>{t.nutritionFullMoonWarning}</p>
        </div>
      )}

      {/* Hauptkarte der aktiven Growth Zone */}
      <div
        className="nutrition-active-box"
        style={{
          borderLeftColor: zoneInfo.color,
          boxShadow: `0 4px 20px ${zoneInfo.glowColor}`,
        }}
      >
        <div className="nutrition-active-header">
          <span className="nutrition-zone-icon" aria-hidden="true">
            {zoneInfo.icon}
          </span>
          <div className="nutrition-zone-headline" style={{ color: zoneInfo.color }}>
            {currentTitle}
          </div>
        </div>

        <p className="nutrition-zone-text">{currentDesc}</p>
      </div>

      {/* Übersicht aller 3 Growth Zonen */}
      <div className="nutrition-zones-grid">
        <div className={`nutrition-zone-chip ${zoneInfo.zone === 1 ? 'active' : ''}`}>
          <div className="chip-badge">00:01 – 11:59</div>
          <div className="chip-title">🌳 Zone 1</div>
          <div className="chip-sub">{t.growthZoneShort1}</div>
        </div>

        <div className={`nutrition-zone-chip ${zoneInfo.zone === 2 ? 'active' : ''}`}>
          <div className="chip-badge">12:00 – 17:59</div>
          <div className="chip-title">🌿 Zone 2</div>
          <div className="chip-sub">{t.growthZoneShort2}</div>
        </div>

        <div className={`nutrition-zone-chip ${zoneInfo.zone === 3 ? 'active' : ''}`}>
          <div className="chip-badge">18:00 – 23:59</div>
          <div className="chip-title">🥕 Zone 3</div>
          <div className="chip-sub">{t.growthZoneShort3}</div>
        </div>
      </div>
    </section>
  )
})

export default memo(SolarNutritionCard, (prev, next) => {
  return (
    Math.floor(prev.trueSolarHours * 60) === Math.floor(next.trueSolarHours * 60) &&
    Math.floor(prev.date.getTime() / 60000) === Math.floor(next.date.getTime() / 60000)
  )
})
