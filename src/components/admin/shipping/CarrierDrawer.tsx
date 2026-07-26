// src/components/admin/shipping/CarrierDrawer.tsx
import { ChevronDown, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useId, useRef } from 'react'
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

/** Types offered in the drawer selector. API carriers remain supported when loaded from the backend. */
const SELECTABLE_CARRIER_TYPES: Exclude<AdminCarrierType, 'api'>[] = [
  'known',
  'internal',
]

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

  const isApiCarrier =
    (mode === 'edit' && carrier?.type === 'api') || false

  const coverage = useCarrierCoverage({
    carrierId: mode === 'edit' && carrier ? carrier.id : null,
    enabled: open && !isApiCarrier,
  })
  const coverageRef = useRef(coverage)
  useEffect(() => {
    coverageRef.current = coverage
  })

  const handleSaved = useCallback(
    (row: AdminCarrierRow) => {
      void (async () => {
        if (
          mode === 'create' &&
          row.type !== 'api' &&
          coverageRef.current.hasPendingSelection
        ) {
          await coverageRef.current.saveForCarrier(row.id)
        }
        onSaved(row)
        if (mode === 'create') onClose()
      })()
    },
    [mode, onClose, onSaved],
  )

  const form = useCarrierForm({
    open,
    mode,
    carrier,
    onSaved: handleSaved,
  })

  const showBostaPickups = mode === 'edit' && carrier?.type === 'api'
  const showCoverage = form.values.type !== 'api'
  const countrySelected = Boolean(coverage.selectedCountryId)
  const governoratesDisabled = !countrySelected || coverage.governoratesLoading

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
          {mode === 'edit' && form.values.type === 'api' ? (
            <div className="mt-2">
              <span
                className={cn(
                  'inline-flex rounded-full border border-[#a394ff]/40 bg-[rgba(163,148,255,0.15)]',
                  'px-4 py-1.5 text-xs font-medium text-[#a394ff]',
                  'cursor-not-allowed opacity-70',
                )}
                title={t('admin.shipping.carriers.drawer.immutableHint')}
              >
                {t('admin.shipping.method.types.api.label')}
              </span>
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              {SELECTABLE_CARRIER_TYPES.map((type) => {
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
          )}
        </div>

        {form.values.type === 'api' ? (
          <>
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

        {showCoverage ? (
          <>
            <div>
              <label className={labelClass} htmlFor={`${formId}-country`}>
                {t('admin.shipping.carriers.drawer.country')}
              </label>
              <div className="relative mt-2">
                <select
                  id={`${formId}-country`}
                  value={coverage.selectedCountryId}
                  disabled={
                    form.submitting ||
                    coverage.loading ||
                    coverage.countries.length === 0
                  }
                  onChange={(event) =>
                    coverage.setSelectedCountryId(event.target.value)
                  }
                  className={cn(fieldClass, 'appearance-none pe-10')}
                >
                  <option value="">
                    {t('admin.shipping.carriers.drawer.countryPlaceholder')}
                  </option>
                  {coverage.countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-white/40"
                  aria-hidden
                />
              </div>
            </div>

            <div
              className={cn(
                'flex flex-col gap-3',
                governoratesDisabled && 'opacity-60',
              )}
              aria-disabled={governoratesDisabled}
            >
              <p className="text-xs font-bold uppercase leading-4 text-[#9ca3af]">
                {t('admin.shipping.carriers.drawer.coveredGovernorates')}
              </p>

              {coverage.error ? (
                <p className="text-xs text-support-error" role="alert">
                  {coverage.error}
                </p>
              ) : null}

              {coverage.loading || coverage.governoratesLoading ? (
                <p className="text-xs text-white/40">
                  {t('admin.shipping.carriers.drawer.coverageLoading')}
                </p>
              ) : null}

              {!coverage.loading && coverage.countries.length === 0 ? (
                <EmptyState
                  bare
                  className="py-4"
                  title={t('admin.shipping.carriers.drawer.coverageEmpty')}
                />
              ) : null}

              {!coverage.loading &&
              coverage.countries.length > 0 &&
              !countrySelected ? (
                <p className="text-xs text-white/40">
                  {t('admin.shipping.carriers.drawer.selectCountryFirst')}
                </p>
              ) : null}

              {!coverage.loading &&
              !coverage.governoratesLoading &&
              countrySelected &&
              coverage.governorates.length === 0 ? (
                <EmptyState
                  bare
                  className="py-4"
                  title={t('admin.shipping.carriers.drawer.coverageEmpty')}
                />
              ) : null}

              {!coverage.loading &&
              !coverage.governoratesLoading &&
              coverage.governorates.length > 0 ? (
                <div className="flex max-h-64 flex-wrap gap-1.5 overflow-y-auto pe-1">
                  {coverage.governorates.map((option) => {
                    const active = coverage.selectedIds.has(option.id)
                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={form.submitting || governoratesDisabled}
                        onClick={() => coverage.toggle(option.id)}
                        className={cn(
                          'rounded-md border px-[13px] py-[7px] text-xs transition-colors',
                          focusRingClasses,
                          active
                            ? 'border-[rgba(130,115,255,0.5)] bg-[rgba(130,115,255,0.2)] text-[#8273ff]'
                            : 'border-[#2a2a3d] bg-[#1d1d2b] text-[#9ca3af] hover:text-white/80',
                          (form.submitting || governoratesDisabled) &&
                            'cursor-not-allowed',
                        )}
                      >
                        {option.name}
                      </button>
                    )
                  })}
                </div>
              ) : null}

              {mode === 'edit' && carrier ? (
                <>
                  {coverage.saveError ? (
                    <p className="text-xs text-support-error" role="alert">
                      {coverage.saveError}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    disabled={!coverage.dirty || coverage.saving || form.submitting}
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
                </>
              ) : null}
            </div>
          </>
        ) : null}

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

      {showBostaPickups && carrier ? (
        <div className="mt-6 border-t border-white/10 pt-6">
          <BostaPickupsPanel carrierId={carrier.id} />
        </div>
      ) : null}
    </Drawer>
  )
}
