// src/components/account/ProfilePageContent.tsx
import { Camera } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfilePage } from '../../hooks/useProfilePage'
import { cn } from '../../lib/cn'
import { FormMessage } from '../auth/FormMessage'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { InputField } from '../ui/InputField'
import { focusRingClasses } from '../ui/interactionStyles'
import { UserAvatar } from './UserAvatar'

function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="mx-auto h-28 w-28 animate-pulse rounded-full bg-surface-muted" />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="h-14 animate-pulse rounded-xl bg-surface-muted" />
        <div className="h-14 animate-pulse rounded-xl bg-surface-muted" />
        <div className="h-14 animate-pulse rounded-xl bg-surface-muted" />
        <div className="h-14 animate-pulse rounded-xl bg-surface-muted" />
      </div>
      <div className="h-14 animate-pulse rounded-full bg-surface-muted" />
    </div>
  )
}

export function ProfilePageContent() {
  const { t } = useTranslation()
  const avatarInputId = useId()
  const {
    form,
    errors,
    avatar,
    avatarError,
    loading,
    submitting,
    uploadingAvatar,
    loadError,
    displayName,
    updateField,
    handleAvatarChange,
    handleSubmit,
    reloadProfile,
  } = useProfilePage()

  const avatarBusy = submitting || uploadingAvatar

  return (
    <div>
      <header className="mb-8">
        <Heading variant="page">{t('profile.title')}</Heading>
        <p className="mt-2 text-sm text-secondary-text sm:text-base">
          {t('profile.subtitle')}
        </p>
      </header>

      {loading ? (
        <ProfileSkeleton />
      ) : loadError ? (
        <div className="space-y-4" role="alert">
          <FormMessage message={loadError} />
          <Button type="button" variant="outline" onClick={() => void reloadProfile()}>
            {t('profile.retry')}
          </Button>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <UserAvatar
                name={displayName || t('profile.photoAlt')}
                src={avatar}
                size="lg"
                alt={displayName}
              />
              <label
                htmlFor={avatarInputId}
                className={cn(
                  'absolute -bottom-1 -end-1 flex h-9 w-9 cursor-pointer items-center justify-center',
                  'rounded-full border border-border-subtle bg-card text-button-primary shadow-sm',
                  'hover:bg-accent/10',
                  focusRingClasses,
                  avatarBusy && 'pointer-events-none opacity-60',
                )}
              >
                <Camera size={16} aria-hidden />
                <span className="sr-only">{t('profile.changePhoto')}</span>
              </label>
              <input
                id={avatarInputId}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="sr-only"
                onChange={handleAvatarChange}
                disabled={avatarBusy}
              />
            </div>
            {uploadingAvatar && (
              <p className="text-xs text-secondary-text">{t('profile.uploadingPhoto')}</p>
            )}
            {avatarError && (
              <div className="w-full max-w-md">
                <FormMessage message={avatarError} />
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label={t('profile.fields.firstName')}
              name="firstName"
              autoComplete="given-name"
              placeholder={t('profile.fields.firstNamePlaceholder')}
              value={form.firstName}
              onChange={(event) => updateField('firstName', event.target.value)}
              error={errors.firstName}
              required
            />
            <InputField
              label={t('profile.fields.lastName')}
              name="lastName"
              autoComplete="family-name"
              placeholder={t('profile.fields.lastNamePlaceholder')}
              value={form.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
              error={errors.lastName}
            />
            <InputField
              label={t('profile.fields.email')}
              type="email"
              name="email"
              autoComplete="email"
              placeholder={t('profile.fields.emailPlaceholder')}
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              error={errors.email}
              required
            />
            <InputField
              label={t('profile.fields.phone')}
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              placeholder={t('profile.fields.phonePlaceholder')}
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              error={errors.phone}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            pill
            className="h-14 sm:h-[65px]"
            disabled={submitting || uploadingAvatar}
          >
            {submitting ? t('profile.saving') : t('profile.saveChanges')}
          </Button>
        </form>
      )}
    </div>
  )
}
