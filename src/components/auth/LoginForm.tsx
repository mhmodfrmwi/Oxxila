import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useOAuthCallback } from '../../hooks/useOAuthCallback'
import { ApiError } from '../../lib/api'
import { Button } from '../ui/Button'
import { InputField } from '../ui/InputField'
import { AuthCard } from './AuthCard'
import { FormMessage } from './FormMessage'
import { SocialLoginButtons } from './SocialLoginButtons'

export function LoginForm() {
  const location = useLocation()
  const { theme } = useTheme()
  const { login, logout, user, isAuthenticated } = useAuth()
  const { oauthError } = useOAuthCallback()
  const isDark = theme === 'dark'
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(
    (location.state as { message?: string } | null)?.message ?? '',
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ((location.state as { message?: string } | null)?.message) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    setLoading(true)

    try {
      const nextUser = await login({ email, password })
      setSuccess(`Welcome back, ${nextUser.name}!`)
      event.currentTarget.reset()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to log in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await logout()
      setSuccess('You have been logged out.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to log out. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard activeTab="login" imagePosition="right">
      <header className="mb-8">
        <h1
          className={[
            'font-serif text-4xl font-medium sm:text-[2.75rem]',
            isDark ? 'text-white' : 'text-text-primary-light',
          ].join(' ')}
        >
          Welcome back
        </h1>
        <p className="mt-2 font-serif text-xl italic text-oxxila-purple-muted">Happy to see you again</p>
      </header>

      {(error || oauthError) && (
        <div className="mb-4">
          <FormMessage message={error || oauthError || ''} />
        </div>
      )}      {success && <div className="mb-4"><FormMessage message={success} type="success" /></div>}

      {isAuthenticated && user ? (
        <div className="space-y-5">
          <p className={isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}>
            Signed in as <strong className={isDark ? 'text-white' : 'text-text-primary-light'}>{user.email}</strong>
          </p>
          <Button type="button" fullWidth pill className="h-14 sm:h-[65px]" onClick={handleLogout} disabled={loading}>
            {loading ? 'Logging out...' : 'Log out'}
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <InputField
            label="Email Address"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Example@example.com"
            required
          />

          <div>
            <InputField
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Min. 8 characters"
              showPasswordToggle
              required
              minLength={8}
            />
            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-oxxila-accent hover:text-oxxila-purple-light"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <SocialLoginButtons disabled={loading} />

          <Button type="submit" fullWidth pill className="h-14 sm:h-[65px]" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      )}

      <p
        className={[
          'mt-6 text-center text-sm',
          isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light',
        ].join(' ')}
      >
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-oxxila-accent hover:text-oxxila-purple-light">
          Create account
        </Link>
      </p>
    </AuthCard>
  )
}
