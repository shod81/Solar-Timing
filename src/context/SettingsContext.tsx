import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Settings, Theme } from '../types'
import { readUrlParams, writeUrlParams } from '../lib/permalink'

const STORAGE_KEY = 'solartime.settings'

const DEFAULT_SETTINGS: Settings = {
  theme: 'default',
  notifications: {
    enabled: false,
    organChange: false,
    selectedOrgans: [],
    fullMoonWeek: true,
  },
}

interface SettingsContextValue {
  settings: Settings
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setNotifications: (next: Partial<Settings['notifications']>) => void
  updateSettings: (next: Partial<Settings>) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

/** Lädt Settings aus localStorage (mit Validierung/Fallback). */
function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      theme: parsed.theme === 'nightshift' ? 'nightshift' : 'default',
      notifications: {
        enabled: !!parsed.notifications?.enabled,
        organChange: !!parsed.notifications?.organChange,
        selectedOrgans: Array.isArray(parsed.notifications?.selectedOrgans)
          ? parsed.notifications!.selectedOrgans.filter((o) => typeof o === 'string')
          : [],
        fullMoonWeek: parsed.notifications?.fullMoonWeek ?? true,
      },
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const loaded = loadSettings()
    // URL-Override hat höchste Priorität.
    const url = readUrlParams()
    if (url.theme) loaded.theme = url.theme
    if (url.notif !== undefined) loaded.notifications.enabled = url.notif
    return loaded
  })

  // Persistenz + Theme auf <html> anwenden + URL aktuell halten.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* ignore */
    }
    // Theme-Attribut + theme-color (PWA-Chrome).
    document.documentElement.setAttribute('data-theme', settings.theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', settings.theme === 'nightshift' ? '#1a0606' : '#0a0e1a')
    }
    // Theme & Notif-Status in die URL schreiben (Standort & Sprache bleiben
    // unangetastet, sie werden von useLocation bzw. LanguageContext gepflegt).
    writeUrlParams({
      theme: settings.theme,
      notif: settings.notifications.enabled,
    })
  }, [settings])

  const setTheme = useCallback((theme: Theme) => {
    setSettings((s) => ({ ...s, theme }))
  }, [])

  const toggleTheme = useCallback(() => {
    setSettings((s) => ({ ...s, theme: s.theme === 'nightshift' ? 'default' : 'nightshift' }))
  }, [])

  const setNotifications = useCallback((next: Partial<Settings['notifications']>) => {
    setSettings((s) => ({ ...s, notifications: { ...s.notifications, ...next } }))
  }, [])

  const updateSettings = useCallback((next: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...next }))
  }, [])

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, setTheme, toggleTheme, setNotifications, updateSettings }),
    [settings, setTheme, toggleTheme, setNotifications, updateSettings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

/** Hook: Zugriff auf die Einstellungen. */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider')
  return ctx
}
