import { useState } from 'react'
import type { Element } from '../types'
import { ELEMENT_COLORS, formatWindow } from '../lib/organClock'
import { useI18n } from '../i18n/LanguageContext'

interface OrganDetailCardProps {
  organKey: string
  element: Element
  startHour: number
  isCurrentActive: boolean
}

export default function OrganDetailCard({
  organKey,
  element,
  startHour,
  isCurrentActive,
}: OrganDetailCardProps) {
  const { t } = useI18n()
  const [collapsed, setCollapsed] = useState(false)

  const organName = t.organs[organKey] || organKey
  const elementName = t.elements[element] || element
  const windowStr = formatWindow(startHour)
  const elementColor = ELEMENT_COLORS[element]

  const details = t.organDetails?.[organKey]

  return (
    <div
      className={`organ-detail-card ${collapsed ? 'collapsed' : ''}`}
      style={{ borderLeftColor: elementColor }}
    >
      <button
        type="button"
        className="organ-detail-header"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="organ-detail-title-group">
          <span
            className="organ-element-badge"
            style={{ backgroundColor: elementColor }}
          >
            {elementName}
          </span>
          <span className="organ-detail-title">
            {organName} <span className="organ-window-time">({windowStr})</span>
          </span>
          {isCurrentActive && <span className="active-badge">{t.organActiveNow}</span>}
        </span>
        <span className="organ-detail-toggle" aria-hidden="true">
          {collapsed ? '▲' : '▼'}
        </span>
      </button>

      {!collapsed && details && (
        <div className="organ-detail-body">
          <div className="organ-detail-section">
            <h4 className="section-title">
              <span className="section-icon">❖</span> {t.activitiesTitle}
            </h4>
            <ul className="detail-list">
              {details.activities.map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>

          {details.nutrition && details.nutrition.length > 0 && (
            <div className="organ-detail-section">
              <h4 className="section-title">
                <span className="section-icon">☕</span> {t.nutritionTitle}
              </h4>
              <ul className="detail-list">
                {details.nutrition.map((nut, i) => (
                  <li key={i}>{nut}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="organ-detail-section">
            <h4 className="section-title">
              <span className="section-icon">🎯</span> {t.acupressureTitle}
            </h4>
            <div className="acupressure-cards">
              {details.acupressure.map((acu, i) => (
                <div key={i} className="acupressure-card">
                  <strong className="acu-name">{acu.name}</strong>
                  <p className="acu-desc">{acu.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
