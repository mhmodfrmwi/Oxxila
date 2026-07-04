import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../api/auth'
import { ApiError } from '../../lib/api'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { AuthSimpleCard } from './AuthSimpleCard'
import { FormMessage } from './FormMessage'

interface VerifyLocationState {
  email?: string
  message?: string
}

export function VerifyOtpForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as VerifyLocationState | null) ?? {}
  const email = state.email ?? ''
  const [message, setMessage] = useState(state.message ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleResend() {
    if (!email) {
      setError(t('auth.verify.enterEmailFirst'))
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await forgotPassword(email)
      setMessage(response.message)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t('auth.verify.resendFailed'),
      )
    } finally {
      setLoading(false)
    }
  }

  if (!email) {
    return (
      <AuthSimpleCard>
        <header className="mb-8 text-center sm:text-start">
          <Heading variant="page">{t('auth.verify.title')}</Heading>
          <p className="mt-2 text-sm text-secondary-text sm:text-base">
            {t('auth.verify.subtitleNoEmail')}
          </p>
        </header>
        <Button type="button" fullWidth pill className="h-14" onClick={() => navigate('/forgot-password')}>
          {t('auth.verify.goToForgot')}
        </Button>
      </AuthSimpleCard>
    )
  }

  return (
    <AuthSimpleCard>
      <header className="mb-8 text-center sm:text-start">
        <Heading variant="page">{t('auth.verify.title')}</Heading>
        <p className="mt-2 text-sm text-secondary-text sm:text-base">
          {t('auth.verify.subtitleWithEmail', { email })}
        </p>
      </header>

      {error && <div className="mb-4"><FormMessage message={error} /></div>}
      {message && <div className="mb-4"><FormMessage message={message} type="success" /></div>}

      <div className="space-y-4">
        <Button type="button" fullWidth pill className="h-14" onClick={() => navigate('/login')}>
          {t('auth.verify.backToLogin')}
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-secondary-text">
        {t('auth.verify.didNotReceive')}{' '}
        <button
          type="button"
          className="font-semibold text-link hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link rounded disabled:opacity-50"
          onClick={handleResend}
          disabled={loading}
        >
          {loading ? t('auth.verify.sending') : t('auth.verify.resendLink')}
        </button>
      </p>

      <p className="mt-3 text-center text-sm text-secondary-text">
        <Link
          to="/forgot-password"
          className="font-semibold text-link hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link rounded"
        >
          {t('auth.verify.changeEmail')}
        </Link>
      </p>
    </AuthSimpleCard>
  )
}
