// src/utils/oauth.ts
import { API_BASE_URL } from '../config/api'
import { HOME_PATH, LOGIN_PATH } from '../config/routes'
import type { AuthUser } from '../api/auth'
import i18n from '../i18n'

export type OAuthProvider = 'google' | 'facebook'

/** Matches backend OAUTH_SUCCESS_REDIRECT (…/home). */
export const OAUTH_SUCCESS_PATH = HOME_PATH

/** Matches backend OAUTH_FAILURE_REDIRECT (…/login?error=…). */
export const OAUTH_FAILURE_PATH = LOGIN_PATH

export function getOAuthStartUrl(provider: OAuthProvider): string {
  const origin = window.location.origin
  const path = `/auth/${provider}`

  const base = API_BASE_URL.startsWith('http')
    ? `${API_BASE_URL}${path}`
    : `${origin}${API_BASE_URL}${path}`

  const url = new URL(base)
  url.searchParams.set('frontendUrl', `${origin}${OAUTH_SUCCESS_PATH}`)
  return url.toString()
}

export function getOAuthSearchParams(search: string, hash: string) {
  const params = new URLSearchParams(search)

  if (hash) {
    const hashValue = hash.startsWith('#') ? hash.slice(1) : hash

    // JWTs in the hash can be misparsed by URLSearchParams in some browsers;
    // extract known token keys with a regex first.
    for (const key of ['accessToken', 'access_token', 'token', 'jwt'] as const) {
      const match = hashValue.match(new RegExp(`(?:^|&)${key}=([^&]+)`))
      if (match?.[1] && !params.has(key)) {
        params.set(key, decodeURIComponent(match[1]))
      }
    }

    const hashParams = new URLSearchParams(hashValue)
    hashParams.forEach((value, key) => {
      if (!params.has(key)) {
        params.set(key, value)
      }
    })
  }

  return params
}

/** Remove OAuth token/error params from the address bar. */
export function clearOAuthUrl(path = HOME_PATH) {
  window.history.replaceState({}, document.title, path)
}

export function parseOAuthUserFromToken(token: string): AuthUser | null {
  try {
    const segment = token.split('.')[1]
    if (!segment) return null

    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(normalized)) as Record<string, unknown>

    const id = String(payload.userId ?? payload.id ?? payload._id ?? payload.sub ?? '')
    const email = String(payload.email ?? '')
    const name = String(payload.name ?? payload.username ?? 'User')
    const role = String(payload.role ?? 'user')

    if (!id && !email) return null

    return {
      id: id || email,
      name,
      email,
      role,
    }
  } catch {
    return null
  }
}

export function createFallbackOAuthUser(): AuthUser {
  return {
    id: 'oauth-user',
    name: 'User',
    email: '',
    role: 'user',
  }
}

export function parseOAuthUserFromQuery(raw: string | null): AuthUser | null {
  if (!raw) return null

  try {
    return JSON.parse(decodeURIComponent(raw)) as AuthUser
  } catch {
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  }
}

export function getOAuthErrorMessage(errorCode: string | null): string | null {
  if (!errorCode) return null

  const knownCodes = new Set(['google_failed', 'facebook_failed', 'access_denied'])
  if (knownCodes.has(errorCode)) {
    return i18n.t(`auth.oauth.${errorCode}`)
  }

  return i18n.t('auth.oauth.failed')
}

export function extractOAuthCallback(searchParams: URLSearchParams) {
  const accessToken =
    searchParams.get('accessToken') ??
    searchParams.get('access_token') ??
    searchParams.get('token') ??
    searchParams.get('jwt')

  const error = searchParams.get('error') ?? searchParams.get('oauthError')
  const user =
    parseOAuthUserFromQuery(searchParams.get('user')) ??
    (accessToken ? parseOAuthUserFromToken(accessToken) : null)

  return { accessToken, error, user }
}
