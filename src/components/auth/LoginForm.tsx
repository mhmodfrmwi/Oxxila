// src/components/auth/LoginForm.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../lib/api'
import { getOAuthErrorMessage, getOAuthSearchParams } from '../../utils/oauth'
import { consumeOAuthError } from '../../utils/oauthBootstrap'
import { resolvePostLoginPath } from '../../utils/postLoginRedirect'
import {
  hasFieldErrors,
  validateLoginFields,
  type LoginFieldErrors,
} from '../../utils/authValidation'
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
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuth()
  const toast = useToast()
  const returnTo =
    typeof (location.state as { from?: unknown } | null)?.from === 'string'
      ? (location.state as { from: string }).from
      : null
  const [oauthError] = useState(() => readOAuthError(location.state))
  const [error, setError] = useState(() =>
    (location.state as { sessionExpired?: boolean } | null)?.sessionExpired
      ? t('auth.session.expired')
      : '',
  )
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
  const [success, setSuccess] = useState(
    (location.state as { message?: string; sessionExpired?: boolean } | null)?.sessionExpired
      ? ''
      : ((location.state as { message?: string } | null)?.message ?? ''),
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(resolvePostLoginPath(user?.role, returnTo), { replace: true })
    }
  }, [isAuthenticated, navigate, returnTo, user?.role])

  useEffect(() => {
    const state = location.state as {
      message?: string
      oauthError?: string
      sessionExpired?: boolean
    } | null
    if (state?.message || state?.sessionExpired) {
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

    const nextFieldErrors = validateLoginFields(email, password, t)
    setFieldErrors(nextFieldErrors)
    if (hasFieldErrors(nextFieldErrors)) return

    setLoading(true)

    try {
      const nextUser = await login({ email, password })
      toast.success(t('auth.login.successTitle'), t('auth.login.welcomeBack', { name: nextUser.name }))
      navigate(resolvePostLoginPath(nextUser.role, returnTo), { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t('auth.login.failedFallback')
      setError(message)
      toast.error(t('auth.login.failedTitle'), message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard activeTab="login" imagePosition="right">
      <header className="mb-8">
        <Heading variant="page-lg">{t('auth.login.title')}</Heading>
        <p className="mt-2 font-serif text-xl italic text-accent-muted">{t('auth.login.subtitle')}</p>
      </header>

      {(error || oauthError) && (
        <div className="mb-4">
          <FormMessage message={error || oauthError} />
        </div>
      )}
      {success && <div className="mb-4"><FormMessage message={success} type="success" /></div>}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <InputField
            label={t('auth.fields.email')}
            type="email"
            name="email"
            autoComplete="email"
            placeholder={t('auth.fields.emailPlaceholder')}
            required
            error={fieldErrors.email}
            onChange={() => setFieldErrors((prev) => ({ ...prev, email: undefined }))}
          />

          <div>
            <InputField
              label={t('auth.fields.password')}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder={t('auth.fields.passwordPlaceholder')}
              showPasswordToggle
              required
              minLength={8}
              error={fieldErrors.password}
              onChange={() => setFieldErrors((prev) => ({ ...prev, password: undefined }))}
            />
            <div className="mt-2 text-end">
              <Link
                to="/forgot-password"
                className="text-sm text-link hover:text-link-hover"
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
          </div>

          <Button type="submit" fullWidth pill className="h-14 sm:h-[65px]" disabled={loading}>
          {loading ? t('auth.login.submitting') : t('auth.login.submit')}
        </Button>

          <SocialLoginButtons disabled={loading} />
      </form>

      <p className="mt-6 text-center text-sm text-secondary-text">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className="font-medium text-link hover:text-link-hover">
          {t('auth.login.createAccount')}
        </Link>
      </p>
    </AuthCard>
  )
}
