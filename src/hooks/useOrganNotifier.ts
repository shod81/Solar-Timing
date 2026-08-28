import { useEffect, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useI18n } from '../i18n/LanguageContext'
import { getActiveSlot, formatWindow } from '../lib/organClock'
import { computeMoonPhase } from '../lib/moonPhase'

/**
 * Hook: Sendet lokale Browser-Notifications beim Organwechsel und Vollmondwoche-Eintritt.
 */
export function useOrganNotifier(
  trueSolarHours: number | null,
  effectiveDate: Date,
  hasLocation: boolean,
) {
  const { settings } = useSettings()
  const { t } = useI18n()

  const prevOrganKeyRef = useRef<string | null>(null)
  const prevIsFullMoonWeekRef = useRef<boolean | null>(null)
  // Trackt den zuletzt beobachteten "aktiviert"-Status. Wechselt er von
  // deaktiviert→aktiviert (oder beim ersten Aktivieren überhaupt), gilt der
  // nächste Effekt-Lauf als Initialisierung – dann wird die Referenz für die
  // Vollmondwoche gesetzt, ohne sofort eine Notification zu feuern.
  const prevEnabledRef = useRef(false)

  useEffect(() => {
    if (!hasLocation || trueSolarHours === null) return
    if (!settings.notifications.enabled) {
      prevEnabledRef.current = false
      return
    }
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      prevEnabledRef.current = false
      return
    }

    const wasJustEnabled = !prevEnabledRef.current
    prevEnabledRef.current = true

    const hour = Math.floor(((trueSolarHours % 24) + 24) % 24)
    const active = getActiveSlot(hour)

    // 1. Check Organwechsel
    if (prevOrganKeyRef.current !== null && prevOrganKeyRef.current !== active.key) {
      if (settings.notifications.organChange) {
        const selected = settings.notifications.selectedOrgans
        const isMatch = selected.length === 0 || selected.includes(active.key)

        if (isMatch) {
          const organName = t.organs[active.key] || active.key
          const windowStr = formatWindow(active.startHour)
          const title = t.notifTitleOrgan
            ? t.notifTitleOrgan.replace('{organ}', organName).replace('{window}', windowStr)
            : `${organName} (${windowStr})`

          const details = t.organDetails?.[active.key]
          const body = details?.activities?.[0] || `${t.organClock}: ${organName}`

          try {
            new Notification(title, {
              body,
              icon: '/favicon.svg',
              tag: `organ-${active.key}`,
            })
          } catch {
            /* ignore notification errors */
          }
        }
      }
    }
    prevOrganKeyRef.current = active.key

    // 2. Check Vollmondwoche – beim (Re-)Aktivieren der Notifications nur
    //    den Referenzwert setzen, aber nicht sofort feuern (vermeidet
    //    überraschende Notification beim bloßen Einschalten).
    const moon = computeMoonPhase(effectiveDate)
    if (
      !wasJustEnabled &&
      settings.notifications.fullMoonWeek &&
      prevIsFullMoonWeekRef.current === false &&
      moon.isFullMoonWeek
    ) {
      try {
        new Notification(t.notifTitleFullMoon || 'Vollmondwoche', {
          body: t.notifBodyFullMoon || 'Die Vollmondwoche hat begonnen.',
          icon: '/favicon.svg',
          tag: 'fullmoon-week',
        })
      } catch {
        /* ignore */
      }
    }
    prevIsFullMoonWeekRef.current = moon.isFullMoonWeek
  }, [trueSolarHours, effectiveDate, hasLocation, settings.notifications, t])
}
