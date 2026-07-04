// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { STORAGE_KEYS } from '../config/storage'
import enCommon from './locales/en/common.json'
import arCommon from './locales/ar/common.json'

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: AppLanguage = 'en'

export const LANGUAGE_META: Record<
  AppLanguage,
  { labelKey: string; dir: 'ltr' | 'rtl'; nativeLabel: string }
> = {
  en: { labelKey: 'language.english', dir: 'ltr', nativeLabel: 'English' },
  ar: { labelKey: 'language.arabic', dir: 'rtl', nativeLabel: 'العربية' },
}

export function isAppLanguage(value: string | undefined | null): value is AppLanguage {
  return value === 'en' || value === 'ar'
}

export function applyDocumentLanguage(language: string) {
  const resolved: AppLanguage = isAppLanguage(language) ? language : DEFAULT_LANGUAGE
  const meta = LANGUAGE_META[resolved]
  document.documentElement.lang = resolved
  document.documentElement.dir = meta.dir
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      ar: { common: arCommon },
    },
    defaultNS: 'common',
    ns: ['common'],
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: STORAGE_KEYS.language,
    },
  })

applyDocumentLanguage(i18n.resolvedLanguage ?? i18n.language)

i18n.on('languageChanged', (language) => {
  applyDocumentLanguage(language)
})

export default i18n
