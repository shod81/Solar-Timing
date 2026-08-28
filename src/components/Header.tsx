import { memo, useState } from 'react'
import { useI18n } from '../i18n/LanguageContext'
import { useSettings } from '../context/SettingsContext'
import type { GeoLocation } from '../types'
import { isPaypalSupported, isVenmoSupported, PAYPAL_DONATE_URL } from '../lib/paypal'
import LanguageToggle from './LanguageToggle'
import SettingsPanel from './SettingsPanel'
import VenmoModal from './VenmoModal'
import PwaInstallBtn from './PwaInstallBtn'

interface HeaderProps {
  location?: GeoLocation | null
}

/** Kopfbereich: Branding + Theme/Settings-Buttons + PWA Install + PayPal/Venmo Spenden + Sprachumschalter. */
export default memo(function Header({ location = null }: HeaderProps) {
  const { lang, t } = useI18n()
  const { settings, toggleTheme } = useSettings()
  const [showSettings, setShowSettings] = useState(false)
  const [showVenmoModal, setShowVenmoModal] = useState(false)

  const isNightshift = settings.theme === 'nightshift'

  return (
    <header className="app-header">
      <div className="brand">
        <svg
          className="brand-icon"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="hdr-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe9a8" />
              <stop offset="60%" stopColor="#f5b94c" />
              <stop offset="100%" stopColor="#c97e1b" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="8" fill="url(#hdr-sun)" />
          <g stroke="#f5b94c" strokeWidth="2" strokeLinecap="round">
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="16" y1="26" x2="16" y2="30" />
            <line x1="2" y1="16" x2="6" y2="16" />
            <line x1="26" y1="16" x2="30" y2="16" />
            <line x1="6.2" y1="6.2" x2="9" y2="9" />
            <line x1="23" y1="23" x2="25.8" y2="25.8" />
            <line x1="6.2" y1="25.8" x2="9" y2="23" />
            <line x1="23" y1="9" x2="25.8" y2="6.2" />
          </g>
        </svg>
        <div>
          <h1>{t.brandTitle}</h1>
          <p>{t.brandSubtitle}</p>
        </div>
      </div>

      <div className="header-actions">
        <PwaInstallBtn />

        {isPaypalSupported(lang) && (
          <a
            href={PAYPAL_DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="paypal-donate-btn"
            title={`${t.paypalDonate} (@Hodrius)`}
            aria-label={`${t.paypalDonate} (@Hodrius)`}
          >
            <svg
              className="paypal-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .761-.645h6.634c2.61 0 4.618.666 5.586 1.854.912 1.121 1.056 2.7.414 4.568-.787 2.292-2.39 3.931-4.638 4.742-1.077.388-2.383.565-3.882.565H7.728a.77.77 0 0 0-.76.646l-.892 5.887zm11.39-13.43c-.413-.509-1.205-.882-2.355-1.11a13.3 13.3 0 0 0-2.58-.236H9.155a.385.385 0 0 0-.38.323L7.54 14.887a.385.385 0 0 0 .38.445h2.158a.77.77 0 0 0 .76-.646l.758-4.999a.385.385 0 0 1 .38-.323h1.365c1.658 0 3.036-.263 3.978-.755.941-.492 1.637-1.309 2.067-2.428.43-1.119.344-2.12-.262-2.868z" />
            </svg>
            <span className="paypal-btn-text">{t.paypalDonate}</span>
          </a>
        )}

        {isVenmoSupported(lang) && (
          <button
            type="button"
            className="venmo-donate-btn"
            onClick={() => setShowVenmoModal(true)}
            title={`${t.venmoDonate} (@Hodrius)`}
            aria-label={`${t.venmoDonate} (@Hodrius)`}
          >
            <svg
              className="venmo-icon"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M19.5 3c.9 1.5 1.3 3.1 1.3 4.9 0 6.2-5.3 12.6-9.6 18.1H4.8L1 4.5l5.5-.5 2.1 14.1c1.9-3.1 4.3-7.7 4.3-10.4 0-1.4-.4-2.4-1.2-3.1L19.5 3z" />
            </svg>
            <span className="venmo-btn-text">{t.venmoDonate}</span>
          </button>
        )}

        <button
          type="button"
          className={`icon-btn theme-toggle ${isNightshift ? 'active' : ''}`}
          onClick={toggleTheme}
          title={t.themeToggleTip}
          aria-label={t.themeToggleTip}
        >
          {isNightshift ? '🔴' : '🌙'}
        </button>

        <button
          type="button"
          className="icon-btn settings-toggle"
          onClick={() => setShowSettings(true)}
          title={t.settingsTitle}
          aria-label={t.settingsTitle}
        >
          ⚙
        </button>

        <button
          type="button"
          className="icon-btn print-btn"
          onClick={() => window.print()}
          title={t.printPage}
          aria-label={t.printPage}
        >
          🖨️
        </button>

        <LanguageToggle />
      </div>

      {showSettings && (
        <SettingsPanel location={location} onClose={() => setShowSettings(false)} />
      )}

      {showVenmoModal && (
        <VenmoModal onClose={() => setShowVenmoModal(false)} />
      )}
    </header>
  )
})
