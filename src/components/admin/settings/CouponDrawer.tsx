// src/components/admin/settings/CouponDrawer.tsx
import { Loader2 } from 'lucide-react'
import { useCallback, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import {
  useCouponDrawer,
  type CouponDrawerMode,
} from '../../../hooks/useCouponDrawer'
import { cn } from '../../../lib/cn'
import type { AdminCouponRow } from '../../../types/adminCoupons'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'

interface CouponDrawerProps {
  open: boolean
  mode: CouponDrawerMode
  couponId: string | null
  onClose: () => void
  onSaved: (coupon: AdminCouponRow) => void
}

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[17px] py-[13px]',
  'text-sm text-white placeholder:text-white/40',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-support-error">{message}</p>
}

export function CouponDrawer({
  open,
  mode,
  couponId,
  onClose,
  onSaved,
}: CouponDrawerProps) {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const locale = i18n.language

  const drawer = useCouponDrawer({
    open,
    mode,
    couponId,
    locale,
    onSaved: (coupon) => {
      toast.success(
        mode === 'create'
          ? t('admin.settings.coupons.drawer.createSuccess')
          : t('admin.settings.coupons.drawer.updateSuccess'),
      )
      onSaved(coupon)
      onClose()
    },
  })

  const handleClose = useCallback(() => {
    if (drawer.submitting) return
    onClose()
  }, [drawer.submitting, onClose])

  const title =
    mode === 'create'
      ? t('admin.settings.coupons.drawer.createTitle')
      : t('admin.settings.coupons.drawer.editTitle')

  const footer =
    !drawer.loading && !drawer.loadError ? (
      <button
        type="submit"
        form={formId}
        disabled={drawer.submitting}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-2xl',
          'bg-gradient-to-r from-[#a394ff] to-[#8274d6] px-4 py-3.5',
          'text-sm font-bold text-white',
          'disabled:cursor-not-allowed disabled:opacity-50',
          focusRingClasses,
        )}
      >
        {drawer.submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden />
            {t('admin.settings.coupons.drawer.saving')}
          </>
        ) : (
          t('admin.settings.coupons.drawer.save')
        )}
      </button>
    ) : undefined

  return (
    <Drawer
      open={open}
      title={title}
      description={t('admin.settings.coupons.drawer.subtitle')}
      onClose={handleClose}
      width="formula"
      footer={footer}
    >
      {drawer.loading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ) : null}

      {!drawer.loading && drawer.loadError ? (
        <EmptyState
          bare
          title={t('admin.settings.coupons.drawer.loadErrorTitle')}
          description={drawer.loadError}
        />
      ) : null}

      {!drawer.loading && !drawer.loadError ? (
        <form
          id={formId}
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            void drawer.submit()
          }}
        >
          {drawer.submitError ? (
            <p
              className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
              role="alert"
            >
              {drawer.submitError}
            </p>
          ) : null}

          <div>
            <label className={labelClass} htmlFor={`${formId}-code`}>
              {t('admin.settings.coupons.drawer.code')}
            </label>
            <input
              id={`${formId}-code`}
              type="text"
              autoComplete="off"
              value={drawer.values.code}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('code', event.target.value.toUpperCase())
              }
              className={cn(fieldClass, 'mt-2')}
              maxLength={20}
            />
            <FieldError message={drawer.errors.code} />
          </div>

          <div>
            <p className={labelClass}>
              {t('admin.settings.coupons.drawer.discountType')}
            </p>
            <div className="mt-2 flex gap-2">
              {(['percentage', 'fixed'] as const).map((type) => {
                const active = drawer.values.discountType === type
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={drawer.submitting}
                    onClick={() => drawer.setField('discountType', type)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
                      focusRingClasses,
                      active
                        ? 'border-[#a394ff]/40 bg-[rgba(163,148,255,0.15)] text-[#a394ff]'
                        : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80',
                      drawer.submitting && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    {t(`admin.settings.coupons.drawer.types.${type}`)}
                  </button>
                )
              })}
            </div>
            <FieldError message={drawer.errors.discountType} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-value`}>
              {t('admin.settings.coupons.drawer.discountValue')}
            </label>
            <input
              id={`${formId}-value`}
              type="number"
              min={0}
              step="any"
              value={drawer.values.discountValue}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('discountValue', event.target.value)
              }
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={drawer.errors.discountValue} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-maxUsage`}>
              {t('admin.settings.coupons.drawer.maxUsage')}
            </label>
            <input
              id={`${formId}-maxUsage`}
              type="number"
              min={1}
              step={1}
              value={drawer.values.maxUsage}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('maxUsage', event.target.value)
              }
              placeholder={t('admin.settings.coupons.drawer.maxUsageOptional')}
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={drawer.errors.maxUsage} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-expires`}>
              {t('admin.settings.coupons.drawer.expiresAt')}
            </label>
            <input
              id={`${formId}-expires`}
              type="datetime-local"
              value={drawer.values.expiresAt}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('expiresAt', event.target.value)
              }
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={drawer.errors.expiresAt} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-minOrder`}>
              {t('admin.settings.coupons.drawer.minOrderAmount')}
            </label>
            <input
              id={`${formId}-minOrder`}
              type="number"
              min={0}
              step="any"
              value={drawer.values.minOrderAmount}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('minOrderAmount', event.target.value)
              }
              placeholder={t('admin.settings.coupons.drawer.minOrderOptional')}
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={drawer.errors.minOrderAmount} />
          </div>

          {mode === 'edit' ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  {t('admin.settings.coupons.drawer.active')}
                </p>
                <p className="text-[10px] text-white/40">
                  {t('admin.settings.coupons.drawer.activeHint')}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={drawer.values.isActive}
                disabled={drawer.submitting}
                onClick={() =>
                  drawer.setField('isActive', !drawer.values.isActive)
                }
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors',
                  focusRingClasses,
                  drawer.values.isActive ? 'bg-[#a394ff]' : 'bg-white/15',
                  drawer.submitting && 'cursor-not-allowed opacity-60',
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 start-1 size-4 rounded-full bg-white shadow transition-transform',
                    drawer.values.isActive &&
                      'translate-x-5 rtl:-translate-x-5',
                  )}
                  aria-hidden
                />
              </button>
            </div>
          ) : null}
        </form>
      ) : null}
    </Drawer>
  )
}
