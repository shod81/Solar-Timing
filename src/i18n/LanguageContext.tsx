import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Language } from '../types'
import { SUPPORTED_LANGS } from '../types'
import en, { type Translation } from './en'
import { writeUrlParams } from '../lib/permalink'

const STORAGE_KEY = 'solartime.lang'

/** In-Memory-Cache für geladene Sprachwörterbücher. `en` ist als Basissprache vorkonfiguriert. */
const loadedDictionaries: Partial<Record<Language, Translation>> = {
  en,
}

/** Dynamischer Import von Sprachpaketen für automatisches Vite Code-Splitting. */
async function loadDictionary(lang: Language): Promise<Translation> {
  if (loadedDictionaries[lang]) {
    return loadedDictionaries[lang]!
  }

  try {
    let dict: Translation
    switch (lang) {
      case 'de':
        dict = (await import('./de')).default
        break
      case 'zh':
        dict = (await import('./zh')).default
        break
      case 'hi':
        dict = (await import('./hi')).default
        break
      case 'es':
        dict = (await import('./es')).default
        break
      case 'fr':
        dict = (await import('./fr')).default
        break
      case 'ar':
        dict = (await import('./ar')).default
        break
      case 'bn':
        dict = (await import('./bn')).default
        break
      case 'ru':
        dict = (await import('./ru')).default
        break
      case 'pt':
        dict = (await import('./pt')).default
        break
      case 'ur':
        dict = (await import('./ur')).default
        break
      case 'fi':
        dict = (await import('./fi')).default
        break
      case 'ja':
        dict = (await import('./ja')).default
        break
      case 'no':
        dict = (await import('./no')).default
        break
      case 'pl':
        dict = (await import('./pl')).default
        break
      case 'nl':
        dict = (await import('./nl')).default
        break
      case 'it':
        dict = (await import('./it')).default
        break
      case 'da':
        dict = (await import('./da')).default
        break
      case 'sv':
        dict = (await import('./sv')).default
        break
      case 'en':
      default:
        dict = en
        break
    }
    loadedDictionaries[lang] = dict
    return dict
  } catch (error) {
    console.error(`Failed to load translation bundle for "${lang}":`, error)
    return en
  }
}

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  /** Das aktive Wörterbuch. */
  t: Translation
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/** Erkenne Sprache: URL-Param > localStorage > Browsersprache (alle unterstützten Sprachen) > Fallback Englisch. */
function detectInitial(): Language {
  // 1) URL-Parameter ?lang=... (höchste Priorität – für geteilte Links).
  if (typeof window !== 'undefined') {
    const urlLang = new URLSearchParams(window.location.search).get('lang') as Language
    if (urlLang && SUPPORTED_LANGS.includes(urlLang)) return urlLang
  }

  // 2) Explizit gespeicherte Einstellung des Nutzers im localStorage.
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved
  } catch {
    /* localStorage nicht verfügbar */
  }

  // 3) Automatische Erkennung aus den Browsersprachen / Landeseinstellungen des Besuchers.
  if (typeof navigator !== 'undefined') {
    const userLangs =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || 'en']

    for (const raw of userLangs) {
      if (!raw) continue
      const code = raw.toLowerCase()
      for (const supported of SUPPORTED_LANGS) {
        if (code === supported || code.startsWith(`${supported}-`) || code.startsWith(`${supported}_`)) {
          return supported
        }
      }
    }
  }

  // Fallback: Englisch, falls keine unterstützte Sprache im Browser erkannt wurde.
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => detectInitial())
  const [activeTranslation, setActiveTranslation] = useState<Translation>(
    () => loadedDictionaries[lang] || en,
  )

  useEffect(() => {
    let isMounted = true

    // Asynchrones Laden der gewählten Sprache, falls noch nicht im Cache
    if (loadedDictionaries[lang]) {
      setActiveTranslation(loadedDictionaries[lang]!)
    } else {
      loadDictionary(lang).then((dict) => {
        if (isMounted) {
          setActiveTranslation(dict)
        }
      })
    }

    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr'
    // Sprachwechsel in die URL schreiben (Standort unangetastet).
    writeUrlParams(undefined, lang)

    return () => {
      isMounted = false
    }
  }, [lang])

  const setLang = useCallback((next: Language) => setLangState(next), [])

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: activeTranslation,
    }),
    [lang, setLang, activeTranslation],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

/** Hook: Zugriff auf das Wörterbuch und die Sprache. */
export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useI18n must be used within a LanguageProvider')
  return ctx
}
