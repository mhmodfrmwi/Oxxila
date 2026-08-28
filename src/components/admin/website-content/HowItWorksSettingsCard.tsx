// src/components/admin/website-content/HowItWorksSettingsCard.tsx
import { ImageIcon, Loader2, PlayCircle, Upload } from 'lucide-react'
import { useId, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import { useAdminHowItWorksSettings } from '../../../hooks/useAdminHowItWorksSettings'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
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

export function HowItWorksSettingsCard() {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const { can } = useAdminPermissions()
  const canUpdate = can('websiteContent', 'update')
  const {
    values,
    thumbnailPreview,
    loading,
    saving,
    error,
    setField,
    setStepField,
    setThumbnailImageFile,
    save,
    reload,
  } = useAdminHowItWorksSettings()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canUpdate) return
    try {
      await save()
      toast.success(t('admin.websiteContent.howItWorks.saveSuccess'))
    } catch {
      toast.error(t('admin.websiteContent.howItWorks.saveError'))
    }
  }

  return (
    <GlassCard aria-labelledby={`${formId}-title`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent">
          <PlayCircle size={18} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id={`${formId}-title`} className="text-base font-bold leading-6 text-white">
            {t('admin.websiteContent.howItWorks.title')}
          </h2>
          <p className="mt-1 text-sm leading-5 text-white/55">
            {t('admin.websiteContent.howItWorks.subtitle')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3" aria-hidden>
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      ) : error && !values.title && values.steps.every((step) => !step.title) ? (
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
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div>
            <label className={labelClass} htmlFor={`${formId}-title-input`}>
              {t('admin.websiteContent.howItWorks.sectionTitle')}
            </label>
            <input
              id={`${formId}-title-input`}
              type="text"
              value={values.title}
              disabled={saving || !canUpdate}
              onChange={(event) => setField('title', event.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-white/45">
              {t('admin.websiteContent.howItWorks.videoBlock')}
            </p>
            <div className="flex items-start gap-3">
              <div className="w-28 shrink-0 space-y-1.5 sm:w-32">
                <div className="aspect-video overflow-hidden rounded-lg border border-white/10 bg-white/5">
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-0.5 text-white/25">
                      <ImageIcon size={14} aria-hidden />
                      <span className="text-[9px]">
                        {t('admin.websiteContent.howItWorks.noThumbnail')}
                      </span>
                    </div>
                  )}
                </div>
                <label
                  className={cn(
                    'inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-md',
                    'border border-white/10 bg-white/5 px-1.5 py-1.5',
                    'text-[10px] font-medium text-white/70 hover:bg-white/10',
                    focusRingClasses,
                    (saving || !canUpdate) && 'pointer-events-none opacity-50',
                  )}
                >
                  <Upload size={10} aria-hidden />
                  {t('admin.websiteContent.howItWorks.uploadThumbnail')}
                  <input
                    id={`${formId}-thumb-file`}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={saving || !canUpdate}
                    className="sr-only"
                    onChange={(event) => {
                      setThumbnailImageFile(event.target.files?.[0] ?? null)
                      event.target.value = ''
                    }}
                  />
                </label>
              </div>

              <div className="min-w-0 flex-1 space-y-2 self-center">
                <div>
                  <label className={labelClass} htmlFor={`${formId}-video`}>
                    {t('admin.websiteContent.howItWorks.videoUrl')}
                  </label>
                  <input
                    id={`${formId}-video`}
                    type="url"
                    value={values.videoUrl}
                    disabled={saving || !canUpdate}
                    onChange={(event) => setField('videoUrl', event.target.value)}
                    placeholder="https://..."
                    className={fieldClass}
                  />
                </div>
                {values.thumbnailImage ? (
                  <p className="truncate text-[11px] text-white/35" title={values.thumbnailImage}>
                    {t('admin.websiteContent.howItWorks.thumbnailSaved')}: {values.thumbnailImage}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/45">
              {t('admin.websiteContent.howItWorks.stepsHeading')}
            </p>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {values.steps.map((step, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
                >
                  <p className="mb-2 text-[11px] font-semibold text-white/45">
                    {t('admin.websiteContent.howItWorks.stepLabel', { number: index + 1 })}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-step-title-${index}`}>
                        {t('admin.websiteContent.howItWorks.stepTitle')}
                      </label>
                      <input
                        id={`${formId}-step-title-${index}`}
                        type="text"
                        value={step.title}
                        disabled={saving || !canUpdate}
                        onChange={(event) => setStepField(index, 'title', event.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-step-desc-${index}`}>
                        {t('admin.websiteContent.howItWorks.stepDescription')}
                      </label>
                      <textarea
                        id={`${formId}-step-desc-${index}`}
                        value={step.description}
                        disabled={saving || !canUpdate}
                        rows={3}
                        onChange={(event) =>
                          setStepField(index, 'description', event.target.value)
                        }
                        className={cn(fieldClass, 'resize-y')}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                {t('admin.websiteContent.howItWorks.saving')}
              </>
            ) : (
              t('admin.websiteContent.howItWorks.save')
            )}
          </AdminButton>
        </form>
      )}
    </GlassCard>
  )
}
