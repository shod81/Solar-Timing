import type { GeoLocation, Language, Settings } from '../types'

/* ============================================================
   Daten-Portabilität: Backup (Export) / Restore (Import) /
   Reset der lokalen App-Daten (localStorage).

   Gesicherte Daten (alle clientseitig, keine Server):
     - Einstellungen (Theme + Notifications)   → solartime.settings
     - Favoriten (GeoLocation[])               → solartime.locations
     - Sprache                                 → solartime.lang
     - Letzter Standort (nur für Export)       → solartime.location

   Hinweis: Die localStorage-Keys müssen mit den Konstanten in
   useLocation.ts, SettingsContext.tsx und LanguageContext.tsx
   synchron bleiben.
   ============================================================ */

/** Aktuelle Backup-Schema-Version. Bei Breaking Changes inkrementieren. */
export const BACKUP_VERSION = 1

const KEYS = {
  settings: 'solartime.settings',
  favorites: 'solartime.locations',
  language: 'solartime.lang',
  location: 'solartime.location',
} as const

export interface BackupData {
  /** Schema-Version für Vorwärts/Rückwärts-Kompatibilität. */
  version: number
  /** ISO-Zeitstempel des Exports. */
  exportedAt: string
  /** App-Version (package.json), zur Diagnose. */
  appVersion: string | undefined
  settings: Settings | null
  favorites: GeoLocation[]
  language: Language | null
}

export interface ParseSuccess {
  ok: true
  data: BackupData
}
export interface ParseFailure {
  ok: false
  error: string
}
export type ParseResult = ParseSuccess | ParseFailure

/* ---------- localStorage-Helfer (fehlertolerant) ---------- */

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function readString(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/* ---------- Export ---------- */

/**
 * Assembliert ein Backup-Objekt aus den aktuellen localStorage-Daten.
 * Schlägt fehl? Nein – ungültige Einträge werden zu null, das Backup
 * bleibt immer gültig.
 */
export function buildBackup(): BackupData {
  const settings = readJSON<Settings>(KEYS.settings)
  const favoritesRaw = readJSON<unknown>(KEYS.favorites)
  const favorites: GeoLocation[] = Array.isArray(favoritesRaw)
    ? favoritesRaw.filter(isValidGeoLocation)
    : []
  const langRaw = readString(KEYS.language)

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: import.meta.env && 'VITE_APP_VERSION' in import.meta.env
      ? String(import.meta.env.VITE_APP_VERSION)
      : undefined,
    settings,
    favorites,
    language: langRaw as Language | null,
  }
}

/** Löst einen Datei-Download des Backups als JSON aus. */
export function downloadBackup(): void {
  const data = buildBackup()
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const filename = `solartime-backup-${date}.json`

  // Temporärer <a>-Element-Download (browser-standardkonform).
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // URL.revokeObjectURL nach kurzer Frist (Safari braucht den Timeout).
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ---------- Import (Validierung) ---------- */

function isValidGeoLocation(v: unknown): v is GeoLocation {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return typeof o.latitude === 'number' && typeof o.longitude === 'number'
}

function isValidLanguage(v: unknown): v is Language {
  return typeof v === 'string' && v.length >= 2 && v.length <= 8
}

function isValidSettings(v: unknown): v is Settings {
  if (!v || typeof v !== 'object') return false
  const s = v as Record<string, unknown>
  // Theme muss bekannt sein; notifications-Objekt muss existieren.
  if (s.theme !== 'default' && s.theme !== 'nightshift') return false
  if (!s.notifications || typeof s.notifications !== 'object') return false
  return true
}

/**
 * Parst + validiert einen Backup-JSON-String. Robust gegen fehlerhafte
 * oder manipulierte Eingaben – niemals eval, nur JSON.parse + Typ-Checks.
 */
export function parseBackup(jsonString: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return { ok: false, error: 'invalid-json' }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'invalid-shape' }
  }
  const obj = parsed as Record<string, unknown>

  // Versions-Kompatibilität: nur unterstützte Versionen akzeptieren.
  if (typeof obj.version !== 'number' || obj.version > BACKUP_VERSION) {
    return { ok: false, error: 'unsupported-version' }
  }

  const favoritesRaw = obj.favorites
  const favorites: GeoLocation[] = Array.isArray(favoritesRaw)
    ? favoritesRaw.filter(isValidGeoLocation)
    : []

  const settings = isValidSettings(obj.settings) ? (obj.settings as Settings) : null
  const language = isValidLanguage(obj.language) ? (obj.language as Language) : null

  // Mindestens eine nutzbare Komponente muss vorhanden sein.
  if (favorites.length === 0 && !settings && !language) {
    return { ok: false, error: 'empty-backup' }
  }

  return {
    ok: true,
    data: {
      version: obj.version,
      exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date(0).toISOString(),
      appVersion: typeof obj.appVersion === 'string' ? obj.appVersion : undefined,
      settings,
      favorites,
      language,
    },
  }
}

/* ---------- Merge-Logik ---------- */

/** Dedup-Key (2 Nachkommastellen, ~1 km) – konsistent zu useLocation.favKey. */
function favKey(loc: GeoLocation): string {
  return `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`
}

/**
 * Führt bestehende und importierte Favoriten zusammen, ohne Duplikate
 * zu erzeugen. Bei Identität (gleicher favKey) gewinnt das importierte
 * Label (falls vorhanden). Reines Merge – kein Datenverlust für
 * bestehende Favoriten, die nicht im Backup sind.
 */
export function mergeFavorites(existing: GeoLocation[], imported: GeoLocation[]): GeoLocation[] {
  const merged = new Map<string, GeoLocation>()
  // Bestehende zuerst eintragen (Basis).
  for (const f of existing) merged.set(favKey(f), f)
  // Importierte darüberlegen – überschreibt Label, behält aber Position.
  for (const f of imported) {
    const key = favKey(f)
    const prev = merged.get(key)
    merged.set(key, {
      latitude: f.latitude,
      longitude: f.longitude,
      // Import-Label gewinnt, falls vorhanden; sonst bestehendes.
      label: f.label || prev?.label,
    })
  }
  return Array.from(merged.values())
}

/* ---------- Reset ---------- */

/** Löscht alle App-Daten aus dem localStorage (Factory-Reset). */
export function clearAllAppData(): void {
  try {
    localStorage.removeItem(KEYS.settings)
    localStorage.removeItem(KEYS.favorites)
    localStorage.removeItem(KEYS.language)
    localStorage.removeItem(KEYS.location)
  } catch {
    /* ignore – Storage ggf. gesperrt */
  }
}
