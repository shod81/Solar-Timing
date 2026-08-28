import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './i18n/LanguageContext'
import { SettingsProvider } from './context/SettingsContext'
import EmbedApp from './components/EmbedApp'
import './index.css'

const rootEl = document.getElementById('embed-root')
if (!rootEl) throw new Error('Root element #embed-root not found')

createRoot(rootEl).render(
  <StrictMode>
    <LanguageProvider>
      <SettingsProvider>
        <EmbedApp />
      </SettingsProvider>
    </LanguageProvider>
  </StrictMode>,
)
