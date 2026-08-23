// src/components/admin/settings/SocialSettingsCard.tsx
import { Loader2, Share2 } from 'lucide-react'
import { useId, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import { useAdminSocialSettings } from '../../../hooks/useAdminSocialSettings'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import type { ApiSocialSettings } from '../../../api/settings'
import { cn } from '../../../lib/cn'
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

const SOCIAL_FIELDS: Array<keyof ApiSocialSettings> = [
  'facebook',
  'twitter',
  'instagram',
  'linkedin',
  'youtube',
]

export function SocialSettingsCard() {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const { can } = useAdminPermissions()
  const canUpdate = can('websiteContent', 'update')
  const { values, loading, saving, error, setField, save, reload } = useAdminSocialSettings()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canUpdate) return
    try {
      await save()
      toast.success(t('admin.settings.social.saveSuccess'))
    } catch {
      toast.error(t('admin.settings.social.saveError'))
    }
  }

  return (
    <GlassCard aria-labelledby={`${formId}-title`}>
      <div className="mb-5 flex items-start gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#a394ff]">
          <Share2 size={20} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id={`${formId}-title`} className="text-base font-bold leading-6 text-white">
            {t('admin.settings.social.title')}
          </h2>
          <p className="mt-1 text-sm leading-5 text-white/55">
            {t('admin.settings.social.subtitle')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4" aria-hidden>
          {SOCIAL_FIELDS.map((field) => (
            <Skeleton key={field} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      ) : error && SOCIAL_FIELDS.every((field) => !values[field]) ? (
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
          {SOCIAL_FIELDS.map((field) => (
            <div key={field}>
              <label className={labelClass} htmlFor={`${formId}-${field}`}>
                {t(`admin.settings.social.${field}`)}
              </label>
              <input
                id={`${formId}-${field}`}
                type="url"
                value={values[field]}
                disabled={saving}
                onChange={(event) => setField(field, event.target.value)}
                placeholder="https://..."
                className={cn(fieldClass, 'mt-2')}
              />
            </div>
          ))}

          {error ? (
            <p className="text-sm text-support-error" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={saving || !canUpdate} className="w-full justify-center">
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden />
                {t('admin.settings.social.saving')}
              </>
            ) : (
              t('admin.settings.social.save')
            )}
          </Button>
        </form>
      )}
    </GlassCard>
  )
}
