// src/lib/sessionExpiry.ts
import { AUTH_TOKEN_KEY } from '../config/api'
import {
  CHANGE_PASSWORD_PATH,
  FORGOT_PASSWORD_PATH,
  LOGIN_PATH,
  REGISTER_PATH,
  RESET_PASSWORD_PATH,
  VERIFY_OTP_PATH,
} from '../config/routes'
import { STORAGE_KEYS } from '../config/storage'

type SessionExpiredListener = () => void

const listeners = new Set<SessionExpiredListener>()

/** Prevents stacked clear/redirect when many requests fail at once. */
let sessionExpiryInProgress = false

export function clearLocalAuthStorage(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(STORAGE_KEYS.user)
}

export function isAuthEntryPath(pathname: string): boolean {
  return (
    pathname === LOGIN_PATH ||
    pathname === REGISTER_PATH ||
    pathname === FORGOT_PASSWORD_PATH ||
    pathname === VERIFY_OTP_PATH ||
    pathname === CHANGE_PASSWORD_PATH ||
    pathname === RESET_PASSWORD_PATH ||
    pathname.startsWith(`${RESET_PASSWORD_PATH}/`)
  )
}

/**
 * Register a listener (AuthProvider) to sync React state + navigate on expiry.
 * Returns an unsubscribe function.
 */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Clear storage and notify listeners once. Safe to call from the API layer. */
export function notifySessionExpired(): void {
  if (sessionExpiryInProgress) return

  sessionExpiryInProgress = true
  clearLocalAuthStorage()

  for (const listener of listeners) {
    try {
      listener()
    } catch {
      /* ignore listener errors */
    }
  }

  window.setTimeout(() => {
    sessionExpiryInProgress = false
  }, 1000)
}
