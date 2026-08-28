import { memo, useMemo } from 'react'
import { useI18n } from '../i18n/LanguageContext'
import { computePlanetaryHour } from '../lib/planetaryHours'
import { computeSolarTime, formatHM } from '../lib/solarTime'

interface PlanetaryHoursCardProps {
  date: Date
  latitude: number
  longitude: number
}

function getTranslationString(dict: Record<string, unknown>, key: string): string {
  const val = dict[key]
  return typeof val === 'string' ? val : key
}

function PlanetaryHoursCard({ date, latitude, longitude }: PlanetaryHoursCardProps) {
  const { t } = useI18n()

  const res = useMemo(
    () => computePlanetaryHour(date, latitude, longitude),
    [date, latitude, longitude],
  )

  const solarWindowStr = useMemo(() => {
    if (!res) return ''
    const solarStart = computeSolarTime(res.startTime, latitude, longitude)
    const solarEnd = computeSolarTime(res.endTime, latitude, longitude)
    return `${formatHM(solarStart.trueSolarDate)} – ${formatHM(solarEnd.trueSolarDate)}`
  }, [res, latitude, longitude])

  if (!res) {
    return null
  }

  const dict = t as unknown as Record<string, unknown>
  const planetName = getTranslationString(dict, res.planet.nameKey)
  const dayRulerName = getTranslationString(dict, res.dayRuler.nameKey)
  const planetDesc = t.planetDescs[res.planet.key] || ''

  const formatTime = (d: Date) => {
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
  }

  const hourTypeLabel = res.isDayHour
    ? `${res.hourNumber}. ${t.diurnalHour}`
    : `${res.hourNumber}. ${t.nocturnalHour}`

  return (
    <section className="card planetary-card">
      <h2 className="card-title">
        <span
          className="dot"
          style={{ background: res.planet.color, boxShadow: `0 0 10px ${res.planet.color}` }}
        />
        {t.planetaryHoursTitle}
      </h2>

      <div className="planetary-display">
        <div className="planet-icon-wrap" style={{ borderColor: res.planet.color }}>
          <span className="planet-symbol" style={{ color: res.planet.color }}>
            {res.planet.symbol}
          </span>
        </div>

        <div className="planet-main-info">
          <div className="planet-badge-row">
            <span className="planet-badge" style={{ background: `${res.planet.color}22`, color: res.planet.color }}>
              {hourTypeLabel}
            </span>
            <span className="day-ruler-badge">
              {t.dayRuler}: <strong>{res.dayRuler.symbol} {dayRulerName}</strong>
            </span>
          </div>

          <h3 className="planet-name" style={{ color: res.planet.color }}>
            {res.planet.symbol} {planetName}
          </h3>

          <p className="planet-window">
            {formatTime(res.startTime)} – {formatTime(res.endTime)}
            <span className="planet-window-solar"> ({solarWindowStr} {t.trueSolarTime})</span>
          </p>

          <div className="planet-progress-bar">
            <div
              className="planet-progress-fill"
              style={{ width: `${res.progressPercent.toFixed(1)}%`, background: res.planet.color }}
            />
          </div>

          <p className="planet-desc">{planetDesc}</p>
        </div>
      </div>
    </section>
  )
}

export default memo(PlanetaryHoursCard, (prev, next) => {
  return (
    prev.latitude === next.latitude &&
    prev.longitude === next.longitude &&
    Math.floor(prev.date.getTime() / 60000) === Math.floor(next.date.getTime() / 60000)
  )
})
