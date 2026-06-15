import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { FormMessage } from '../components/auth/FormMessage'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ApiError } from '../lib/api'

export function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()
  const { user, logout } = useAuth()
  const isDark = theme === 'dark'
  const [message, setMessage] = useState(
    (location.state as { message?: string } | null)?.message ?? '',
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ((location.state as { message?: string } | null)?.message) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  async function handleLogout() {
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await logout()
      navigate('/login', { replace: true, state: { message: 'You have been logged out.' } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to log out. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <section className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
        <h1
          className={[
            'font-serif text-4xl font-medium sm:text-5xl',
            isDark ? 'text-white' : 'text-text-primary-light',
          ].join(' ')}
        >
          Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="mt-3 font-serif text-xl italic text-oxxila-purple-muted">
          You are signed in to Oxxila
        </p>

        {user?.email && (
          <p className={['mt-4 text-sm', isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'].join(' ')}>
            Signed in as <strong className={isDark ? 'text-white' : 'text-text-primary-light'}>{user.email}</strong>
          </p>
        )}

        {message && (
          <div className="mt-6 w-full max-w-md">
            <FormMessage message={message} type="success" />
          </div>
        )}

        {error && (
          <div className="mt-6 w-full max-w-md">
            <FormMessage message={error} />
          </div>
        )}

        <Button
          type="button"
          pill
          className="mt-8 h-14 min-w-[180px] sm:h-[65px]"
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? 'Logging out...' : 'Log out'}
        </Button>
      </section>
    </Layout>
  )
}
