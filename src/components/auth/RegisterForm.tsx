// src/components/auth/RegisterForm.tsx
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/auth'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../lib/api'
import {
  hasFieldErrors,
  validateRegisterFields,
  type RegisterFieldErrors,
} from '../../utils/authValidation'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { InputField } from '../ui/InputField'
import { AuthCard } from './AuthCard'
import { FormMessage } from './FormMessage'
import { PasswordStrength } from './PasswordStrength'
import { SocialLoginButtons } from './SocialLoginButtons'

export function RegisterForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const nextPassword = String(formData.get('password') ?? '')

    const nextFieldErrors = validateRegisterFields(
      { name, email, phone, password: nextPassword },
      t,
    )
    setFieldErrors(nextFieldErrors)
    if (hasFieldErrors(nextFieldErrors)) return

    setLoading(true)

    try {
      await register({ name, email, phone, password: nextPassword })
      const successMessage = t('auth.register.successMessage')
      toast.success(t('auth.register.successTitle'), successMessage)
      navigate('/login', {
        replace: true,
        state: { message: successMessage },
      })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t('auth.register.failedFallback')
      setError(message)
      toast.error(t('auth.register.failedTitle'), message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard activeTab="signup" imagePosition="left">
      <header className="mb-8">
        <Heading variant="page-lg">{t('auth.register.title')}</Heading>
        <p className="mt-2 font-serif text-xl text-secondary-text">
          {t('auth.register.subtitle')}
        </p>
      </header>

      {error && <div className="mb-4"><FormMessage message={error} /></div>}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <InputField
          label={t('auth.register.fullName')}
          type="text"
          name="name"
          autoComplete="name"
          placeholder={t('auth.register.namePlaceholder')}
          required
          error={fieldErrors.name}
          onChange={() => setFieldErrors((prev) => ({ ...prev, name: undefined }))}
        />

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

        <InputField
          label={t('auth.register.phone')}
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder={t('auth.register.phonePlaceholder')}
          inputMode="tel"
          required
          error={fieldErrors.phone}
          onChange={() => setFieldErrors((prev) => ({ ...prev, phone: undefined }))}
        />

        <div className="space-y-2">
          <InputField
            label={t('auth.register.createPassword')}
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder={t('auth.fields.passwordPlaceholder')}
            showPasswordToggle
            required
            minLength={8}
            value={password}
            error={fieldErrors.password}
            onChange={(e) => {
              setPassword(e.target.value)
              setFieldErrors((prev) => ({ ...prev, password: undefined }))
            }}
          />
          <PasswordStrength password={password} />
        </div>

        <Button type="submit" fullWidth pill className="h-14 sm:h-[65px]" disabled={loading}>
          {loading ? t('auth.register.submitting') : t('auth.register.submit')}
        </Button>

        <SocialLoginButtons disabled={loading} />
      </form>

      <p className="mt-6 text-center text-sm text-secondary-text">
        {t('auth.register.hasAccount')}{' '}
        <Link to="/login" className="font-medium text-link hover:text-link-hover">
          {t('auth.register.loginHere')}
        </Link>
      </p>
    </AuthCard>
  )
}
