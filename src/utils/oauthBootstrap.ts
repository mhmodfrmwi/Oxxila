// src/utils/oauthBootstrap.ts
import { AUTH_TOKEN_KEY } from '../config/api'
import { STORAGE_KEYS } from '../config/storage'
import { HOME_PATH } from '../config/routes'
import i18n from '../i18n'
import {
  createFallbackOAuthUser,
  clearOAuthUrl,
  extractOAuthCallback,
  getOAuthErrorMessage,
  getOAuthSearchParams,
  OAUTH_FAILURE_PATH,
  parseOAuthUserFromToken,
} from './oauth'
import { resolvePostLoginPath } from './postLoginRedirect'

const USER_KEY = STORAGE_KEYS.user
const OAUTH_ERROR_KEY = STORAGE_KEYS.oauthError

/**
 * Process OAuth redirects before React mounts.
 * Backend: success → /home#accessToken=…, failure → /login?error=google_failed
 */
export function bootstrapOAuthFromUrl(): void {
  const { pathname, search, hash } = window.location
  const params = getOAuthSearchParams(search, hash)
  const { accessToken, error, user } = extractOAuthCallback(params)

  if (accessToken) {
    const resolvedUser =
      user ?? parseOAuthUserFromToken(accessToken) ?? createFallbackOAuthUser()

    localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(resolvedUser))
    clearOAuthUrl(resolvePostLoginPath(resolvedUser.role))
    return
  }

  if (error) {
    const message = getOAuthErrorMessage(error) ?? i18n.t('auth.oauth.failed')
    sessionStorage.setItem(OAUTH_ERROR_KEY, message)
    clearOAuthUrl(OAUTH_FAILURE_PATH)
    return
  }

  if (pathname === HOME_PATH && (search || hash)) {
    clearOAuthUrl(HOME_PATH)
  }
}

export function consumeOAuthError(): string | null {
  const message = sessionStorage.getItem(OAUTH_ERROR_KEY)
  if (message) {
    sessionStorage.removeItem(OAUTH_ERROR_KEY)
  }
  return message
}
