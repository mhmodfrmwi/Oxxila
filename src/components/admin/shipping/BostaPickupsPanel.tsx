// src/components/admin/shipping/BostaPickupsPanel.tsx
import { Loader2, Plus, RefreshCw, Star, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCarrierPickups } from '../../../hooks/useCarrierPickups'
import { cn } from '../../../lib/cn'
import type {
  AdminPickupFormErrors,
  AdminPickupFormValues,
  ApiBostaCity,
  CreateCarrierPickupPayload,
} from '../../../types/adminShipping'
import {
  emptyPickupFormValues,
  formValuesToPickupPayload,
  validatePickupForm,
} from '../../../utils/adminShippingFormat'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'

interface BostaPickupsPanelProps {
  carrierId: string
  onAdded?: () => void
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

function PickupAddForm({
  cities,
  citiesLoading,
  citiesError,
  loadDistrictsLookup,
  adding,
  addError,
  addPickup,
  onCancel,
  onAdded,
}: {
  cities: ApiBostaCity[]
  citiesLoading: boolean
  citiesError: string | null
  loadDistrictsLookup: () => void | Promise<void>
  adding: boolean
  addError: string | null
  addPickup: (payload: CreateCarrierPickupPayload) => Promise<boolean>
  onCancel: () => void
  onAdded: () => void
}) {
  const { t } = useTranslation()
  const formId = useId()
  const [values, setValues] = useState<AdminPickupFormValues>(emptyPickupFormValues())
  const [errors, setErrors] = useState<AdminPickupFormErrors>({})
  const [selectedCityKey, setSelectedCityKey] = useState('')

  useEffect(() => {
    void loadDistrictsLookup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setField = useCallback(
    <K extends keyof AdminPickupFormValues>(key: K, value: AdminPickupFormValues[K]) => {
      setValues((previous) => ({ ...previous, [key]: value }))
      setErrors((previous) => {
        const errorKey = key as keyof AdminPickupFormErrors
        if (!previous[errorKey]) return previous
        const next = { ...previous }
        delete next[errorKey]
        return next
      })
    },
    [],
  )

  const selectedCity = useMemo(
    () => cities.find((city) => String(city.id ?? city._id ?? '') === selectedCityKey),
    [cities, selectedCityKey],
  )

  const handleCityChange = useCallback(
    (key: string) => {
      setSelectedCityKey(key)
      const city = cities.find((c) => String(c.id ?? c._id ?? '') === key)
      setField('city', city?.name ?? '')
      setField('cityId', key)
      setField('districtId', '')
      setField('districtName', '')
      setField('zoneId', '')
    },
    [cities, setField],
  )

  const handleDistrictChange = useCallback(
    (districtKey: string) => {
      const district = selectedCity?.districts?.find(
        (d) => String(d.id ?? d._id ?? '') === districtKey,
      )
      setField('districtId', districtKey)
      setField('districtName', district?.name ?? '')
      setField('zoneId', district?.zoneId != null ? String(district.zoneId) : '')
    },
    [selectedCity, setField],
  )

  const handleSubmit = useCallback(async () => {
    const nextErrors = validatePickupForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    const ok = await addPickup(formValuesToPickupPayload(values))
    if (ok) onAdded()
  }, [addPickup, onAdded, values])

  return (
    <form
      id={formId}
      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
      onSubmit={(event) => {
        event.preventDefault()
        void handleSubmit()
      }}
    >
      {addError ? (
        <p
          className="rounded-lg border border-support-error/30 bg-support-error/10 px-3 py-2 text-xs text-support-error"
          role="alert"
        >
          {addError}
        </p>
      ) : null}
      {citiesError ? (
        <p className="text-xs text-support-error">{citiesError}</p>
      ) : null}

      <div>
        <label className={labelClass} htmlFor={`${formId}-location`}>
          {t('admin.shipping.pickups.form.locationName')}
        </label>
        <input
          id={`${formId}-location`}
          type="text"
          value={values.locationName}
          onChange={(event) => setField('locationName', event.target.value)}
          className={cn(fieldClass, 'mt-1')}
        />
        <FieldError message={errors.locationName} />
      </div>

      <div>
        <label className={labelClass} htmlFor={`${formId}-line`}>
          {t('admin.shipping.pickups.form.firstLine')}
        </label>
        <input
          id={`${formId}-line`}
          type="text"
          value={values.firstLine}
          onChange={(event) => setField('firstLine', event.target.value)}
          className={cn(fieldClass, 'mt-1')}
        />
        <FieldError message={errors.firstLine} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor={`${formId}-city`}>
            {t('admin.shipping.pickups.form.city')}
          </label>
          <select
            id={`${formId}-city`}
            value={selectedCityKey}
            disabled={citiesLoading}
            onChange={(event) => handleCityChange(event.target.value)}
            className={cn(fieldClass, 'mt-1')}
          >
            <option value="">
              {citiesLoading
                ? t('admin.shipping.pickups.form.loadingCities')
                : t('admin.shipping.pickups.form.selectCity')}
            </option>
            {cities.map((city) => {
              const key = String(city.id ?? city._id ?? '')
              return (
                <option key={key} value={key}>
                  {city.name ?? key}
                </option>
              )
            })}
          </select>
          <FieldError message={errors.city} />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${formId}-district`}>
            {t('admin.shipping.pickups.form.district')}
          </label>
          <select
            id={`${formId}-district`}
            value={values.districtId}
            disabled={!selectedCity}
            onChange={(event) => handleDistrictChange(event.target.value)}
            className={cn(fieldClass, 'mt-1')}
          >
            <option value="">{t('admin.shipping.pickups.form.selectDistrict')}</option>
            {(selectedCity?.districts ?? []).map((district) => {
              const key = String(district.id ?? district._id ?? '')
              return (
                <option key={key} value={key}>
                  {district.name ?? key}
                </option>
              )
            })}
          </select>
          <FieldError message={errors.districtId ?? errors.zoneId} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor={`${formId}-contactName`}>
            {t('admin.shipping.pickups.form.contactName')}
          </label>
          <input
            id={`${formId}-contactName`}
            type="text"
            value={values.contactName}
            onChange={(event) => setField('contactName', event.target.value)}
            className={cn(fieldClass, 'mt-1')}
          />
          <FieldError message={errors.contactName} />
        </div>
        <div>
          <label className={labelClass} htmlFor={`${formId}-contactPhone`}>
            {t('admin.shipping.pickups.form.contactPhone')}
          </label>
          <input
            id={`${formId}-contactPhone`}
            type="tel"
            value={values.contactPhone}
            onChange={(event) => setField('contactPhone', event.target.value)}
            className={cn(fieldClass, 'mt-1')}
          />
          <FieldError message={errors.contactPhone} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-white/60">
        <input
          type="checkbox"
          checked={values.isDefault}
          onChange={(event) => setField('isDefault', event.target.checked)}
          className="size-4 rounded border-white/20 bg-white/5 accent-[#a394ff]"
        />
        {t('admin.shipping.pickups.form.isDefault')}
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70',
            'hover:bg-white/10',
            focusRingClasses,
          )}
        >
          {t('admin.shipping.pickups.form.cancel')}
        </button>
        <button
          type="submit"
          disabled={adding}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a394ff] to-[#8274d6] px-4 py-2',
            'text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60',
            focusRingClasses,
          )}
        >
          {adding ? <Loader2 size={12} className="animate-spin" aria-hidden /> : null}
          {t('admin.shipping.pickups.form.save')}
        </button>
      </div>
    </form>
  )
}

export function BostaPickupsPanel({ carrierId, onAdded }: BostaPickupsPanelProps) {
  const { t } = useTranslation()
  const {
    items,
    loading,
    error,
    syncing,
    syncPickups,
    syncingZones,
    syncZones,
    syncingCoverage,
    syncCoverage,
    mutatingId,
    setDefault,
    removePickup,
    cities,
    citiesLoading,
    citiesError,
    loadDistrictsLookup,
    adding,
    addError,
    addPickup,
  } = useCarrierPickups({ carrierId, enabled: true })
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAdded = useCallback(() => {
    setShowAddForm(false)
    onAdded?.()
  }, [onAdded])

  const anySyncing = syncing || syncingZones || syncingCoverage

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h4 className="text-sm font-bold text-white">
          {t('admin.shipping.pickups.title')}
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={anySyncing}
            onClick={() => void syncPickups()}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5',
              'text-[8px] font-bold uppercase tracking-[0.08em] text-white/70',
              'hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60',
              focusRingClasses,
            )}
          >
            <RefreshCw size={11} className={cn(syncing && 'animate-spin')} aria-hidden />
            {t('admin.shipping.pickups.sync')}
          </button>
          <button
            type="button"
            disabled={anySyncing}
            onClick={() => void syncZones()}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5',
              'text-[8px] font-bold uppercase tracking-[0.08em] text-white/70',
              'hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60',
              focusRingClasses,
            )}
          >
            <RefreshCw
              size={11}
              className={cn(syncingZones && 'animate-spin')}
              aria-hidden
            />
            {t('admin.shipping.pickups.syncZones')}
          </button>
          <button
            type="button"
            disabled={anySyncing}
            onClick={() => void syncCoverage()}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5',
              'text-[8px] font-bold uppercase tracking-[0.08em] text-white/70',
              'hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60',
              focusRingClasses,
            )}
          >
            <RefreshCw
              size={11}
              className={cn(syncingCoverage && 'animate-spin')}
              aria-hidden
            />
            {t('admin.shipping.pickups.syncCoverage')}
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm((previous) => !previous)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border border-[#a394ff]/20 bg-[rgba(163,148,255,0.1)] px-3 py-1.5',
              'text-[8px] font-bold uppercase tracking-[0.08em] text-[#a394ff]',
              'hover:bg-[rgba(163,148,255,0.18)]',
              focusRingClasses,
            )}
          >
            <Plus size={11} aria-hidden />
            {t('admin.shipping.pickups.add')}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-support-error" role="alert">
          {error}
        </p>
      ) : null}

      {showAddForm ? (
        <PickupAddForm
          cities={cities}
          citiesLoading={citiesLoading}
          citiesError={citiesError}
          loadDistrictsLookup={loadDistrictsLookup}
          adding={adding}
          addError={addError}
          addPickup={addPickup}
          onCancel={() => setShowAddForm(false)}
          onAdded={handleAdded}
        />
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <EmptyState
          bare
          className="py-6"
          title={t('admin.shipping.pickups.emptyTitle')}
          description={t('admin.shipping.pickups.emptyDescription')}
        />
      ) : null}

      {!loading && items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.map((pickup) => (
            <li
              key={pickup.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-white">
                    {pickup.locationName}
                  </p>
                  {pickup.isDefault ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(163,148,255,0.15)] px-2 py-0.5 text-[7px] font-bold uppercase text-[#a394ff]">
                      <Star size={9} aria-hidden />
                      {t('admin.shipping.pickups.default')}
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-xs text-white/40">
                  {pickup.addressLine} · {pickup.cityLabel}
                </p>
                <p className="text-[8px] text-white/30">
                  {pickup.contactName} · {pickup.contactPhone}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!pickup.isDefault ? (
                  <button
                    type="button"
                    disabled={mutatingId === pickup.id}
                    onClick={() => void setDefault(pickup.id)}
                    title={t('admin.shipping.pickups.setDefault')}
                    className={cn(
                      'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                      'hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50',
                      focusRingClasses,
                    )}
                  >
                    {mutatingId === pickup.id ? (
                      <Loader2 size={13} className="animate-spin" aria-hidden />
                    ) : (
                      <Star size={13} aria-hidden />
                    )}
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={mutatingId === pickup.id}
                  onClick={() => void removePickup(pickup.id)}
                  title={t('admin.shipping.pickups.delete')}
                  className={cn(
                    'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                    'hover:bg-support-error/10 hover:text-support-error disabled:cursor-not-allowed disabled:opacity-50',
                    focusRingClasses,
                  )}
                >
                  <Trash2 size={13} aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
