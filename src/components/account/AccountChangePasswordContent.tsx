// src/components/account/AccountChangePasswordContent.tsx
import { useTranslation } from 'react-i18next'
import { useAccountChangePassword } from '../../hooks/useAccountChangePassword'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { InputField } from '../ui/InputField'

export function AccountChangePasswordContent() {
  const { t } = useTranslation()
  const { form, errors, submitting, updateField, handleSubmit } =
    useAccountChangePassword()

  return (
    <div>
      <header className="mb-8">
        <Heading variant="page">{t('profile.password.title')}</Heading>
        <p className="mt-2 text-sm text-secondary-text sm:text-base">
          {t('profile.password.subtitle')}
        </p>
      </header>

      <form className="mx-auto max-w-xl space-y-5" onSubmit={handleSubmit} noValidate>
        <InputField
          label={t('profile.password.current')}
          type="password"
          name="oldPassword"
          autoComplete="current-password"
          showPasswordToggle
          value={form.oldPassword}
          onChange={(event) => updateField('oldPassword', event.target.value)}
          error={errors.oldPassword}
          required
        />
        <InputField
          label={t('profile.password.new')}
          type="password"
          name="newPassword"
          autoComplete="new-password"
          placeholder={t('auth.fields.passwordPlaceholder')}
          showPasswordToggle
          value={form.newPassword}
          onChange={(event) => updateField('newPassword', event.target.value)}
          error={errors.newPassword}
          required
          minLength={8}
        />
        <InputField
          label={t('profile.password.confirm')}
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder={t('auth.fields.confirmPasswordPlaceholder')}
          showPasswordToggle
          value={form.confirmPassword}
          onChange={(event) => updateField('confirmPassword', event.target.value)}
          error={errors.confirmPassword}
          required
          minLength={8}
        />

        <Button
          type="submit"
          fullWidth
          pill
          className="h-14 sm:h-[65px]"
          disabled={submitting}
        >
          {submitting ? t('profile.password.submitting') : t('profile.password.submit')}
        </Button>
      </form>
    </div>
  )
}
