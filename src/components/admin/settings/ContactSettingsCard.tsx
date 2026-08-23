// src/components/admin/settings/ContactSettingsCard.tsx
import { Loader2, MessageCircle } from 'lucide-react'
import { useId, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import { useAdminContactSettings } from '../../../hooks/useAdminContactSettings'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import { cn } from '../../../lib/cn'
import { buildWhatsAppUrl } from '../../../utils/contactSettings'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px]',
  'text-sm text-white placeholder:text-white/40',
  focusRingClasses,
)

const labelClass = 'text-xs font-semibold uppercase tracking-[0.08em] text-white/70'

export function ContactSettingsCard() {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const { can } = useAdminPermissions()
  const canUpdate = can('websiteContent', 'update')
  const { values, loading, saving, error, setField, save, reload } = useAdminContactSettings()

  const previewUrl = buildWhatsAppUrl(values.whatsapp)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canUpdate) return
    try {
      await save()
      toast.success(t('admin.settings.contact.saveSuccess'))
    } catch {
      toast.error(t('admin.settings.contact.saveError'))
    }
  }

  return (
    <GlassCard aria-labelledby={`${formId}-title`}>
      <div className="mb-5 flex items-start gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#25D366]">
          <MessageCircle size={20} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id={`${formId}-title`} className="text-base font-bold leading-6 text-white">
            {t('admin.settings.contact.title')}
          </h2>
          <p className="mt-1 text-sm leading-5 text-white/55">{t('admin.settings.contact.subtitle')}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4" aria-hidden>
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      ) : error && !values.phone && !values.email ? (
        <EmptyState
          title={t('admin.settings.loadErrorTitle')}
          description={error}
          action={
            <Button type="button" variant="outline" onClick={() => void reload()}>
              {t('admin.settings.retry')}
            </Button>
          }
        />
      ) : (
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div>
            <label className={labelClass} htmlFor={`${formId}-phone`}>
              {t('admin.settings.contact.phone')}
            </label>
            <input
              id={`${formId}-phone`}
              type="tel"
              value={values.phone}
              disabled={saving}
              onChange={(event) => setField('phone', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
              autoComplete="tel"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-email`}>
              {t('admin.settings.contact.email')}
            </label>
            <input
              id={`${formId}-email`}
              type="email"
              value={values.email}
              disabled={saving}
              onChange={(event) => setField('email', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
              autoComplete="email"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-location`}>
              {t('admin.settings.contact.location')}
            </label>
            <input
              id={`${formId}-location`}
              type="text"
              value={values.location}
              disabled={saving}
              onChange={(event) => setField('location', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-whatsapp`}>
              {t('admin.settings.contact.whatsapp')}
            </label>
            <input
              id={`${formId}-whatsapp`}
              type="tel"
              value={values.whatsapp}
              disabled={saving}
              onChange={(event) => setField('whatsapp', event.target.value)}
              placeholder={t('admin.settings.contact.whatsappPlaceholder')}
              className={cn(fieldClass, 'mt-2')}
              autoComplete="tel"
            />
            <p className="mt-2 text-xs leading-5 text-white/45">
              {t('admin.settings.contact.whatsappHint')}
            </p>
            {previewUrl ? (
              <p className="mt-1 text-xs text-[#25D366]">
                {t('admin.settings.contact.whatsappPreview', { url: previewUrl })}
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm text-support-error" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={saving || !canUpdate} className="w-full justify-center">
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden />
                {t('admin.settings.contact.saving')}
              </>
            ) : (
              t('admin.settings.contact.save')
            )}
          </Button>
        </form>
      )}
    </GlassCard>
  )
}
