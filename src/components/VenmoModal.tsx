import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n/LanguageContext'
import { VENMO_DONATE_URL } from '../lib/paypal'

interface VenmoModalProps {
  onClose: () => void
}

/**
 * Modal-Hinweis für Venmo-Spenden an den User @Hodrius.
 */
export default function VenmoModal({ onClose }: VenmoModalProps) {
  const { t } = useI18n()
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const modalEl = modalRef.current
    if (!modalEl) return

    const focusableEls = modalEl.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const firstEl = focusableEls[0]
    const lastEl = focusableEls[focusableEls.length - 1]

    firstEl?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault()
            lastEl?.focus()
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault()
            firstEl?.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal-card venmo-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="venmo-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <svg
              className="venmo-icon modal-venmo-icon"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M19.5 3c.9 1.5 1.3 3.1 1.3 4.9 0 6.2-5.3 12.6-9.6 18.1H4.8L1 4.5l5.5-.5 2.1 14.1c1.9-3.1 4.3-7.7 4.3-10.4 0-1.4-.4-2.4-1.2-3.1L19.5 3z" />
            </svg>
            <h3 id="venmo-modal-title">{t.venmoModalTitle}</h3>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="venmo-info-card">
            <p className="venmo-hint-text">{t.venmoModalText}</p>

            <div className="venmo-user-badge">
              <span className="badge-label">Venmo / PayPal Handle</span>
              <span className="badge-username">@Hodrius</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <a
            href={VENMO_DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary venmo-modal-action"
            onClick={onClose}
          >
            ↗ {t.venmoOpenLink}
          </a>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
}
