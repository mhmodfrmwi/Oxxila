// src/context/AuthContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  login as loginRequest,
  logout as logoutRequest,
  type AuthUser,
  type LoginPayload,
} from '../api/auth'
import { getUserProfile } from '../api/users'
import { AUTH_TOKEN_KEY } from '../config/api'
import { STORAGE_KEYS } from '../config/storage'
import { ApiError, getAccessToken } from '../lib/api'
import { parseOAuthUserFromToken, createFallbackOAuthUser } from '../utils/oauth'
import { profileToAuthUser } from '../utils/userProfile'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  /** True until the first profile hydrate attempt finishes for the current session. */
  profileLoading: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => Promise<void>
  setUser: (user: AuthUser | null) => void
  setSession: (accessToken: string, user?: AuthUser | null) => void
  refreshProfile: () => Promise<AuthUser | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEYS.user)
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
  const [profileLoading, setProfileLoading] = useState(() => Boolean(getAccessToken()))
  const userRef = useRef(user)

  useEffect(() => {
    userRef.current = user
  }, [user])

  const setUser = useCallback((nextUser: AuthUser | null) => {
    setUserState(nextUser)
    if (nextUser) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(STORAGE_KEYS.user)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!getAccessToken()) {
      setProfileLoading(false)
      return null
    }

    try {
      const response = await getUserProfile()
      if (!response.data) {
        setProfileLoading(false)
        return userRef.current
      }

      const nextUser = profileToAuthUser(response.data, userRef.current)
      setUser(nextUser)
      setProfileLoading(false)
      return nextUser
    } catch {
      setProfileLoading(false)
      return userRef.current
    }
  }, [setUser])

  useEffect(() => {
    if (!getAccessToken()) return

    let cancelled = false

    async function hydrate() {
      setProfileLoading(true)
      try {
        const response = await getUserProfile()
        if (cancelled || !response.data) return
        setUser(profileToAuthUser(response.data, userRef.current))
      } catch {
        /* keep stored / provisional user */
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [setUser])

  const setSession = useCallback(
    (accessToken: string, nextUser?: AuthUser | null) => {
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
      const resolvedUser =
        nextUser ?? parseOAuthUserFromToken(accessToken) ?? createFallbackOAuthUser()
      setUser(resolvedUser)
      setProfileLoading(true)
      void refreshProfile()
    },
    [setUser, refreshProfile],
  )

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginRequest(payload)
      const { accessToken, user: nextUser } = response.data!

      localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
      setUser(nextUser)
      setProfileLoading(true)
      const hydrated = await refreshProfile()
      return hydrated ?? nextUser
    },
    [setUser, refreshProfile],
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
      setProfileLoading(false)
    }
  }, [setUser])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(getAccessToken() && user),
      profileLoading,
      login,
      logout,
      setUser,
      setSession,
      refreshProfile,
    }),
    [user, profileLoading, login, logout, setUser, setSession, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
