import { useLayoutEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HOME_PATH } from '../config/routes'
import { useAuth } from '../context/AuthContext'
import {
  clearOAuthUrl,
  extractOAuthCallback,
  getOAuthErrorMessage,
  getOAuthSearchParams,
  OAUTH_FAILURE_PATH,
} from '../utils/oauth'
import { consumeOAuthError } from '../utils/oauthBootstrap'

/** Fallback OAuth handler when bootstrap did not run (e.g. client-side navigation). */
export function useOAuthCallback() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const handledRef = useRef(false)

  const params = useMemo(
    () => getOAuthSearchParams(location.search, location.hash),
    [location.search, location.hash],
  )
  const { accessToken, error, user } = useMemo(() => extractOAuthCallback(params), [params])
  const oauthError = getOAuthErrorMessage(error)

  useLayoutEffect(() => {
    if (handledRef.current) return

    if (accessToken) {
      handledRef.current = true
      setSession(accessToken, user)
      clearOAuthUrl(HOME_PATH)
      if (location.pathname !== HOME_PATH) {
        navigate(HOME_PATH, { replace: true })
      }
      return
    }

    if (error) {
      handledRef.current = true
      consumeOAuthError()
      const message = oauthError ?? 'Social sign-in failed. Please try again.'
      clearOAuthUrl(OAUTH_FAILURE_PATH)
      navigate(OAUTH_FAILURE_PATH, {
        replace: true,
        state: { oauthError: message },
      })
      return
    }

    if (location.pathname === HOME_PATH && (location.search || location.hash)) {
      clearOAuthUrl(HOME_PATH)
    }
  }, [
    accessToken,
    error,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    oauthError,
    setSession,
    user,
  ])

  return { oauthError }
}
