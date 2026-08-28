import { memo, useMemo } from 'react'
import { useI18n } from '../i18n/LanguageContext'
import {
  computeMoonPhase,
  findNextPhase,
  moonriseMoonset,
  SYNODIC_PERIOD,
} from '../lib/moonPhase'
import type { Language } from '../types'
import MoonGraphic from './MoonGraphic'
import MoonTimeline from './MoonTimeline'

interface MoonPhaseCardProps {
  date: Date
  /** Standort für Mondauf-/untergang (optional – ohne bleibt die Zeile weg). */
  latitude?: number
  longitude?: number
}

/**
 * Mondphasen-Karte mit zwei Darstellungen:
 *  1) Großes Mondicon, passend zur aktuellen Phase illuminiert.
 *  2) Horizontaler Zeitstrahl: Mond wandert durch den Monat,
 *     Vollmond liegt genau in der Mitte.
 *
 * Zusätzlich: Mondauf-/untergang am Standort + Termine des nächsten
 * Vollmonds/Neumonds.
 */
function MoonPhaseCard({ date, latitude, longitude }: MoonPhaseCardProps) {
  const { t, lang } = useI18n()
  const moon = computeMoonPhase(date)
  const illumPct = (moon.illumination * 100).toFixed(1)

  // Auf-/Untergang und nächste Phasen nur einmal pro Datum/Standort berechnen.
  const { rise, set: set_, nextFull, nextNew } = useMemo(() => {
    const rs =
      latitude !== undefined && longitude !== undefined
        ? moonriseMoonset(date, latitude, longitude)
        : { rise: null, set: null }
    return {
      rise: rs.rise,
      set: rs.set,
      nextFull: findNextPhase(date, 'full'),
      nextNew: findNextPhase(date, 'new'),
    }
  }, [date, latitude, longitude])

  let fullMoonMsg = ''
  if (moon.isFullMoonWeek) {
    fullMoonMsg = t.fullMoonWeek
  } else if (moon.daysToFullMoon >= 0) {
    fullMoonMsg = t.daysToFullMoon.replace('{days}', String(Math.round(moon.daysToFullMoon)))
  } else {
    fullMoonMsg = t.daysSinceFullMoon.replace('{days}', String(Math.round(-moon.daysToFullMoon)))
  }

  const hasCoords = latitude !== undefined && longitude !== undefined

  return (
    <section className="card">
      <h2 className="card-title">
        <span className="dot" style={{ background: 'var(--silver)', boxShadow: '0 0 10px var(--silver)' }} />
        {t.moonPhase}
      </h2>

      {/* Darstellung 1: Mondicon mit Phaseninfo */}
      <div className="moon-display">
        <MoonGraphic
          phase={moon.phase}
          illumination={moon.illumination}
          size={120}
          isFullMoonWeek={moon.isFullMoonWeek}
        />

        <div className="moon-info">
          <p className="moon-name">{t.phases[moon.phase]}</p>
          <p className="moon-illum">
            {t.illumination}: {illumPct}%
          </p>
          <p className="moon-cycle">
            {t.cycleDay
              .replace('{day}', String(moon.cycleDay))
              .replace('{total}', String(SYNODIC_PERIOD))}
          </p>
          {fullMoonMsg && <p className="moon-fullmsg">{fullMoonMsg}</p>}
        </div>
      </div>

      {/* Mondauf-/untergang am Standort */}
      {hasCoords && (
        <div className="moon-times">
          <MoonTimeCell label={t.moonrise} value={formatHM(rise) || t.notAvailable} />
          <MoonTimeCell label={t.moonset} value={formatHM(set_) || t.notAvailable} />
          <MoonTimeCell label={t.nextFullMoon} value={formatDateTime(nextFull, lang)} />
          <MoonTimeCell label={t.nextNewMoon} value={formatDateTime(nextNew, lang)} />
        </div>
      )}

      {/* Darstellung 2: Zeitstrahl mit wanderndem Mond, Vollmond in der Mitte */}
      <MoonTimeline moon={moon} />
    </section>
  )
}

function MoonTimeCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="moon-time-cell">
      <span className="moon-time-label">{label}</span>
      <span className="moon-time-value">{value}</span>
    </div>
  )
}

/** HH:MM eines Dates, interpretiert dessen UTC-Felder (lokal-agnostisch).
 *  Zeitanzeigen sind kulturübergreifend numerisch (24h); sprachspezifische
 *  Formatierung übernimmt formatDateTime. */
function formatHM(d: Date | null): string {
  if (!d) return ''
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

const LOCALE_MAP: Record<Language, string> = {
  de: 'de-DE',
  en: 'en-US',
  zh: 'zh-CN',
  hi: 'hi-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  ar: 'ar-SA',
  bn: 'bn-BD',
  ru: 'ru-RU',
  pt: 'pt-PT',
  ur: 'ur-PK',
  fi: 'fi-FI',
  ja: 'ja-JP',
  no: 'nb-NO',
  pl: 'pl-PL',
  nl: 'nl-NL',
  it: 'it-IT',
  da: 'da-DK',
  sv: 'sv-SE',
}

/** Lokalisiertes Datum + Uhrzeit (Wochentag, Datum, HH:MM). */
function formatDateTime(d: Date, lang: Language): string {
  const locale = LOCALE_MAP[lang] || 'en-US'
  const weekday = d.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' })
  const datePart = d.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const timePart = d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  })
  return `${weekday}, ${datePart}, ${timePart}`
}

export default memo(MoonPhaseCard, (prev, next) => {
  return (
    prev.latitude === next.latitude &&
    prev.longitude === next.longitude &&
    Math.floor(prev.date.getTime() / 60000) === Math.floor(next.date.getTime() / 60000)
  )
})
