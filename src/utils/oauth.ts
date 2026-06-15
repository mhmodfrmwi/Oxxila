import { API_BASE_URL } from '../config/api'
import type { AuthUser } from '../api/auth'

export type OAuthProvider = 'google' | 'facebook'

export function getOAuthStartUrl(provider: OAuthProvider): string {
  const path = `/auth/${provider}`

  if (API_BASE_URL.startsWith('http')) {
    return `${API_BASE_URL}${path}`
  }

  return `${window.location.origin}${API_BASE_URL}${path}`
}

export function parseOAuthUserFromToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as Record<string, string>

    return {
      id: payload.userId ?? payload.sub ?? '',
      name: payload.name ?? 'User',
      email: payload.email ?? '',
      role: payload.role ?? 'user',
    }
  } catch {
    return null
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

  const messages: Record<string, string> = {
    google_failed: 'Google sign-in failed. Please try again.',
    facebook_failed: 'Facebook sign-in failed. Please try again.',
    access_denied: 'Sign-in was cancelled.',
  }

  return messages[errorCode] ?? 'Social sign-in failed. Please try again.'
}

export function extractOAuthCallback(searchParams: URLSearchParams) {
  const accessToken =
    searchParams.get('accessToken') ??
    searchParams.get('token') ??
    searchParams.get('access_token')

  const error = searchParams.get('error')
  const user =
    parseOAuthUserFromQuery(searchParams.get('user')) ??
    (accessToken ? parseOAuthUserFromToken(accessToken) : null)

  return { accessToken, error, user }
}
