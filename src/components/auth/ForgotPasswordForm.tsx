// src/components/auth/ForgotPasswordForm.tsx
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../api/auth'
import { ApiError } from '../../lib/api'
import {
  hasFieldErrors,
  validateForgotPasswordFields,
  type ForgotPasswordFieldErrors,
} from '../../utils/authValidation'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { InputField } from '../ui/InputField'
import { AuthSimpleCard } from './AuthSimpleCard'
import { FormMessage } from './FormMessage'

export function ForgotPasswordForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<ForgotPasswordFieldErrors>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()

    const nextFieldErrors = validateForgotPasswordFields(email, t)
    setFieldErrors(nextFieldErrors)
    if (hasFieldErrors(nextFieldErrors)) return

    setLoading(true)

    try {
      const response = await forgotPassword(email)
      navigate('/forgot-password/verify', {
        state: { email, message: response.message },
      })
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t('auth.forgot.failedFallback'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSimpleCard>
      <header className="mb-8 text-center sm:text-start">
        <Heading variant="page">{t('auth.forgot.title')}</Heading>
        <p className="mt-2 text-sm text-secondary-text sm:text-base">
          {t('auth.forgot.subtitle')}
        </p>
      </header>

      {error && <div className="mb-4"><FormMessage message={error} /></div>}

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
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

        <Button type="submit" fullWidth pill className="h-14" disabled={loading}>
          {loading ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-secondary-text">
        {t('auth.forgot.rememberPassword')}{' '}
        <Link
          to="/login"
          className="font-semibold text-link hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link rounded"
        >
          {t('auth.forgot.backToLogin')}
        </Link>
      </p>
    </AuthSimpleCard>
  )
}
