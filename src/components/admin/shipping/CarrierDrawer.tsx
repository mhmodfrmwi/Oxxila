// src/components/admin/shipping/CarrierDrawer.tsx
import { Loader2 } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useCarrierCoverage } from '../../../hooks/useCarrierCoverage'
import {
  useCarrierForm,
  type CarrierDrawerMode,
} from '../../../hooks/useCarrierForm'
import { cn } from '../../../lib/cn'
import type { AdminCarrierRow, AdminCarrierType } from '../../../types/adminShipping'
import { focusRingClasses } from '../../ui/interactionStyles'
import { BostaPickupsPanel } from './BostaPickupsPanel'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'

interface CarrierDrawerProps {
  open: boolean
  mode: CarrierDrawerMode
  carrier: AdminCarrierRow | null
  onClose: () => void
  onSaved: (carrier: AdminCarrierRow) => void
}

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px]',
  'text-sm text-white placeholder:text-white/40',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

const CARRIER_TYPES: AdminCarrierType[] = ['known', 'internal', 'api']

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-support-error">{message}</p>
}

export function CarrierDrawer({
  open,
  mode,
  carrier,
  onClose,
  onSaved,
}: CarrierDrawerProps) {
  const { t } = useTranslation()
  const formId = useId()

  const form = useCarrierForm({
    open,
    mode,
    carrier,
    onSaved: (row) => {
      onSaved(row)
      if (mode === 'create') onClose()
    },
  })

  const coverageEnabled = open && mode === 'edit' && Boolean(carrier)
  const coverage = useCarrierCoverage({
    carrierId: carrier?.id ?? null,
    enabled: coverageEnabled,
  })

  const groupedCoverage = coverage.options.reduce<
    Record<string, { countryName: string; items: typeof coverage.options }>
  >((groups, option) => {
    const group = groups[option.countryId] ?? {
      countryName: option.countryName,
      items: [],
    }
    group.items.push(option)
    groups[option.countryId] = group
    return groups
  }, {})

  const showBostaPickups = mode === 'edit' && carrier?.type === 'api'

  const title =
    mode === 'create'
      ? t('admin.shipping.carriers.drawer.createTitle')
      : t('admin.shipping.carriers.drawer.editTitle')

  const footer = (
    <button
      type="submit"
      form={formId}
      disabled={form.submitting}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-2xl',
        'bg-gradient-to-r from-[#a394ff] to-[#8274d6] px-4 py-3.5',
        'text-sm font-bold text-white',
        'disabled:cursor-not-allowed disabled:opacity-50',
        focusRingClasses,
      )}
    >
      {form.submitting ? (
        <>
          <Loader2 size={13} className="animate-spin" aria-hidden />
          {t('admin.shipping.carriers.drawer.saving')}
        </>
      ) : (
        t('admin.shipping.carriers.drawer.save')
      )}
    </button>
  )

  return (
    <Drawer
      open={open}
      title={title}
      description={t('admin.shipping.carriers.drawer.subtitle')}
      onClose={() => {
        if (!form.submitting) onClose()
      }}
      width="settings"
      footer={footer}
    >
      <form
        id={formId}
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          void form.submit()
        }}
      >
        {form.submitError ? (
          <p
            className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
            role="alert"
          >
            {form.submitError}
          </p>
        ) : null}

        <div>
          <label className={labelClass} htmlFor={`${formId}-name`}>
            {t('admin.shipping.carriers.drawer.name')}
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            value={form.values.name}
            disabled={form.submitting}
            onChange={(event) => form.setField('name', event.target.value)}
            className={cn(fieldClass, 'mt-2')}
          />
          <FieldError message={form.errors.name} />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${formId}-code`}>
            {t('admin.shipping.carriers.drawer.code')}
          </label>
          <input
            id={`${formId}-code`}
            type="text"
            value={form.values.code}
            disabled={form.submitting || mode === 'edit'}
            title={
              mode === 'edit'
                ? t('admin.shipping.carriers.drawer.immutableHint')
                : undefined
            }
            onChange={(event) =>
              form.setField('code', event.target.value.toUpperCase())
            }
            className={cn(fieldClass, 'mt-2')}
            maxLength={10}
          />
          <FieldError message={form.errors.code} />
        </div>

        <div>
          <p className={labelClass}>{t('admin.shipping.carriers.drawer.type')}</p>
          <div className="mt-2 flex gap-2">
            {CARRIER_TYPES.map((type) => {
              const active = form.values.type === type
              return (
                <button
                  key={type}
                  type="button"
                  disabled={form.submitting || mode === 'edit'}
                  title={
                    mode === 'edit'
                      ? t('admin.shipping.carriers.drawer.immutableHint')
                      : undefined
                  }
                  onClick={() => form.setType(type)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
                    focusRingClasses,
                    active
                      ? 'border-[#a394ff]/40 bg-[rgba(163,148,255,0.15)] text-[#a394ff]'
                      : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80',
                    (form.submitting || mode === 'edit') &&
                      'cursor-not-allowed opacity-70',
                  )}
                >
                  {t(`admin.shipping.method.types.${type}.label`)}
                </button>
              )
            })}
          </div>
        </div>

        {form.values.type === 'api' ? (
          <>
            <div>
              <label className={labelClass}>
                {t('admin.shipping.carriers.drawer.apiProvider')}
              </label>
              <input
                type="text"
                value="Bosta"
                disabled
                className={cn(fieldClass, 'mt-2 opacity-70')}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${formId}-apiKey`}>
                {t('admin.shipping.carriers.drawer.apiKey')}
              </label>
              <input
                id={`${formId}-apiKey`}
                type="password"
                autoComplete="off"
                value={form.values.apiKey}
                disabled={form.submitting}
                placeholder={
                  mode === 'edit'
                    ? t('admin.shipping.carriers.drawer.apiKeyEditPlaceholder')
                    : undefined
                }
                onChange={(event) => form.setField('apiKey', event.target.value)}
                className={cn(fieldClass, 'mt-2')}
              />
              <FieldError message={form.errors.apiKey} />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${formId}-apiBaseUrl`}>
                {t('admin.shipping.carriers.drawer.apiBaseUrl')}
              </label>
              <input
                id={`${formId}-apiBaseUrl`}
                type="text"
                value={form.values.apiBaseUrl}
                disabled={form.submitting}
                placeholder={t('admin.shipping.carriers.drawer.apiBaseUrlOptional')}
                onChange={(event) => form.setField('apiBaseUrl', event.target.value)}
                className={cn(fieldClass, 'mt-2')}
              />
            </div>
          </>
        ) : (
          <div>
            <label className={labelClass} htmlFor={`${formId}-deliveryDays`}>
              {t('admin.shipping.carriers.drawer.deliveryDays')}
            </label>
            <input
              id={`${formId}-deliveryDays`}
              type="text"
              value={form.values.deliveryDays}
              disabled={form.submitting}
              placeholder={t('admin.shipping.carriers.drawer.deliveryDaysPlaceholder')}
              onChange={(event) => form.setField('deliveryDays', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={form.errors.deliveryDays} />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-sm font-semibold text-white">
              {t('admin.shipping.carriers.drawer.active')}
            </p>
            <p className="text-[8px] text-white/40">
              {t('admin.shipping.carriers.drawer.activeHint')}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.values.isActive}
            aria-label={t('admin.shipping.carriers.drawer.active')}
            disabled={form.submitting}
            onClick={() => form.setField('isActive', !form.values.isActive)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors',
              focusRingClasses,
              form.values.isActive ? 'bg-[#a394ff]' : 'bg-white/15',
              form.submitting && 'cursor-not-allowed opacity-60',
            )}
          >
            <span
              className={cn(
                'absolute top-1 start-1 size-4 rounded-full bg-white shadow transition-transform',
                form.values.isActive && 'translate-x-5 rtl:-translate-x-5',
              )}
              aria-hidden
            />
          </button>
        </div>
      </form>

      {mode === 'edit' && carrier ? (
        <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6">
          <div>
            <h4 className="text-sm font-bold text-white">
              {t('admin.shipping.carriers.drawer.coverageTitle')}
            </h4>
            <p className="text-[8px] text-white/40">
              {t('admin.shipping.carriers.drawer.coverageHint')}
            </p>
          </div>

          {coverage.error ? (
            <p className="text-xs text-support-error" role="alert">
              {coverage.error}
            </p>
          ) : null}
          {coverage.saveError ? (
            <p className="text-xs text-support-error" role="alert">
              {coverage.saveError}
            </p>
          ) : null}

          {coverage.loading ? (
            <p className="text-xs text-white/40">
              {t('admin.shipping.carriers.drawer.coverageLoading')}
            </p>
          ) : null}

          {!coverage.loading && coverage.options.length === 0 ? (
            <EmptyState
              bare
              className="py-4"
              title={t('admin.shipping.carriers.drawer.coverageEmpty')}
            />
          ) : null}

          {!coverage.loading && coverage.options.length > 0 ? (
            <div className="flex max-h-56 flex-col gap-3 overflow-y-auto pe-1">
              {Object.entries(groupedCoverage).map(([countryId, group]) => (
                <div key={countryId}>
                  <p className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-white/30">
                    {group.countryName}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((option) => {
                      const active = coverage.selectedIds.has(option.id)
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => coverage.toggle(option.id)}
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                            focusRingClasses,
                            active
                              ? 'border-[#a394ff]/40 bg-[rgba(163,148,255,0.15)] text-[#a394ff]'
                              : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80',
                          )}
                        >
                          {option.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            disabled={!coverage.dirty || coverage.saving}
            onClick={() => void coverage.save()}
            className={cn(
              'inline-flex w-fit items-center gap-2 rounded-xl border border-[#a394ff]/20 bg-[rgba(163,148,255,0.1)] px-4 py-2',
              'text-xs font-bold uppercase text-[#a394ff]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              focusRingClasses,
            )}
          >
            {coverage.saving ? (
              <Loader2 size={12} className="animate-spin" aria-hidden />
            ) : null}
            {t('admin.shipping.carriers.drawer.coverageSave')}
          </button>
        </div>
      ) : null}

      {showBostaPickups && carrier ? (
        <div className="mt-6 border-t border-white/10 pt-6">
          <BostaPickupsPanel carrierId={carrier.id} />
        </div>
      ) : null}
    </Drawer>
  )
}
