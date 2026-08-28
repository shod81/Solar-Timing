import { memo } from 'react'
import { useI18n } from '../i18n/LanguageContext'
import { computeZodiac, type ZodiacPosition } from '../lib/zodiac'

interface ZodiacCardProps {
  date: Date
}

function ZodiacCard({ date }: ZodiacCardProps) {
  const { t } = useI18n()
  const res = computeZodiac(date)

  return (
    <section className="card zodiac-card">
      <h2 className="card-title">
        <span className="dot" style={{ background: '#ffb74d', boxShadow: '0 0 10px #ffb74d' }} />
        {t.zodiacTitle}
      </h2>

      <div className="zodiac-grid">
        {/* Sonnenzeichen (Sternzeichen) */}
        <ZodiacBox
          title={t.sunSign}
          position={res.sun}
          type="sun"
          icon="☀️"
        />

        {/* Mondzeichen */}
        <ZodiacBox
          title={t.moonSign}
          position={res.moon}
          type="moon"
          icon="🌙"
        />
      </div>
    </section>
  )
}

function ZodiacBox({
  title,
  position,
  type,
  icon,
}: {
  title: string
  position: ZodiacPosition
  type: 'sun' | 'moon'
  icon: string
}) {
  const { t } = useI18n()
  const signName = t.zodiacSigns[position.sign.key] || position.sign.key
  const elementName = t.zodiacElements[position.sign.element] || position.sign.element

  return (
    <div className={`zodiac-box type-${type}`}>
      <div className="zodiac-box-header">
        <span className="zodiac-type-label">
          {icon} {title}
        </span>
        <span
          className="zodiac-element-chip"
          style={{ background: `${position.sign.color}22`, color: position.sign.color }}
        >
          {elementName}
        </span>
      </div>

      <div className="zodiac-box-body">
        <div className="zodiac-symbol-circle" style={{ borderColor: position.sign.color }}>
          <span className="zodiac-symbol" style={{ color: position.sign.color }}>
            {position.sign.symbol}
          </span>
        </div>

        <div className="zodiac-info">
          <h3 className="zodiac-sign-name" style={{ color: position.sign.color }}>
            {position.sign.symbol} {signName}
          </h3>
          <p className="zodiac-degree">
            {position.degreeInSign}° in {signName}
          </p>

          <div className="zodiac-progress-bar">
            <div
              className="zodiac-progress-fill"
              style={{
                width: `${((position.degreeInSign / 30) * 100).toFixed(1)}%`,
                background: position.sign.color,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ZodiacCard, (prev, next) => {
  return Math.floor(prev.date.getTime() / 60000) === Math.floor(next.date.getTime() / 60000)
})
