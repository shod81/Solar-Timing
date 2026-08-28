import { memo, useMemo } from 'react'
import { useI18n } from '../i18n/LanguageContext'
import { solarElevation, twilightTimes, formatHM } from '../lib/solarTime'
import SolarArc from './SolarArc'

interface SolarArcCardProps {
  date: Date
  latitude: number
  longitude: number
}

/** Sonnen-Tagesbogen mit Höhenkurve + Dämmerungs-/Goldene-Stunde-Zeiten. */
function SolarArcCard({ date, latitude, longitude }: SolarArcCardProps) {
  const { t } = useI18n()

  const tw = useMemo(
    () => twilightTimes(date, latitude, longitude),
    [date, latitude, longitude],
  )
  const curEl = useMemo(
    () => solarElevation(date, latitude, longitude),
    [date, latitude, longitude],
  )
  const sunUp = curEl >= 0

  const isPolar = tw.sunrise === null && tw.sunset === null
  const polarStatusKey = isPolar ? (sunUp ? 'polarDay' : 'polarNight') : null

  return (
    <section className="card">
      <h2 className="card-title">
        <span className="dot" />
        {t.solarArcTitle}
      </h2>
      <p className="card-subtitle">{t.solarArcHint}</p>

      <SolarArc date={date} latitude={latitude} longitude={longitude} />

      <div className="arc-status">
        <span className={`arc-status-pill ${sunUp ? 'up' : 'down'}`}>
          {polarStatusKey ? t[polarStatusKey] : (sunUp ? t.sunAboveHorizon : t.sunBelowHorizon)} · {curEl.toFixed(0)}°
        </span>
      </div>

      <div className="arc-times">
        <ArcCell label={t.sunrise} value={polarStatusKey ? t[polarStatusKey] : formatHM(tw.sunrise)} tone="sun" />
        <ArcCell label={t.goldenHour} value={polarStatusKey ? '—' : `${formatHM(tw.sunrise)}–${formatHM(tw.goldenEndMorning)}`} tone="gold" />
        <ArcCell label={t.civilDawn} value={formatHM(tw.civilDawn)} tone="civil" />
        <ArcCell label={t.nauticalDawn} value={formatHM(tw.nauticalDawn)} tone="naut" />
        <ArcCell label={t.astronomicalDawn} value={formatHM(tw.astronomicalDawn)} tone="astro" />
        <ArcCell label={t.sunset} value={polarStatusKey ? t[polarStatusKey] : formatHM(tw.sunset)} tone="sun" />
        <ArcCell label={t.goldenHourEve} value={polarStatusKey ? '—' : `${formatHM(tw.goldenStartEvening)}–${formatHM(tw.sunset)}`} tone="gold" />
        <ArcCell label={t.civilDusk} value={formatHM(tw.civilDusk)} tone="civil" />
        <ArcCell label={t.nauticalDusk} value={formatHM(tw.nauticalDusk)} tone="naut" />
        <ArcCell label={t.astronomicalDusk} value={formatHM(tw.astronomicalDusk)} tone="astro" />
      </div>
    </section>
  )
}

function ArcCell({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`arc-cell tone-${tone}`}>
      <span className="arc-cell-label">{label}</span>
      <span className="arc-cell-value">{value}</span>
    </div>
  )
}

export default memo(SolarArcCard, (prev, next) => {
  return (
    prev.latitude === next.latitude &&
    prev.longitude === next.longitude &&
    Math.floor(prev.date.getTime() / 60000) === Math.floor(next.date.getTime() / 60000)
  )
})
