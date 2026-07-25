// src/components/admin/settings/OfferDrawer.tsx
import { Loader2 } from 'lucide-react'
import { useCallback, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import {
  useOfferDrawer,
  type OfferDrawerMode,
} from '../../../hooks/useOfferDrawer'
import { cn } from '../../../lib/cn'
import type { AdminOfferRow } from '../../../types/adminOffers'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'

interface OfferDrawerProps {
  open: boolean
  mode: OfferDrawerMode
  offerId: string | null
  onClose: () => void
  onSaved: (offer: AdminOfferRow) => void
}

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px]',
  'text-sm text-white placeholder:text-white/40',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-support-error">{message}</p>
}

export function OfferDrawer({
  open,
  mode,
  offerId,
  onClose,
  onSaved,
}: OfferDrawerProps) {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const locale = i18n.language

  const drawer = useOfferDrawer({
    open,
    mode,
    offerId,
    locale,
    onSaved: (offer) => {
      toast.success(
        mode === 'create'
          ? t('admin.settings.offers.drawer.createSuccess')
          : t('admin.settings.offers.drawer.updateSuccess'),
      )
      onSaved(offer)
      onClose()
    },
  })

  const handleClose = useCallback(() => {
    if (drawer.submitting) return
    onClose()
  }, [drawer.submitting, onClose])

  const title =
    mode === 'create'
      ? t('admin.settings.offers.drawer.createTitle')
      : t('admin.settings.offers.drawer.editTitle')

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
            <Loader2 size={13} className="animate-spin" aria-hidden />
            {t('admin.settings.offers.drawer.saving')}
          </>
        ) : (
          t('admin.settings.offers.drawer.save')
        )}
      </button>
    ) : undefined

  return (
    <Drawer
      open={open}
      title={title}
      description={t('admin.settings.offers.drawer.subtitle')}
      onClose={handleClose}
      width="settings"
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
          title={t('admin.settings.offers.drawer.loadErrorTitle')}
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
            <label className={labelClass} htmlFor={`${formId}-product`}>
              {t('admin.settings.offers.drawer.product')}
            </label>
            <select
              id={`${formId}-product`}
              value={drawer.values.product}
              disabled={drawer.submitting}
              onChange={(event) => drawer.setField('product', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
            >
              <option value="">
                {t('admin.settings.offers.drawer.selectProduct')}
              </option>
              {drawer.products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            <FieldError message={drawer.errors.product} />
          </div>

          <div>
            <p className={labelClass}>
              {t('admin.settings.offers.drawer.discountType')}
            </p>
            <div className="mt-2 flex gap-2">
              {(['percent', 'amount'] as const).map((type) => {
                const active = drawer.values.discountMode === type
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={drawer.submitting}
                    onClick={() => drawer.setField('discountMode', type)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
                      focusRingClasses,
                      active
                        ? 'border-[#a394ff]/40 bg-[rgba(163,148,255,0.15)] text-[#a394ff]'
                        : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80',
                      drawer.submitting && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    {t(`admin.settings.offers.drawer.types.${type}`)}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-value`}>
              {t('admin.settings.offers.drawer.discountValue')}
            </label>
            <input
              id={`${formId}-value`}
              type="number"
              min={0}
              max={drawer.values.discountMode === 'percent' ? 100 : undefined}
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
            <label className={labelClass} htmlFor={`${formId}-count`}>
              {t('admin.settings.offers.drawer.productCount')}
            </label>
            <input
              id={`${formId}-count`}
              type="number"
              min={1}
              step={1}
              value={drawer.values.productCount}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('productCount', event.target.value)
              }
              placeholder={t('admin.settings.offers.drawer.productCountOptional')}
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={drawer.errors.productCount} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-start`}>
              {t('admin.settings.offers.drawer.startDate')}
            </label>
            <input
              id={`${formId}-start`}
              type="datetime-local"
              value={drawer.values.startDate}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('startDate', event.target.value)
              }
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={drawer.errors.startDate} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-end`}>
              {t('admin.settings.offers.drawer.endDate')}
            </label>
            <input
              id={`${formId}-end`}
              type="datetime-local"
              value={drawer.values.endDate}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('endDate', event.target.value)
              }
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={drawer.errors.endDate} />
          </div>

          {mode === 'edit' ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  {t('admin.settings.offers.drawer.active')}
                </p>
                <p className="text-[8px] text-white/40">
                  {t('admin.settings.offers.drawer.activeHint')}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={drawer.values.isActive}
                aria-label={t('admin.settings.offers.drawer.active')}
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
