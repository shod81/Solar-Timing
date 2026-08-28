import { useI18n } from '../i18n/LanguageContext'
import type { Language } from '../types'

export interface LanguageOption {
  code: Language
  label: string
  flag: string
}

export const LANG_OPTIONS: LanguageOption[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'zh', label: '中文 (简体)', flag: '🇨🇳' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
]

/** Responsive Sprachauswahl-Menü für alle 11 Sprachen. */
export default function LanguageToggle() {
  const { lang, setLang } = useI18n()

  return (
    <div className="lang-select-wrap">
      <select
        className="lang-select"
        value={lang}
        onChange={(e) => setLang(e.target.value as Language)}
        aria-label="Language selection"
      >
        {LANG_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code} className="lang-option">
            {opt.flag} {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
