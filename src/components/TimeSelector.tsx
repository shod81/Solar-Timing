import { useI18n } from '../i18n/LanguageContext'

interface TimeSelectorProps {
  /** Aktuell wirksames Datum (Echtzeit oder gewähltes Datum). */
  currentDate: Date
  /** Ob sich die App im Live-Modus befindet. */
  isLive: boolean
  /** Callback wenn ein benutzerdefiniertes Datum gewählt wird. */
  onSelectDate: (date: Date) => void
  /** Callback um in den Live-Modus zurückzukehren. */
  onResetToLive: () => void
}

/** Formatier-Hilfe für <input type="datetime-local" /> */
function toDatetimeLocalString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

/**
 * Komponente für die Datum- und Uhrzeitauswahl.
 * Erlaubt das Berechnen der wahren Sonnenzeit & Mondphase für beliebige Zeitpunkte.
 */
export default function TimeSelector({
  currentDate,
  isLive,
  onSelectDate,
  onResetToLive,
}: TimeSelectorProps) {
  const { t } = useI18n()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!val) return
    const parsed = new Date(val)
    if (!isNaN(parsed.getTime())) {
      onSelectDate(parsed)
    }
  }

  const handleSeasonSelect = (monthIndex: number, day: number) => {
    const year = currentDate.getFullYear()
    const target = new Date(year, monthIndex, day, 12, 0, 0)
    onSelectDate(target)
  }

  return (
    <div className="time-selector-container">
      <div className="time-selector-row">
        <div className="time-input-group">
          <label htmlFor="solar-datetime-picker" className="time-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {t.timeSelectionLabel}
          </label>

          <input
            id="solar-datetime-picker"
            type="datetime-local"
            value={toDatetimeLocalString(currentDate)}
            onChange={handleChange}
            className={`time-input ${!isLive ? 'is-custom' : ''}`}
          />
        </div>

        <div className="time-actions">
          <button
            type="button"
            onClick={onResetToLive}
            disabled={isLive}
            className={`btn ${!isLive ? 'btn-primary' : 'btn-disabled'}`}
            title={t.resetToLive}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {t.resetToLive}
          </button>

          <span className={`time-mode-badge ${isLive ? 'live' : 'custom'}`}>
            <span className="mode-dot" />
            {isLive ? t.liveTime : t.customTime}
          </span>
        </div>
      </div>

      <div className="season-quick-select">
        <span className="season-label">{t.seasonsQuickSelect}:</span>
        <div className="season-buttons">
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => handleSeasonSelect(2, 20)}
          >
            🌱 {t.springEquinox}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => handleSeasonSelect(5, 21)}
          >
            ☀️ {t.summerSolstice}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => handleSeasonSelect(8, 22)}
          >
            🍂 {t.autumnEquinox}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => handleSeasonSelect(11, 21)}
          >
            ❄️ {t.winterSolstice}
          </button>
        </div>
      </div>
    </div>
  )
}
