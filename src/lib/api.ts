import { API_BASE_URL, AUTH_TOKEN_KEY } from '../config/api'

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
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { body, auth = false, withCredentials = false, headers, ...rest } = options

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
    credentials: withCredentials ? 'include' : 'same-origin',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  try {
    const payload = (await response.json()) as ApiResponse<T>

    if (!response.ok || !payload.success) {
      throw new ApiError(
        payload.message || 'Something went wrong. Please try again.',
        payload.statusCode ?? response.status,
      )
    }

    return payload
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('Unexpected server response. Please try again.', response.status)
  }
}
