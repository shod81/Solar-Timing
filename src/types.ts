/**
 * Gemeinsame TypeScript-Typen für die Solar-Time-App.
 */

/** Geographischer Standort. */
export interface GeoLocation {
  /** Breitengrad in Grad (positiv = Nord). */
  latitude: number
  /** Längengrad in Grad (positiv = Ost). */
  longitude: number
  /** Anzeigename des Ortes (z. B. aus Reverse-Geocoding oder Suchauswahl). */
  label?: string
}

/** Quelle des Standorts – für die UI-Anzeige. */
export type LocationSource = 'gps' | 'address' | 'saved'

/** Status der Standortbestimmung. */
export interface LocationState {
  location: GeoLocation | null
  source: LocationSource | null
  isLoading: boolean
  error: string | null
}

/** Unterstützte UI-Sprachen. */
export type Language =
  | 'de'
  | 'en'
  | 'zh'
  | 'hi'
  | 'es'
  | 'fr'
  | 'ar'
  | 'bn'
  | 'ru'
  | 'pt'
  | 'ur'
  | 'fi'
  | 'ja'
  | 'no'
  | 'pl'
  | 'nl'
  | 'it'
  | 'da'
  | 'sv'

/**
 * Single Source of Truth für die Liste unterstützter Sprachen.
 * Wird vom LanguageContext, dem Permalink-Parser und dem LanguageToggle
 * gemeinsam genutzt, damit keine Liste versehentlich divergiert.
 */
export const SUPPORTED_LANGS: readonly Language[] = [
  'de',
  'en',
  'zh',
  'hi',
  'es',
  'fr',
  'ar',
  'bn',
  'ru',
  'pt',
  'ur',
  'fi',
  'ja',
  'no',
  'pl',
  'nl',
  'it',
  'da',
  'sv',
]

/** TCM-Elemente. */
export type Element = 'metal' | 'earth' | 'fire' | 'water' | 'wood'

/** Ein Eintrag der Organuhr (zwei-Stunden-Fenster). */
export interface OrganSlot {
  /** Startstunde (0–23), Fenster = [start, start+2). */
  startHour: number
  /** Organschlüssel zur Übersetzung, z. B. "lung". */
  key: string
  /** Element. */
  element: Element
}

/** Berechnungsergebnis der wahren Sonnenzeit. */
export interface SolarTimeResult {
  /** Wahre Sonnenzeit als Date-Objekt (lokale Hüll-Instanz, nur HH:MM:SS relevant). */
  trueSolarDate: Date
  /** Stunden 0–24 (mit Nachkommastellen für exakte Zeigerstellung). */
  trueSolarHours: number
  /** Gleichung der Zeit in Minuten. */
  equationOfTime: number
  /** Längengrad-Korrektur in Minuten (4·Längengrad-Abweichung). */
  longitudeCorrection: number
  /** Sonnenaufgang (lokale Uhrzeit) oder null (Polartag/-nacht). */
  sunrise: Date | null
  /** Sonnenuntergang (lokale Uhrzeit) oder null. */
  sunset: Date | null
  /** Sonnenmittag (wahrer Mittag) als lokale Uhrzeit. */
  solarNoon: Date | null
  /** Polartag oder Polarnacht (null bei normalem Tag/Nacht-Wechsel). */
  polarStatus: 'polarDay' | 'polarNight' | null
  /** Tag des Jahres (1–366). */
  dayOfYear: number
}

/** Mondphasen-Schlüssel. */
export type MoonPhaseKey =
  | 'new'
  | 'waxingCrescent'
  | 'firstQuarter'
  | 'waxingGibbous'
  | 'full'
  | 'waningGibbous'
  | 'lastQuarter'
  | 'waningCrescent'

/** Berechnungsergebnis der Mondphase. */
export interface MoonResult {
  /** Mondalter in Tagen (0 … 29,53). */
  age: number
  /** Beleuchteter Anteil 0..1. */
  illumination: number
  /** Phasen-Schlüssel. */
  phase: MoonPhaseKey
  /** Name des Zyklustags (z. B. 9,5). */
  cycleDay: number
  /** Tage bis zum nächsten Vollmond (negativ = Tage seit Vollmond). */
  daysToFullMoon: number
  /** Liegt der Zeitpunkt in der "Vollmondwoche" (±3 Tage)? */
  isFullMoonWeek: boolean
}

/* ============================================================
   Erweiterungs-Typen
   ============================================================ */

/** Ein Akupressurpunkt mit Name + Kurzbeschreibung. */
export interface AcupressurePoint {
  name: string
  desc: string
}

/** Detaillierte TCM-Informationen pro Organ. */
export interface OrganDetails {
  /** Empfohlene Aktivitäten im Organfenster. */
  activities: string[]
  /** Ernährungs-/Tee-Tipps (Element-/Kräuter-Bezug). */
  nutrition?: string[]
  /** 1–2 einfache Akupressurpunkte. */
  acupressure: AcupressurePoint[]
}

/** Themes der App. */
export type Theme = 'default' | 'nightshift'

/** Notification-Einstellungen. */
export interface NotificationSettings {
  /** Master-Schalter für Browser-Notifications. */
  enabled: boolean
  /** Bei jedem Organfenster-Wechsel benachrichtigen. */
  organChange: boolean
  /** Nur bei ausgewählten Organen (leer = alle, wenn organChange an). */
  selectedOrgans: string[]
  /** Beim Eintritt in die Vollmondwoche benachrichtigen. */
  fullMoonWeek: boolean
}

/** Gesamte App-Einstellungen. */
export interface Settings {
  theme: Theme
  notifications: NotificationSettings
}

/** Ansichten für das einbettbare Widget. */
export type EmbedView = 'organ' | 'solar' | 'moon'
