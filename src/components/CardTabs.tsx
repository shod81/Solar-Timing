import { memo } from 'react'

/** Identifikation einer Karte im mobilen Tab-Layout. */
export type CardTabId =
  | 'solar'
  | 'arc'
  | 'organ'
  | 'nutrition'
  | 'profile'
  | 'planetary'
  | 'moon'
  | 'zodiac'

export interface CardTab {
  id: CardTabId
  /** Kleines Icon (Emoji) für die Tab-Leiste auf schmalen Viewports. */
  icon: string
  /** Kurzes Label für die Tab-Leiste (via t.tabShort*). */
  shortLabel: string
  /** Vollständiger Titel für den aria-label / title. */
  fullLabel: string
}

interface CardTabsProps {
  tabs: CardTab[]
  active: CardTabId
  onChange: (id: CardTabId) => void
}

/**
 * Horizontale, scrollbar-Tab-Leiste für das mobile Karten-Layout.
 * Nur auf Viewports <= 768px sichtbar (via CSS). Auf Desktop bleibt die
 * klassische Untereinander-Darstellung der Karten erhalten.
 */
export default memo(function CardTabs({ tabs, active, onChange }: CardTabsProps) {
  return (
    <nav className="card-tabs" aria-label="Card navigation">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            className={`card-tab ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(tab.id)}
            title={tab.fullLabel}
          >
            <span className="card-tab-icon" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="card-tab-label">{tab.shortLabel}</span>
          </button>
        )
      })}
    </nav>
  )
})
