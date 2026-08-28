/**
 * (C) Stefan Hodrius - Die Solar Timing App unterliegt der GPL GNU General Public License
 * und kann mit Namensnennung und unter Beibehaltung der Lizenzbedingungen frei weiterverwendet werden.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './i18n/LanguageContext'
import { SettingsProvider } from './context/SettingsContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// Service Worker registrieren (PWA / Offline). Nur in Produktion,
// damit Hot-Reload im Dev-Modus nicht gecacht wird.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* SW-Registrierung fehlgeschlagen – App läuft trotzdem online. */
    })
  })
}
