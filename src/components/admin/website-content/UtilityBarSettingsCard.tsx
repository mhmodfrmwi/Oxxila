// src/components/admin/website-content/UtilityBarSettingsCard.tsx
import { Loader2, Package, Plus, Trash2 } from 'lucide-react'
import { useId, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import { useAdminUtilityBarSettings } from '../../../hooks/useAdminUtilityBarSettings'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import { cn } from '../../../lib/cn'
import { AdminButton } from '../ui/AdminButton'
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

export function UtilityBarSettingsCard() {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const { can } = useAdminPermissions()
  const canUpdate = can('websiteContent', 'update')
  const {
    values,
    loading,
    saving,
    error,
    setPromoField,
    addPromo,
    removePromo,
    setRotateIntervalSeconds,
    save,
    reload,
    maxPromos,
  } = useAdminUtilityBarSettings()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canUpdate) return
    try {
      await save()
      toast.success(t('admin.websiteContent.utilityBar.saveSuccess'))
    } catch {
      toast.error(t('admin.websiteContent.utilityBar.saveError'))
    }
  }

  const hasContent = values.promos.some(
    (promo) => promo.title.trim() || promo.subtitle.trim(),
  )

  return (
    <GlassCard aria-labelledby={`${formId}-title`}>
      <div className="mb-5 flex items-start gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent">
          <Package size={20} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id={`${formId}-title`} className="text-base font-bold leading-6 text-white">
            {t('admin.websiteContent.utilityBar.title')}
          </h2>
          <p className="mt-1 text-sm leading-5 text-white/55">
            {t('admin.websiteContent.utilityBar.subtitle')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3" aria-hidden>
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : error && !hasContent ? (
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
        <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <label className={labelClass} htmlFor={`${formId}-rotate`}>
              {t('admin.websiteContent.utilityBar.rotateInterval')}
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id={`${formId}-rotate`}
                type="number"
                min={3}
                max={60}
                step={1}
                value={values.rotateIntervalSeconds}
                disabled={saving || !canUpdate}
                onChange={(event) =>
                  setRotateIntervalSeconds(Number(event.target.value) || 6)
                }
                className={cn(fieldClass, 'max-w-[8rem]')}
              />
              <span className="text-sm text-white/50">
                {t('admin.websiteContent.utilityBar.rotateIntervalUnit')}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/45">
              {t('admin.websiteContent.utilityBar.rotateHint')}
            </p>
          </div>

          <div className="space-y-4">
            {values.promos.map((promo, index) => (
              <fieldset
                key={index}
                className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <legend className="px-1 text-sm font-semibold text-white">
                    {t('admin.websiteContent.utilityBar.slideLabel', { number: index + 1 })}
                  </legend>
                  {values.promos.length > 1 && canUpdate ? (
                    <button
                      type="button"
                      onClick={() => removePromo(index)}
                      disabled={saving}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-red-300/80 transition hover:bg-red-500/10 hover:text-red-200',
                        focusRingClasses,
                      )}
                    >
                      <Trash2 size={14} aria-hidden />
                      {t('admin.websiteContent.utilityBar.removeSlide')}
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor={`${formId}-${index}-title`}>
                      {t('admin.websiteContent.utilityBar.promoTitle')}
                    </label>
                    <input
                      id={`${formId}-${index}-title`}
                      type="text"
                      value={promo.title}
                      disabled={saving}
                      onChange={(event) => setPromoField(index, 'title', event.target.value)}
                      placeholder={t('admin.websiteContent.utilityBar.titlePlaceholder')}
                      className={cn(fieldClass, 'mt-2')}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`${formId}-${index}-subtitle`}>
                      {t('admin.websiteContent.utilityBar.promoSubtitle')}
                    </label>
                    <input
                      id={`${formId}-${index}-subtitle`}
                      type="text"
                      value={promo.subtitle}
                      disabled={saving}
                      onChange={(event) => setPromoField(index, 'subtitle', event.target.value)}
                      placeholder={t('admin.websiteContent.utilityBar.subtitlePlaceholder')}
                      className={cn(fieldClass, 'mt-2')}
                    />
                  </div>
                </div>
              </fieldset>
            ))}
          </div>

          {canUpdate && values.promos.length < maxPromos ? (
            <AdminButton type="button" variant="outline" size="sm" disabled={saving} onClick={addPromo}>
              <Plus size={16} aria-hidden />
              {t('admin.websiteContent.utilityBar.addSlide')}
            </AdminButton>
          ) : null}

          <div className="flex justify-end">
            <AdminButton type="submit" disabled={saving || !canUpdate}>
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden />
                  {t('admin.websiteContent.utilityBar.saving')}
                </>
              ) : (
                t('admin.websiteContent.utilityBar.save')
              )}
            </AdminButton>
          </div>
        </form>
      )}
    </GlassCard>
  )
}
