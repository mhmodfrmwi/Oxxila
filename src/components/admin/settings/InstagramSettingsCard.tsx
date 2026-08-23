// src/components/admin/settings/InstagramSettingsCard.tsx
import { ImageIcon, Loader2 } from 'lucide-react'
import { useId, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import { useAdminInstagramSettings } from '../../../hooks/useAdminInstagramSettings'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import { INSTAGRAM_SLOT_COUNT } from '../../../api/settings'
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
      <div className="mb-5 flex items-start gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#E1306C]">
          <ImageIcon size={20} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id={`${formId}-title`} className="text-base font-bold leading-6 text-white">
            {t('admin.settings.instagram.title')}
          </h2>
          <p className="mt-1 text-sm leading-5 text-white/55">
            {t('admin.settings.instagram.subtitle')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-hidden>
          {Array.from({ length: INSTAGRAM_SLOT_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : error && slots.every((slot) => !slot.image && !slot.postUrl) ? (
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
        <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/50">
                  {t('admin.settings.instagram.slotLabel', { number: index + 1 })}
                </p>

                <div className="mb-3 aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  {slot.previewUrl ? (
                    <img
                      src={slot.previewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-white/30">
                      {t('admin.settings.instagram.noImage')}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={labelClass} htmlFor={`${formId}-image-${index}`}>
                      {t('admin.settings.instagram.imageUrl')}
                    </label>
                    <input
                      id={`${formId}-image-${index}`}
                      type="url"
                      value={slot.image}
                      disabled={saving}
                      onChange={(event) => setSlotField(index, 'image', event.target.value)}
                      placeholder="https://..."
                      className={cn(fieldClass, 'mt-2')}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor={`${formId}-file-${index}`}>
                      {t('admin.settings.instagram.upload')}
                    </label>
                    <input
                      id={`${formId}-file-${index}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={saving}
                      onChange={(event) =>
                        setSlotImageFile(index, event.target.files?.[0] ?? null)
                      }
                      className={cn(fieldClass, 'mt-2 file:me-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white')}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor={`${formId}-post-${index}`}>
                      {t('admin.settings.instagram.postUrl')}
                    </label>
                    <input
                      id={`${formId}-post-${index}`}
                      type="url"
                      value={slot.postUrl}
                      disabled={saving}
                      onChange={(event) => setSlotField(index, 'postUrl', event.target.value)}
                      placeholder="https://instagram.com/p/..."
                      className={cn(fieldClass, 'mt-2')}
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
                      disabled={saving}
                      onChange={(event) => setSlotField(index, 'alt', event.target.value)}
                      className={cn(fieldClass, 'mt-2')}
                    />
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

          <Button type="submit" disabled={saving || !canUpdate} className="w-full justify-center">
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden />
                {t('admin.settings.instagram.saving')}
              </>
            ) : (
              t('admin.settings.instagram.save')
            )}
          </Button>
        </form>
      )}
    </GlassCard>
  )
}
