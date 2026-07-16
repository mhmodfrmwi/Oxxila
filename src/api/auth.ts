import { apiRequest } from '../lib/api'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  /** Canonical profile photo from API (uploaded image, else OAuth photo). */
  avatar?: string
  /**
   * Temporary OAuth picture (e.g. JWT `picture`) used only until profile hydrate.
   * Cleared once `getUserProfile` / login response provides the real avatar.
   */
  provisionalAvatar?: string
  storeCreditBalance?: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export interface ResetPasswordPayload {
  newPassword: string
  confirmPassword: string
}

export function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    // Store httpOnly refresh cookie for later /auth/refresh.
    withCredentials: true,
  })
}

export function register(payload: RegisterPayload) {
  return apiRequest<{ user: AuthUser }>('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function forgotPassword(email: string) {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  })
}

export function resetPassword(token: string, payload: ResetPasswordPayload) {
  return apiRequest(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: payload,
  })
}

export function logout() {
  return apiRequest('/auth/logout', {
    method: 'POST',
    auth: true,
    withCredentials: true,
  })
}

export function getMe() {
  return apiRequest<AuthUser>('/auth/me', { auth: true })
}

export function refreshAccessToken() {
  return apiRequest<{ accessToken: string }>('/auth/refresh', {
    method: 'POST',
    withCredentials: true,
  })
}
