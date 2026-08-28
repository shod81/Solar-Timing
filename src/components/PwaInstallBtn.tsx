import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/LanguageContext'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA-Installations-Button & iOS-Helper Modal.
 *
 * Erlaubt es Nutzern (Android/Chrome/Edge & iOS/Safari), Solar Time
 * direkt als Native App auf ihrem Smartphone/Desktop-Startbildschirm zu installieren.
 */
export default function PwaInstallBtn() {
  const { t } = useI18n()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showIosModal, setShowIosModal] = useState(false)

  useEffect(() => {
    // Prüfen, ob die App bereits im Standalone-Modus (installiert) läuft.
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true
      setIsStandalone(isStandaloneMode)

      // iOS Erkennung
      const ua = navigator.userAgent || ''
      const isIosDevice =
        /iPhone|iPad|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      setIsIos(isIosDevice)
    }

    // Chrome/Android/Edge Event-Listener für das PWA Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Wenn bereits im Standalone-Modus, Button ausblenden.
  if (isStandalone) return null

  // Button nur anzeigen, wenn das Browser-Prompt bereitsteht ODER wenn es ein iOS Gerät ist.
  if (!deferredPrompt && !isIos) return null

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else if (isIos) {
      setShowIosModal(true)
    }
  }

  return (
    <>
      <button
        type="button"
        className="pwa-install-btn"
        onClick={handleInstallClick}
        title={t.pwaInstallBtn || 'Solar Time installieren'}
      >
        <svg
          className="pwa-icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
          <path d="M12 6v6m-3-3 3 3 3-3" />
        </svg>
        <span>{t.pwaInstallBtn || 'App installieren'}</span>
      </button>

      {/* iOS Modal Anleitung */}
      {showIosModal && (
        <div className="modal-overlay" onClick={() => setShowIosModal(false)}>
          <div
            className="modal-card pwa-ios-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <span style={{ fontSize: '1.4rem' }}>📱</span>
                <h3>{t.pwaInstallTitle || 'Solar Time installieren'}</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowIosModal(false)}
                aria-label="Schließen"
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center', padding: '16px 8px' }}>
              <p className="pwa-ios-text" style={{ fontSize: '0.98rem', lineHeight: 1.6, color: 'var(--text-bright)' }}>
                {t.pwaInstallIosHint ||
                  'Auf iOS / Safari: Tippen Sie unten auf das Teilen-Symbol ⎋ und wählen Sie „Zum Home-Bildschirm“.'}
              </p>
              <div className="pwa-ios-icon-guide" style={{ fontSize: '2.5rem', margin: '14px 0 6px 0' }}>
                ⎋ ➔ ➕📱
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowIosModal(false)}
              >
                Verstanden
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
