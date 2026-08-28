import type { Language } from '../types'

/**
 * PayPal Spenden-Link (paypal.me/Hodrius)
 */
export const PAYPAL_DONATE_URL = 'https://paypal.me/Hodrius'

/**
 * Venmo Spenden-Link für User @Hodrius
 */
export const VENMO_DONATE_URL = 'https://venmo.com/u/Hodrius'

/**
 * Liste der Sprachen, die in mindestens einem Land gesprochen werden,
 * in dem PayPal offiziell verfügbar ist.
 */
const PAYPAL_SUPPORTED_LANGUAGES: Set<Language> = new Set([
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
])

/**
 * Prüft, ob PayPal für die angegebene Sprache/Landesregion unterstützt wird.
 */
export function isPaypalSupported(lang: Language): boolean {
  if (!lang) return false
  return PAYPAL_SUPPORTED_LANGUAGES.has(lang)
}

/**
 * Prüft, ob Venmo für die angegebene Sprache unterstützt wird (ausschließlich 'en').
 */
export function isVenmoSupported(lang: Language): boolean {
  return lang === 'en'
}
