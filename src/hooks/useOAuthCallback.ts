import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { extractOAuthCallback, getOAuthErrorMessage } from '../utils/oauth'

const POST_LOGIN_PATH = '/home'

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
      navigate(POST_LOGIN_PATH, {
        replace: true,
        state: { message: 'Signed in successfully with your social account.' },
      })
      return
    }

    if (error) {
      navigate('/login', {
        replace: true,
        state: { oauthError: oauthError ?? 'Social sign-in failed. Please try again.' },
      })
    }
  }, [accessToken, error, navigate, oauthError, setSession, user])

  return { oauthError }
}
