import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useI18n } from '../i18n/LanguageContext'
import { useLocation } from '../hooks/useLocation'
import { ORGAN_SLOTS } from '../lib/organClock'
import {
  clearAllAppData,
  downloadBackup,
  mergeFavorites,
  parseBackup,
} from '../lib/dataPortability'
import type { GeoLocation } from '../types'
import EmbedGeneratorModal from './EmbedGeneratorModal'

interface SettingsPanelProps {
  location: GeoLocation | null
  onClose: () => void
}

/** Liest den aktuellen Notification-Permission-Status synchron. */
function readPermission(): NotificationPermission | null {
  if (typeof Notification === 'undefined') return null
  return Notification.permission
}

export default function SettingsPanel({ location, onClose }: SettingsPanelProps) {
  const { settings, setTheme, setNotifications, updateSettings } = useSettings()
  const { t, setLang } = useI18n()
  const loc = useLocation()
  const [showEmbedModal, setShowEmbedModal] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | null>(readPermission)

  // Daten-Export/Import/Reset: Feedback-Status + File-Input-Ref.
  const [dataFeedback, setDataFeedback] = useState<{ kind: 'ok' | 'error'; msg: string } | null>(
    null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const feedbackTimer = useRef<number | null>(null)

  /** Setzt eine Feedback-Nachricht und blendet sie nach 4s aus. */
  const showFeedback = (kind: 'ok' | 'error', msg: string) => {
    setDataFeedback({ kind, msg })
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current)
    feedbackTimer.current = window.setTimeout(() => setDataFeedback(null), 4000)
  }

  // Reaktive Permission-Beobachtung: Aktualisiert den Status, wenn sich die
  // Berechtigung ändert – egal ob durch unseren eigenen Prompt, durch eine
  // Browser-Einstellung oder durch einen Tab-Wechsel. Nutzt die Permissions
  // API, wenn verfügbar (Chrome/Edge/Firefox); Fallback auf direkten Read
  // bei Browsern ohne Permissions API (z.B. ältere Safari).
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return
    let status: PermissionStatus | null = null
    let cancelled = false
    navigator.permissions
      .query({ name: 'notifications' as PermissionName })
      .then((s) => {
        if (cancelled) return
        status = s
        setPermission(s.state as NotificationPermission)
        status.onchange = () => {
          setPermission(status!.state as NotificationPermission)
        }
      })
      .catch(() => {
        /* Permissions API unterstützt 'notifications' nicht → Fallback. */
      })
    return () => {
      cancelled = true
      if (status) status.onchange = null
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const notif = settings.notifications
  const hasPermission = permission === 'granted'
  const isDenied = permission === 'denied'

  const handleRequestPermission = async () => {
    if (typeof Notification === 'undefined') return
    const perm = await Notification.requestPermission()
    // State in jedem Fall aktualisieren (auch bei 'denied'/'default'), damit
    // die UI sofort reagiert, selbst wenn die Permissions API keinen
    // onchange-Event liefert.
    setPermission(perm)
    if (perm === 'granted') {
      setNotifications({ enabled: true })
    }
  }

  const toggleOrganSelect = (organKey: string) => {
    const current = notif.selectedOrgans
    const next = current.includes(organKey)
      ? current.filter((k) => k !== organKey)
      : [...current, organKey]
    setNotifications({ selectedOrgans: next })
  }

  /* ---------- Daten-Export / Import / Reset ---------- */

  const handleExport = () => {
    try {
      downloadBackup()
      showFeedback('ok', t.dataExported)
    } catch {
      showFeedback('error', t.dataImportError)
    }
  }

  const handleImportClick = () => {
    // Datei-Dialog öffnen; das eigentliche Lesen passiert in onFileChange.
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Input zurücksetzen, damit dieselbe Datei wiederholt gewählt werden kann.
    e.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const result = parseBackup(text)
      if (!result.ok) {
        showFeedback('error', t.dataImportError)
        return
      }
      const { data } = result
      // Favoriten zusammenführen (Merge, kein Datenverlust).
      const merged = mergeFavorites(loc.favorites, data.favorites)
      loc.setFavorites(merged)
      // Settings + Sprache überschreiben (nur falls im Backup vorhanden).
      if (data.settings) updateSettings(data.settings)
      if (data.language) setLang(data.language)
      showFeedback('ok', t.dataImported.replace('{count}', String(merged.length)))
    } catch {
      showFeedback('error', t.dataImportError)
    }
  }

  const handleReset = () => {
    if (!window.confirm(t.dataResetConfirm)) return
    clearAllAppData()
    showFeedback('ok', t.dataResetDone)
    // Reload ist der robusteste Weg, alle Provider sauber neu zu initialisieren
    // (Settings/Language/Favorites lesen beim Mount aus localStorage).
    setTimeout(() => window.location.reload(), 600)
  }

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

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div
          ref={modalRef}
          className="modal-content settings-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={t.settingsTitle}
        >
          <div className="modal-header">
            <h3>⚙ {t.settingsTitle}</h3>
            <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="settings-body">
            {/* 1. Theme / Rotlichtmodus */}
            <section className="settings-section">
              <h4>🎨 {t.themeTitle}</h4>
              <div className="theme-options">
                <button
                  type="button"
                  className={`theme-card ${settings.theme === 'default' ? 'active' : ''}`}
                  onClick={() => setTheme('default')}
                >
                  <span className="theme-preview default-preview" />
                  <span>{t.themeDefault}</span>
                </button>
                <button
                  type="button"
                  className={`theme-card ${settings.theme === 'nightshift' ? 'active' : ''}`}
                  onClick={() => setTheme('nightshift')}
                >
                  <span className="theme-preview nightshift-preview" />
                  <span>{t.themeNightshift}</span>
                </button>
              </div>
            </section>

            {/* 2. Notifications */}
            <section className="settings-section">
              <h4>🔔 {t.notificationsTitle}</h4>
              <div className="setting-toggle-row">
                <label htmlFor="notif-master-toggle" className="toggle-label">
                  <strong>{t.enableNotifications}</strong>
                </label>
                <input
                  id="notif-master-toggle"
                  type="checkbox"
                  className="switch-input"
                  checked={notif.enabled}
                  onChange={(e) => {
                    if (e.target.checked && !hasPermission) {
                      handleRequestPermission()
                    } else {
                      setNotifications({ enabled: e.target.checked })
                    }
                  }}
                />
              </div>

              {isDenied && (
                <div className="setting-alert error">{t.notifPermissionDenied}</div>
              )}

              {!hasPermission && !isDenied && permission !== null && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleRequestPermission}
                  style={{ marginTop: 8 }}
                >
                  {t.notifPermissionPrompt}
                </button>
              )}

              {notif.enabled && (
                <div className="notification-subsettings">
                  <div className="setting-toggle-row">
                    <label htmlFor="notif-organ-change" className="toggle-label">
                      {t.notifOrganChange}
                    </label>
                    <input
                      id="notif-organ-change"
                      type="checkbox"
                      className="switch-input"
                      checked={notif.organChange}
                      onChange={(e) => setNotifications({ organChange: e.target.checked })}
                    />
                  </div>

                  {notif.organChange && (
                    <div className="organ-chips-section">
                      <label className="sub-label">{t.notifSelectedOrgans}</label>
                      <div className="organ-chips">
                        {ORGAN_SLOTS.map((slot) => {
                          const isSelected = notif.selectedOrgans.includes(slot.key)
                          return (
                            <button
                              key={slot.key}
                              type="button"
                              className={`organ-chip ${isSelected ? 'selected' : ''}`}
                              onClick={() => toggleOrganSelect(slot.key)}
                            >
                              {t.organs[slot.key]}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="setting-toggle-row">
                    <label htmlFor="notif-fullmoon" className="toggle-label">
                      {t.notifFullMoon}
                    </label>
                    <input
                      id="notif-fullmoon"
                      type="checkbox"
                      className="switch-input"
                      checked={notif.fullMoonWeek}
                      onChange={(e) => setNotifications({ fullMoonWeek: e.target.checked })}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* 3. Embed Widget Modal Launcher */}
            <section className="settings-section">
              <h4>📦 {t.embedWidgetTitle}</h4>
              <p className="section-desc">{t.embedWidgetDesc}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowEmbedModal(true)}
              >
                ⚡ {t.embedGenerateCode}
              </button>
            </section>

            {/* 4. Daten-Export / Import / Reset */}
            <section className="settings-section">
              <h4>💾 {t.dataTitle}</h4>
              <p className="section-desc">{t.dataDesc}</p>

              {/* Versteckter File-Input für den Import. */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <div className="data-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleExport}
                >
                  ⬇ {t.dataExport}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleImportClick}
                >
                  ⬆ {t.dataImport}
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleReset}
                >
                  🗑 {t.dataReset}
                </button>
              </div>

              {dataFeedback && (
                <div className={`setting-alert ${dataFeedback.kind === 'ok' ? 'success' : 'error'}`}>
                  {dataFeedback.msg}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {showEmbedModal && (
        <EmbedGeneratorModal location={location} onClose={() => setShowEmbedModal(false)} />
      )}
    </>
  )
}
