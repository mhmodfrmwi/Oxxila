import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { HOME_PATH } from '../../config/routes'
import { ApiError } from '../../lib/api'
import { getOAuthErrorMessage, getOAuthSearchParams } from '../../utils/oauth'
import { consumeOAuthError } from '../../utils/oauthBootstrap'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { InputField } from '../ui/InputField'
import { AuthCard } from './AuthCard'
import { FormMessage } from './FormMessage'
import { SocialLoginButtons } from './SocialLoginButtons'

function readOAuthError(locationState: unknown): string {
  const fromBootstrap = consumeOAuthError()
  if (fromBootstrap) return fromBootstrap

  const fromState = (locationState as { oauthError?: string } | null)?.oauthError
  if (fromState) return fromState

  const params = getOAuthSearchParams(window.location.search, '')
  return getOAuthErrorMessage(params.get('error')) ?? ''
}

export function LoginForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const toast = useToast()
  const [oauthError] = useState(() => readOAuthError(location.state))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(
    (location.state as { message?: string } | null)?.message ?? '',
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(HOME_PATH, { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if ((location.state as { message?: string; oauthError?: string } | null)?.message) {
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
      toast.success('Login successful', `Welcome back, ${nextUser.name}!`)
      navigate(HOME_PATH, { replace: true })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to log in. Please try again.'
      setError(message)
      toast.error('Login failed', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard activeTab="login" imagePosition="right">
      <header className="mb-8">
        <Heading variant="page-lg">Welcome back</Heading>
        <p className="mt-2 font-serif text-xl italic text-accent-muted">Happy to see you again</p>
      </header>

      {(error || oauthError) && (
        <div className="mb-4">
          <FormMessage message={error || oauthError} />
        </div>
      )}
      {success && <div className="mb-4"><FormMessage message={success} type="success" /></div>}

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
                className="text-sm text-link hover:text-link-hover"
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

      <p className="mt-6 text-center text-sm text-secondary-text">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-link hover:text-link-hover">
          Create account
        </Link>
      </p>
    </AuthCard>
  )
}
