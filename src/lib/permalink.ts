import type { EmbedView, GeoLocation, Language, Theme } from '../types'
import { SUPPORTED_LANGS } from '../types'

/* ============================================================
   Permalink-Handling: Standort, Sprache, Theme & Widget-View
   über die URL teilen.

   URL-Parameter:
     ?lat=52.52&lng=13.405&label=Berlin&lang=de&theme=nightshift&view=organ
   ============================================================ */

export interface UrlParams {
  latitude?: number
  longitude?: number
  label?: string
  lang?: Language
  theme?: Theme
  view?: EmbedView
  /** Notifications an/aus via URL (?notif=on). */
  notif?: boolean
}

/** Update-Instruktion für writeUrlParams. `undefined` = nicht anfassen,
 *  `null` = explizit entfernen, Wert = setzen. */
export interface WriteUrlOptions {
  loc?: GeoLocation | null
  lang?: Language | null
  theme?: Theme | null
  notif?: boolean | null
  view?: EmbedView | null
}

/** Liest die URL-Parameter aus der aktuellen Adresse. */
export function readUrlParams(): UrlParams {
  if (typeof window === 'undefined') return {}
  const sp = new URLSearchParams(window.location.search)
  const lat = parseFloat(sp.get('lat') || '')
  const lng = parseFloat(sp.get('lng') || '')
  const label = sp.get('label') || undefined
  const langRaw = sp.get('lang')
  const lang: Language | undefined =
    langRaw && (SUPPORTED_LANGS as readonly string[]).includes(langRaw)
      ? (langRaw as Language)
      : undefined
  const themeRaw = sp.get('theme')
  const theme: Theme | undefined =
    themeRaw === 'default' || themeRaw === 'nightshift' ? themeRaw : undefined
  const viewRaw = sp.get('view')
  const view: EmbedView | undefined =
    viewRaw === 'organ' || viewRaw === 'solar' || viewRaw === 'moon' ? viewRaw : undefined
  const notifRaw = sp.get('notif')
  const notif = notifRaw === 'on' ? true : notifRaw === 'off' ? false : undefined

  const validLat = isFinite(lat) && lat >= -90 && lat <= 90 ? lat : undefined
  const validLng = isFinite(lng) && lng >= -180 && lng <= 180 ? lng : undefined

  return {
    latitude: validLat,
    longitude: validLng,
    label: label && label.length <= 120 ? label : undefined,
    lang,
    theme,
    view,
    notif,
  }
}

/**
 * Schreibt Standort, Sprache, Theme, Notif-Status und View in die URL
 * (ohne Reload).
 *
 * Semantik: `undefined` = diesen Parameter nicht anfassen (eine andere
 * Komponente verwaltet ihn). `null` = explizit entfernen.
 *
 * Rückwärtskompatibel zur alten 2-Parameter-Signatur:
 *   writeUrlParams(loc, lang)
 */
export function writeUrlParams(
  locOrOpts: GeoLocation | null | undefined | WriteUrlOptions,
  legacyLang?: Language | null,
): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)

  let opts: WriteUrlOptions
  if (
    locOrOpts &&
    typeof locOrOpts === 'object' &&
    !Array.isArray(locOrOpts) &&
    !('latitude' in locOrOpts)
  ) {
    // Neue Objekt-Signatur: writeUrlParams({ loc, lang, theme, notif, view })
    opts = locOrOpts as WriteUrlOptions
  } else {
    // Legacy-Signatur: writeUrlParams(loc, lang)
    opts = { loc: locOrOpts as GeoLocation | null | undefined, lang: legacyLang }
  }

  if (opts.loc !== undefined) {
    url.searchParams.delete('lat')
    url.searchParams.delete('lng')
    url.searchParams.delete('label')
    if (opts.loc) {
      url.searchParams.set('lat', opts.loc.latitude.toFixed(4))
      url.searchParams.set('lng', opts.loc.longitude.toFixed(4))
      if (opts.loc.label) url.searchParams.set('label', opts.loc.label.slice(0, 120))
    }
  }
  if (opts.lang !== undefined) {
    url.searchParams.delete('lang')
    if (opts.lang) url.searchParams.set('lang', opts.lang)
  }
  if (opts.theme !== undefined) {
    url.searchParams.delete('theme')
    if (opts.theme) url.searchParams.set('theme', opts.theme)
  }
  if (opts.notif !== undefined) {
    url.searchParams.delete('notif')
    if (opts.notif !== null) url.searchParams.set('notif', opts.notif ? 'on' : 'off')
  }
  if (opts.view !== undefined) {
    url.searchParams.delete('view')
    if (opts.view) url.searchParams.set('view', opts.view)
  }
  window.history.replaceState({}, '', url.toString())
}

/** Erzeugt die teilbare URL für einen Standort + Sprache. */
export function buildShareUrl(loc: GeoLocation | null, lang: Language | null): string {
  const base =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://solartiming.de/'
  const sp = new URLSearchParams()
  if (loc) {
    sp.set('lat', loc.latitude.toFixed(4))
    sp.set('lng', loc.longitude.toFixed(4))
    if (loc.label) sp.set('label', loc.label.slice(0, 120))
  }
  if (lang) sp.set('lang', lang)
  const qs = sp.toString()
  return qs ? `${base}?${qs}` : base
}
