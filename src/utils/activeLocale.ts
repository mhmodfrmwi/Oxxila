// src/utils/activeLocale.ts
import i18n from '../i18n'

/**
 * Resolve the locale used for catalog/CMS/price display.
 * Explicit string locale wins; otherwise the live i18n language (not
 * document.lang, which lags a render behind language switches).
 */
export function resolveActiveLocale(locale?: unknown): string {
  if (typeof locale === 'string' && locale.trim()) return locale
  const current = i18n.resolvedLanguage ?? i18n.language
  if (typeof current === 'string' && current) return current
  if (typeof document !== 'undefined' && document.documentElement.lang) {
    return document.documentElement.lang
  }
  return 'ar'
}

export function isArabicLocale(locale?: unknown): boolean {
  return resolveActiveLocale(locale).toLowerCase().startsWith('ar')
}
