import { useEffect, useRef, useState } from 'react'
import type { EmbedView, GeoLocation, Theme } from '../types'
import { useI18n } from '../i18n/LanguageContext'

interface EmbedGeneratorModalProps {
  location: GeoLocation | null
  onClose: () => void
}

export default function EmbedGeneratorModal({ location, onClose }: EmbedGeneratorModalProps) {
  const { t, lang } = useI18n()
  const [view, setView] = useState<EmbedView>('organ')
  const [theme, setTheme] = useState<Theme>('default')
  const [width, setWidth] = useState('100%')
  const [height, setHeight] = useState('420')
  const [copied, setCopied] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus-Trap & Escape-Key-Handling für Barrierefreiheit
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

  const lat = location?.latitude ?? 52.52
  const lng = location?.longitude ?? 13.405

  // Absolute URL ermitteln (Origin + Pfad ohne index.html, ohne trailing slash).
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname.replace(/\/index\.html$/, '') : ''
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

  // Query-String über URLSearchParams → automatisches Encoding aller Werte
  // schließt Attribut-Injection im src des iframes aus.
  const sp = new URLSearchParams({
    view,
    lang,
    theme,
    lat: lat.toFixed(4),
    lng: lng.toFixed(4),
  })
  const embedUrl = `${cleanBase}/embed.html?${sp.toString()}`

  // Positiv-Whitelist: nur reine Zahlen oder "Zahlen%" sind erlaubt.
  // Alles andere fällt auf den Default zurück – kein Quote/Space/Backslash
  // kann in das width/height-Attribut des Snippets gelangen.
  const sanitizeDim = (raw: string, fallback: string): string => {
    const v = raw.trim()
    if (/^\d{1,4}%$/.test(v)) return v
    if (/^\d{1,5}$/.test(v)) return v
    return fallback
  }
  const cleanWidth = sanitizeDim(width, '100%')
  const cleanHeight = sanitizeDim(height, '420')

  // Sandbox: allow-scripts ohne allow-same-origin → Embed darf kein localStorage,
  // keine Cookies, keine Geolocation/Notifications der Eltern-Origin verwenden.
  // loading="lazy" + referrerpolicy schonen Privatsphäre und Performance.
  const iframeSnippet = `<iframe src="${embedUrl}" width="${cleanWidth}" height="${cleanHeight}" style="border:none; border-radius:16px; width:100%; max-width:600px; overflow:hidden;" title="Solar Time Widget" loading="lazy" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts"></iframe>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(t.embedCopyCode, iframeSnippet)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal-content embed-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t.embedWidgetTitle}
      >
        <div className="modal-header">
          <h3>{t.embedWidgetTitle}</h3>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <p className="embed-desc">{t.embedWidgetDesc}</p>

        <div className="embed-form">
          <div className="form-group">
            <label>{t.embedViewLabel}</label>
            <div className="btn-group">
              <button
                type="button"
                className={`btn btn-sm ${view === 'organ' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setView('organ')}
              >
                {t.organClock}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${view === 'solar' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setView('solar')}
              >
                {t.trueSolarTime}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${view === 'moon' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setView('moon')}
              >
                {t.moonPhase}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>{t.themeTitle}</label>
            <div className="btn-group">
              <button
                type="button"
                className={`btn btn-sm ${theme === 'default' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTheme('default')}
              >
                {t.themeDefault}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${theme === 'nightshift' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTheme('nightshift')}
              >
                {t.themeNightshift}
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t.embedWidthLabel}</label>
              <input
                type="text"
                className="input-field"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>{t.embedHeightLabel}</label>
              <input
                type="text"
                className="input-field"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Preview</label>
            <div className="iframe-preview-wrap">
              <iframe
                src={embedUrl}
                width="100%"
                height={cleanHeight}
                style={{ border: 'none', borderRadius: '12px', background: 'transparent' }}
                title="Widget Preview"
                sandbox="allow-scripts"
                referrerPolicy="no-referrer-when-downgrade"
                loading="lazy"
              />
            </div>
          </div>

          <div className="form-group">
            <label>HTML Embed Code</label>
            <div className="code-box-wrap">
              <textarea className="code-textarea" readOnly value={iframeSnippet} rows={3} />
              <button type="button" className="btn btn-primary btn-copy" onClick={handleCopy}>
                {copied ? t.embedCopied : t.embedCopyCode}
              </button>
            </div>
          </div>

          <div className="instructions-box">
            <h4>{t.embedInstructionsTitle}</h4>
            <ol>
              <li>{t.embedInstruction1}</li>
              <li>{t.embedInstruction2}</li>
              <li>{t.embedInstruction3}</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
