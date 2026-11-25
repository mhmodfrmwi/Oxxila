import { STORAGE_KEYS } from './storage'

/** API root from `BASE_URL` in `.env` (injected by vite.config). */
const configuredBaseUrl: string = import.meta.env.APP_API_BASE_URL

/**
 * In dev, call the API through the Vite proxy (same path as `BASE_URL`, see
 * vite.config.ts) so requests are same-origin — no CORS errors when `BASE_URL`
 * points at a remote server. Production builds keep the absolute URL.
 */
function resolveApiBaseUrl(): string {
  if (import.meta.env.DEV && configuredBaseUrl.startsWith('http')) {
    return new URL(configuredBaseUrl).pathname.replace(/\/$/, '') || '/api/v1'
  }
  return configuredBaseUrl
}

export const API_BASE_URL = resolveApiBaseUrl()

export const AUTH_TOKEN_KEY = STORAGE_KEYS.authToken
