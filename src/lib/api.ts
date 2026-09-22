// src/lib/api.ts
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../config/api'
import { STORAGE_KEYS } from '../config/storage'
import { notifySessionExpired } from './sessionExpiry'

export interface ApiPagination {
  currentPage: number
  limit: number
  numberOfPages: number
  totalDocuments: number
  nextPage: number | null
  prevPage: number | null
  results?: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  statusCode?: number
  status?: string
  message: string
  data?: T
  pagination?: ApiPagination
}

export class ApiError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

interface RequestOptions extends Omit<RequestInit, 'body' | 'credentials'> {
  body?: unknown
  auth?: boolean
  withCredentials?: boolean
  /** Internal: skip refresh+retry after a failed authenticated request. */
  _authRetry?: boolean
}

/** Paths that must not trigger access-token refresh or session-expiry handling. */
function shouldSkipAuthRecovery(path: string): boolean {
  return (
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/register') ||
    path.startsWith('/auth/refresh') ||
    path.startsWith('/auth/logout') ||
    path.startsWith('/auth/forgot-password') ||
    path.startsWith('/auth/reset-password')
  )
}

export function getAccessToken(): string | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)?.trim()
  return token || null
}

async function parseApiPayload<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiError('Unexpected server response. Please try again.', response.status)
  }
}

let refreshInFlight: Promise<string | null> | null = null

/** Single-flight refresh using httpOnly refresh cookie. */
function refreshAccessTokenOnce(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
        const payload = await parseApiPayload<{ accessToken: string }>(response)
        const accessToken = payload.data?.accessToken?.trim()
        if (!response.ok || !payload.success || !accessToken) return null

        localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
        return accessToken
      } catch {
        return null
      } finally {
        refreshInFlight = null
      }
    })()
  }

  return refreshInFlight
}

function expireSessionAndThrow(message: string): never {
  notifySessionExpired()
  throw new ApiError(message, 401)
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const {
    body,
    auth = false,
    withCredentials = false,
    headers,
    _authRetry = false,
    ...rest
  } = options

  const requestHeaders = new Headers(headers)
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  if (body !== undefined && !isFormData) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getAccessToken()
    if (!token) {
      // Stale session (user persisted without access token).
      if (localStorage.getItem(STORAGE_KEYS.user)) {
        expireSessionAndThrow('You are not logged in. Please log in to continue.')
      }
      throw new ApiError('You are not logged in. Please log in to continue.', 401)
    }
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    credentials: 'include',
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
  })

  const payload = await parseApiPayload<T>(response)
  const statusCode = payload.statusCode ?? response.status
  const failed = !response.ok || !payload.success

  if (
    failed &&
    statusCode === 401 &&
    auth &&
    !_authRetry &&
    !shouldSkipAuthRecovery(path)
  ) {
    const nextToken = await refreshAccessTokenOnce()
    if (nextToken) {
      return apiRequest<T>(path, { ...options, _authRetry: true })
    }
    expireSessionAndThrow(
      payload.message || 'Your session has expired. Please log in again.',
    )
  }

  if (failed) {
    throw new ApiError(
      payload.message || 'Something went wrong. Please try again.',
      statusCode,
    )
  }

  return payload
}
