import { STORAGE_KEYS } from '../config/storage'

export type Theme = 'light' | 'dark'

/**
 * Single source of truth for applying theme to the document.
 * Color tokens are selected only via [data-theme] in tokens.css.
 */
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.dataset.theme = theme

  try {
    localStorage.setItem(STORAGE_KEYS.theme, theme)
  } catch {
    // Private browsing / blocked storage
  }
}

export function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.theme)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // ignore
  }
  return 'light'
}
