import { STORAGE_KEYS } from './storage'

/** API root from `BASE_URL` in `.env` (injected by vite.config). */
export const API_BASE_URL = import.meta.env.APP_API_BASE_URL

export const AUTH_TOKEN_KEY = STORAGE_KEYS.authToken
