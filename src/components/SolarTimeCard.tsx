import { memo } from 'react'
import { useI18n } from '../i18n/LanguageContext'
import type { SolarTimeResult } from '../types'
import {
  computeSolarTime,
  formatHM,
  formatHMS,
  formatSignedMinutes,
} from '../lib/solarTime'
import AnalogClock from './AnalogClock'

interface SolarTimeCardProps {
  date: Date
  latitude: number
  longitude: number
  solarResult?: SolarTimeResult
}

export default memo(function SolarTimeCard({ date, latitude, longitude, solarResult }: SolarTimeCardProps) {
  const { t } = useI18n()
  const res: SolarTimeResult = solarResult ?? computeSolarTime(date, latitude, longitude)

  const utcOffsetMin = -date.getTimezoneOffset()
  const utcOffsetStr = formatSignedMinutes(utcOffsetMin)

  const sunriseVal = res.polarStatus ? (res.polarStatus === 'polarDay' ? t.polarDay : t.polarNight) : formatHM(res.sunrise)
  const sunsetVal = res.polarStatus ? (res.polarStatus === 'polarDay' ? t.polarDay : t.polarNight) : formatHM(res.sunset)

  return (
    <section className="card">
      <h2 className="card-title">
        <span className="dot" />
        {t.trueSolarTime}
      </h2>

      {res.polarStatus && (
        <div
          className="location-status"
          style={{
            background: res.polarStatus === 'polarDay' ? 'rgba(255, 185, 76, 0.15)' : 'rgba(90, 105, 140, 0.2)',
            borderColor: res.polarStatus === 'polarDay' ? 'var(--gold)' : 'var(--text-dim)',
            color: res.polarStatus === 'polarDay' ? 'var(--gold-bright)' : 'var(--text-bright)',
            marginBottom: 16,
          }}
        >
          {res.polarStatus === 'polarDay' ? '☀️' : '🌌'} <strong>{res.polarStatus === 'polarDay' ? t.polarDay : t.polarNight}</strong>
        </div>
      )}

      <div className="solar-display">
        <div>
          <p className="solar-time-main">{formatHMS(res.trueSolarDate)}</p>
          <p className="solar-label">{t.trueSolarTimeHint}</p>
        </div>
        <AnalogClock hours={res.trueSolarHours} />
      </div>

      <div className="detail-grid">
        <DetailCell k={t.civilTime} v={formatLocal(date)} />
        <DetailCell k={t.utcOffset} v={utcOffsetStr} />
        <DetailCell k={t.longitude} v={`${longitude.toFixed(3)}°`} />
        <DetailCell k={t.longitudeCorrection} v={formatSignedMinutes(res.longitudeCorrection)} />
        <DetailCell k={t.equationOfTime} v={formatSignedMinutes(res.equationOfTime)} />
        <DetailCell k={t.sunrise} v={sunriseVal} />
        <DetailCell k={t.sunset} v={sunsetVal} />
        <DetailCell k={t.solarNoon} v={formatHM(res.solarNoon)} />
      </div>
    </section>
  )
})

function DetailCell({ k, v }: { k: string; v: string }) {
  return (
    <div className="detail-cell">
      <div className="detail-label">{k}</div>
      <div className="detail-value">{v}</div>
    </div>
  )
}

/** Formatiert ein Date in lokale HH:MM:SS. */
function formatLocal(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}
