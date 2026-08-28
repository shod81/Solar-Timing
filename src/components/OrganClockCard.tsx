import { memo, useEffect, useState } from 'react'
import { useI18n } from '../i18n/LanguageContext'
import {
  ELEMENT_COLORS,
  ORGAN_SLOTS,
  formatWindow,
  getActiveSlot,
} from '../lib/organClock'
import OrganWheel from './OrganWheel'
import OrganDetailCard from './OrganDetailCard'

interface OrganClockCardProps {
  /** Wahre Sonnenzeit als Dezimalstunden (0–24). */
  trueSolarHours: number
}

function OrganClockCard({ trueSolarHours }: OrganClockCardProps) {
  const { t } = useI18n()
  const hour = Math.floor(((trueSolarHours % 24) + 24) % 24)
  const active = getActiveSlot(hour)

  const [selectedKey, setSelectedKey] = useState<string>(active.key)
  const [userSelected, setUserSelected] = useState(false)

  // Wenn das aktive Organ wechselt (Zeitverlauf) und der User nicht manuell gewählt hat, folgen.
  useEffect(() => {
    if (!userSelected) {
      setSelectedKey(active.key)
    }
  }, [active.key, userSelected])

  const handleSelect = (key: string) => {
    setSelectedKey(key)
    setUserSelected(true)
  }

  // Ausgewählter Organ-Slot
  const selectedSlot = ORGAN_SLOTS.find((s) => s.key === selectedKey) || active

  return (
    <section className="card">
      <h2 className="card-title">
        <span className="dot" style={{ background: 'var(--el-fire)', boxShadow: '0 0 10px var(--el-fire)' }} />
        {t.organClock}
      </h2>

      <div className="organ-grid">
        <div className="organ-wheel-wrap">
          <OrganWheel
            activeHour={hour}
            selectedKey={selectedKey}
            onSelect={handleSelect}
            size={340}
          />
        </div>

        <div className="organ-active">
          <div className="organ-active-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)' }}>
            {t.organActiveNow}
          </div>
          <div className="organ-name">{t.organs[active.key]}</div>
          <div className="organ-time">{formatWindow(active.startHour)} {t.trueSolarTime.toLowerCase()}</div>
          <div
            className="organ-desc"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 8,
            }}
          >
            <span
              className="swatch"
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: ELEMENT_COLORS[active.element],
                boxShadow: `0 0 10px ${ELEMENT_COLORS[active.element]}`,
                flex: 'none',
              }}
            />
            {t.elements[active.element]}
          </div>
        </div>
      </div>

      <ul className="organ-list">
        {ORGAN_SLOTS.map((slot) => {
          const isActive = slot.key === active.key
          const isSelected = slot.key === selectedKey
          return (
            <li
              key={slot.key}
              className={`${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => handleSelect(slot.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelect(slot.key)
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <span className="swatch" style={{ background: ELEMENT_COLORS[slot.element] }} />
              <span>
                {t.organs[slot.key]} · {formatWindow(slot.startHour)}
              </span>
            </li>
          )
        })}
      </ul>

      {/* Detaillierte TCM-Praxiskarte für das gewählte/aktive Organ */}
      <OrganDetailCard
        organKey={selectedSlot.key}
        element={selectedSlot.element}
        startHour={selectedSlot.startHour}
        isCurrentActive={selectedSlot.key === active.key}
      />
    </section>
  )
}

export default memo(OrganClockCard, (prev, next) => {
  return Math.floor(prev.trueSolarHours * 60) === Math.floor(next.trueSolarHours * 60)
})
