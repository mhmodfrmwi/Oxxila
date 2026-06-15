import { API_BASE_URL, AUTH_TOKEN_KEY } from '../config/api'

export interface ApiResponse<T = unknown> {
  success: boolean
  statusCode?: number
  status?: string
  message: string
  data?: T
}

export class ApiError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { body, auth = false, headers, ...rest } = options

  const requestHeaders = new Headers(headers)
  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let payload: ApiResponse<T> | null = null

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiError('Unexpected server response. Please try again.', response.status)
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(payload.message || 'Something went wrong. Please try again.', response.status)
  }

  return payload
}
