// src/components/admin/settings/InstagramSettingsCard.tsx
import { ImageIcon, Loader2, Upload } from 'lucide-react'
import { useId, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import { useAdminInstagramSettings } from '../../../hooks/useAdminInstagramSettings'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import { INSTAGRAM_SLOT_COUNT } from '../../../api/settings'
import { cn } from '../../../lib/cn'
import { AdminButton } from '../ui/AdminButton'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

const fieldClass = cn(
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2',
  'text-sm text-white placeholder:text-white/40',
  focusRingClasses,
)

const labelClass = 'mb-1 block text-[11px] font-medium text-white/50'

export function InstagramSettingsCard() {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const { can } = useAdminPermissions()
  const canUpdate = can('websiteContent', 'update')
  const { slots, loading, saving, error, setSlotField, setSlotImageFile, save, reload } =
    useAdminInstagramSettings()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canUpdate) return
    try {
      await save()
      toast.success(t('admin.settings.instagram.saveSuccess'))
    } catch {
      toast.error(t('admin.settings.instagram.saveError'))
    }
  }

  return (
    <GlassCard aria-labelledby={`${formId}-title`}>
      <div className="mb-4">
        <h2 id={`${formId}-title`} className="text-base font-bold text-white">
          {t('admin.settings.instagram.title')}
        </h2>
        <p className="mt-1 text-sm text-white/50">
          {t('admin.settings.instagram.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-hidden>
          {Array.from({ length: INSTAGRAM_SLOT_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : error && slots.every((slot) => !slot.image && !slot.postUrl) ? (
        <EmptyState
          title={t('admin.settings.loadErrorTitle')}
          description={error}
          action={
            <AdminButton type="button" variant="outline" onClick={() => void reload()}>
              {t('admin.settings.retry')}
            </AdminButton>
          }
        />
      ) : (
        <form
          className="space-y-3"
          onSubmit={(event) => void handleSubmit(event)}
          noValidate
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2.5"
              >
                <div className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5">
                  <div className="size-[4.5rem] overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    {slot.previewUrl ? (
                      <img
                        src={slot.previewUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-0.5 text-white/25">
                        <ImageIcon size={14} aria-hidden />
                        <span className="text-[9px]">{t('admin.settings.instagram.noThumbnail')}</span>
                      </div>
                    )}
                  </div>
                  <label
                    className={cn(
                      'inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-md',
                      'border border-white/10 bg-white/5 px-1.5 py-1',
                      'text-[10px] font-medium text-white/70 hover:bg-white/10',
                      focusRingClasses,
                      (saving || !canUpdate) && 'pointer-events-none opacity-50',
                    )}
                  >
                    <Upload size={10} aria-hidden />
                    {t('admin.settings.instagram.uploadThumbnail')}
                    <input
                      id={`${formId}-file-${index}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={saving || !canUpdate}
                      className="sr-only"
                      onChange={(event) => {
                        setSlotImageFile(index, event.target.files?.[0] ?? null)
                        event.target.value = ''
                      }}
                    />
                  </label>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-[11px] font-semibold text-white/45">
                    {t('admin.settings.instagram.slotLabel', { number: index + 1 })}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-post-${index}`}>
                        {t('admin.settings.instagram.postUrl')}
                      </label>
                      <input
                        id={`${formId}-post-${index}`}
                        type="url"
                        value={slot.postUrl}
                        disabled={saving || !canUpdate}
                        onChange={(event) => setSlotField(index, 'postUrl', event.target.value)}
                        placeholder="https://instagram.com/p/..."
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-alt-${index}`}>
                        {t('admin.settings.instagram.alt')}
                      </label>
                      <input
                        id={`${formId}-alt-${index}`}
                        type="text"
                        value={slot.alt}
                        disabled={saving || !canUpdate}
                        onChange={(event) => setSlotField(index, 'alt', event.target.value)}
                        placeholder={t('admin.settings.instagram.altPlaceholder')}
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <p className="text-sm text-support-error" role="alert">
              {error}
            </p>
          ) : null}

          <AdminButton type="submit" disabled={saving || !canUpdate}>
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden />
                {t('admin.settings.instagram.saving')}
              </>
            ) : (
              t('admin.settings.instagram.save')
            )}
          </AdminButton>
        </form>
      )}
    </GlassCard>
  )
}
