import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { extractOAuthCallback, getOAuthErrorMessage } from '../utils/oauth'

export function useOAuthCallback() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setSession } = useAuth()

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const { accessToken, error, user } = useMemo(() => extractOAuthCallback(params), [params])
  const oauthError = getOAuthErrorMessage(error)

  useEffect(() => {
    if (!accessToken && !error) return

    if (accessToken) {
      setSession(accessToken, user)
      navigate(location.pathname, {
        replace: true,
        state: { message: 'Signed in successfully with your social account.' },
      })
      return
    }

    if (error) {
      navigate(location.pathname, { replace: true })
    }
  }, [accessToken, error, location.pathname, navigate, setSession, user])

  return { oauthError }
}
