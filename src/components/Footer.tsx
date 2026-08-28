import { memo } from 'react'
import { useI18n } from '../i18n/LanguageContext'

/** Fußzeile mit OSM-Attribution und Hinweis. */
export default memo(function Footer() {
  const { t } = useI18n()
  // Ersetzt den {name}-Platzhalter durch den hervorgehobenen Namen. Robust
  // gegenüber fehlendem, mehrfach oder gar nicht vorhandenem Platzhalter:
  // fehlt {name}, wird der String unverändert gerendert.
  const hasPlaceholder = t.footerDedication.includes('{name}')
  const dedication = hasPlaceholder
    ? t.footerDedication.split('{name}')
    : null

  return (
    <footer className="app-footer">
      <p>{t.footerNote}</p>
      <p>
        {t.footerOsm} ·{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer noopener">
          openstreetmap.org/copyright
        </a>
      </p>
      <p className="footer-dedication">
        {dedication && dedication.length >= 2 ? (
          <>
            {dedication[0]}
            <span className="adano-ley-pulse">{t.adanoLeyName}</span>
            {dedication.slice(1).join('{name}')}
          </>
        ) : (
          t.footerDedication
        )}
      </p>
    </footer>
  )
})
