import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  login as loginRequest,
  logout as logoutRequest,
  type AuthUser,
  type LoginPayload,
} from '../api/auth'
import { AUTH_TOKEN_KEY } from '../config/api'
import { ApiError } from '../lib/api'
import { parseOAuthUserFromToken, createFallbackOAuthUser } from '../utils/oauth'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => Promise<void>
  setUser: (user: AuthUser | null) => void
  setSession: (accessToken: string, user?: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('oxxila_user')
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) return null

    return readStoredUser() ?? parseOAuthUserFromToken(token)
  })

  const setUser = useCallback((nextUser: AuthUser | null) => {
    setUserState(nextUser)
    if (nextUser) {
      localStorage.setItem('oxxila_user', JSON.stringify(nextUser))
    } else {
      localStorage.removeItem('oxxila_user')
    }
  }, [])

  const setSession = useCallback(
    (accessToken: string, nextUser?: AuthUser | null) => {
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
      const resolvedUser =
        nextUser ?? parseOAuthUserFromToken(accessToken) ?? createFallbackOAuthUser()
      setUser(resolvedUser)
    },
    [setUser],
  )

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginRequest(payload)
      const { accessToken, user: nextUser } = response.data!

      localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
      setUser(nextUser)
      return nextUser
    },
    [setUser],
  )

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch (error) {
      if (!(error instanceof ApiError) || error.statusCode !== 401) {
        throw error
      }
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      setUser(null)
    }
  }, [setUser])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(localStorage.getItem(AUTH_TOKEN_KEY) && user),
      login,
      logout,
      setUser,
      setSession,
    }),
    [user, login, logout, setUser, setSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
