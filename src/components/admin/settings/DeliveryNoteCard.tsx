// src/components/admin/settings/DeliveryNoteCard.tsx
import { Loader2, Truck } from 'lucide-react'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { getDeliverySettings, updateDeliverySettings, type ApiDeliverySettings } from '../../../api/settings'
import { useToast } from '../../../context/ToastContext'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import { ApiError } from '../../../lib/api'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { AdminButton } from '../ui/AdminButton'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px]',
  'text-sm text-white placeholder:text-white/40',
  focusRingClasses,
)
const labelClass = 'text-xs font-semibold uppercase tracking-[0.08em] text-white/70'

/**
 * General delivery-time note shown to shoppers on the order confirmation page and in the
 * confirmation email. The courier/ETA is assigned later from Shipping, so the storefront
 * only promises this window.
 */
export function DeliveryNoteCard() {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const { can } = useAdminPermissions()
  const canUpdate = can('settings', 'update')
  const [values, setValues] = useState<ApiDeliverySettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getDeliverySettings()
      .then((response) => {
        if (!cancelled) setValues(response.data ?? null)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : t('admin.settings.loadErrorTitle'))
      })
    return () => {
      cancelled = true
    }
  }, [t])

  function patch<K extends keyof ApiDeliverySettings>(key: K, value: ApiDeliverySettings[K]) {
    setValues((current) => (current ? { ...current, [key]: value } : current))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!values || !canUpdate) return
    if (values.maxDays < values.minDays) {
      setError(t('admin.settings.delivery.daysOrder'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const response = await updateDeliverySettings(values)
      setValues(response.data ?? values)
      toast.success(t('admin.settings.delivery.saveSuccess'))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('admin.settings.delivery.saveError')
      setError(message)
      toast.error(t('admin.settings.delivery.saveError'), message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <GlassCard aria-labelledby={`${formId}-title`}>
      <div className="mb-5 flex items-start gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#a394ff]">
          <Truck size={20} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id={`${formId}-title`} className="text-base font-bold leading-6 text-white">
            {t('admin.settings.delivery.title')}
          </h2>
          <p className="mt-1 text-sm leading-5 text-white/55">{t('admin.settings.delivery.subtitle')}</p>
        </div>
      </div>

      {!values ? (
        error ? (
          <p className="text-sm text-support-error" role="alert">
            {error}
          </p>
        ) : (
          <div className="space-y-4" aria-hidden>
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        )
      ) : (
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div>
            <label className={labelClass} htmlFor={`${formId}-ar`}>
              {t('admin.settings.delivery.messageAr')}
            </label>
            <input
              id={`${formId}-ar`}
              dir="rtl"
              value={values.messageAr}
              maxLength={240}
              disabled={saving}
              onChange={(event) => patch('messageAr', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`${formId}-en`}>
              {t('admin.settings.delivery.messageEn')}
            </label>
            <input
              id={`${formId}-en`}
              dir="ltr"
              value={values.messageEn}
              maxLength={240}
              disabled={saving}
              onChange={(event) => patch('messageEn', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor={`${formId}-min`}>
                {t('admin.settings.delivery.minDays')}
              </label>
              <input
                id={`${formId}-min`}
                type="number"
                min={0}
                max={60}
                value={values.minDays}
                disabled={saving}
                onChange={(event) => patch('minDays', Number(event.target.value))}
                className={cn(fieldClass, 'mt-2')}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${formId}-max`}>
                {t('admin.settings.delivery.maxDays')}
              </label>
              <input
                id={`${formId}-max`}
                type="number"
                min={0}
                max={60}
                value={values.maxDays}
                disabled={saving}
                onChange={(event) => patch('maxDays', Number(event.target.value))}
                className={cn(fieldClass, 'mt-2')}
              />
            </div>
          </div>

          {error ? (
            <p className="text-sm text-support-error" role="alert">
              {error}
            </p>
          ) : null}

          <AdminButton type="submit" disabled={saving || !canUpdate} fullWidth>
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden />
                {t('admin.settings.delivery.saving')}
              </>
            ) : (
              t('admin.settings.delivery.save')
            )}
          </AdminButton>
        </form>
      )}
    </GlassCard>
  )
}
