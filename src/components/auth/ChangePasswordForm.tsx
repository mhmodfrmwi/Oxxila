import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../api/auth'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../lib/api'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { InputField } from '../ui/InputField'
import { AuthSimpleCard } from './AuthSimpleCard'
import { FormMessage } from './FormMessage'

export function ChangePasswordForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const { token: routeToken } = useParams<{ token?: string }>()
  const [searchParams] = useSearchParams()
  const token = routeToken ?? searchParams.get('token') ?? ''
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      const message = t('auth.reset.tokenMissing')
      setError(message)
      toast.error(t('auth.reset.invalidForm'), message)
      return
    }

    const formData = new FormData(event.currentTarget)
    const newPassword = String(formData.get('newPassword') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (newPassword !== confirmPassword) {
      const message = t('auth.reset.passwordsMismatch')
      setError(message)
      toast.error(t('auth.reset.invalidForm'), message)
      return
    }

    setLoading(true)

    try {
      const response = await resetPassword(token, { newPassword, confirmPassword })
      setSuccess(response.message)
      toast.success(t('auth.reset.successToast'))
      event.currentTarget.reset()

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: t('auth.reset.successMessage') },
        })
      }, 1500)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t('auth.reset.failedFallback')
      setError(message)
      toast.error(t('auth.reset.failedTitle'), message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSimpleCard>
      <header className="mb-8 text-center sm:text-start">
        <Heading variant="page">{t('auth.reset.title')}</Heading>
        <p className="mt-2 text-sm text-secondary-text sm:text-base">
          {t('auth.reset.subtitle')}
        </p>
      </header>

      {!token && (
        <div className="mb-4">
          <FormMessage message={t('auth.reset.tokenMissingPage')} />
        </div>
      )}

      {error && <div className="mb-4"><FormMessage message={error} /></div>}
      {success && <div className="mb-4"><FormMessage message={success} type="success" /></div>}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <InputField
          label={t('auth.fields.newPassword')}
          type="password"
          name="newPassword"
          autoComplete="new-password"
          placeholder={t('auth.fields.passwordPlaceholder')}
          showPasswordToggle
          required
          minLength={8}
        />

        <InputField
          label={t('auth.fields.confirmPassword')}
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder={t('auth.fields.confirmPasswordPlaceholder')}
          showPasswordToggle
          required
          minLength={8}
        />

        <Button type="submit" fullWidth pill className="mt-2 h-14" disabled={loading || !token}>
          {loading ? t('auth.reset.submitting') : t('auth.reset.submit')}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-secondary-text">
        <Link
          to="/login"
          className="font-semibold text-link hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link rounded"
        >
          {t('auth.reset.backToLogin')}
        </Link>
      </p>
    </AuthSimpleCard>
  )
}
