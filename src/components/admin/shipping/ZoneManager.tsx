// src/components/admin/shipping/ZoneManager.tsx
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useZoneManager } from '../../../hooks/useZoneManager'
import { cn } from '../../../lib/cn'
import type {
  AdminCountryRow,
  AdminDistrictRow,
  AdminGovernorateRow,
} from '../../../types/adminShipping'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Dialog } from '../ui/Dialog'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'

const fieldClass = cn(
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2',
  'text-xs text-white placeholder:text-white/40',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

type ConfirmTarget =
  | { kind: 'country'; id: string; name: string }
  | { kind: 'governorate'; id: string; name: string }
  | { kind: 'district'; id: string; name: string }

function ColumnShell({
  title,
  count,
  onAddClick,
  addLabel,
  children,
}: {
  title: string
  count?: number
  onAddClick: () => void
  addLabel: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-white">
          {title}
          {typeof count === 'number' ? (
            <span className="ms-1.5 text-xs font-normal text-white/40">({count})</span>
          ) : null}
        </h4>
        <button
          type="button"
          onClick={onAddClick}
          title={addLabel}
          aria-label={addLabel}
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-lg border border-[#a394ff]/20 bg-[rgba(163,148,255,0.1)] text-[#a394ff]',
            'hover:bg-[rgba(163,148,255,0.18)]',
            focusRingClasses,
          )}
        >
          <Plus size={12} aria-hidden />
        </button>
      </div>
      <div className="flex min-h-[16rem] flex-col gap-1.5 overflow-y-auto rounded-xl border border-white/5 bg-white/[0.02] p-2">
        {children}
      </div>
    </div>
  )
}

function AddCountryForm({
  onCancel,
  onSubmit,
  submitting,
}: {
  onCancel: () => void
  onSubmit: (values: { name: string; code: string; currency: string; flag: string }) => void
  submitting: boolean
}) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [currency, setCurrency] = useState('')
  const [flag, setFlag] = useState('')

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit({ name, code, currency, flag })
      }}
    >
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t('admin.shipping.zones.form.countryName')}
        className={fieldClass}
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder={t('admin.shipping.zones.form.countryCode')}
          className={fieldClass}
          maxLength={2}
          required
        />
        <input
          value={currency}
          onChange={(event) => setCurrency(event.target.value.toUpperCase())}
          placeholder={t('admin.shipping.zones.form.currency')}
          className={fieldClass}
          maxLength={3}
          required
        />
      </div>
      <input
        value={flag}
        onChange={(event) => setFlag(event.target.value)}
        placeholder={t('admin.shipping.zones.form.flagOptional')}
        className={fieldClass}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-[10px] font-semibold text-white/50 hover:text-white/80"
        >
          {t('admin.shipping.zones.form.cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-lg bg-[#a394ff] px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-60"
        >
          {submitting ? <Loader2 size={11} className="animate-spin" aria-hidden /> : null}
          {t('admin.shipping.zones.form.add')}
        </button>
      </div>
    </form>
  )
}

function AddGovernorateForm({
  onCancel,
  onSubmit,
  submitting,
}: {
  onCancel: () => void
  onSubmit: (values: { name: string; shippingPrice: string }) => void
  submitting: boolean
}) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [shippingPrice, setShippingPrice] = useState('')

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit({ name, shippingPrice })
      }}
    >
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t('admin.shipping.zones.form.governorateName')}
        className={fieldClass}
        required
      />
      <input
        type="number"
        min={0}
        step="any"
        value={shippingPrice}
        onChange={(event) => setShippingPrice(event.target.value)}
        placeholder={t('admin.shipping.zones.form.shippingPrice')}
        className={fieldClass}
        required
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-[10px] font-semibold text-white/50 hover:text-white/80"
        >
          {t('admin.shipping.zones.form.cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-lg bg-[#a394ff] px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-60"
        >
          {submitting ? <Loader2 size={11} className="animate-spin" aria-hidden /> : null}
          {t('admin.shipping.zones.form.add')}
        </button>
      </div>
    </form>
  )
}

function AddDistrictForm({
  onCancel,
  onSubmit,
  submitting,
}: {
  onCancel: () => void
  onSubmit: (values: { name: string; shippingPrice: string }) => void
  submitting: boolean
}) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [shippingPrice, setShippingPrice] = useState('')

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit({ name, shippingPrice })
      }}
    >
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t('admin.shipping.zones.form.districtName')}
        className={fieldClass}
        required
      />
      <input
        type="number"
        min={0}
        step="any"
        value={shippingPrice}
        onChange={(event) => setShippingPrice(event.target.value)}
        placeholder={t('admin.shipping.zones.form.shippingPrice')}
        className={fieldClass}
        required
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-[10px] font-semibold text-white/50 hover:text-white/80"
        >
          {t('admin.shipping.zones.form.cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-lg bg-[#a394ff] px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-60"
        >
          {submitting ? <Loader2 size={11} className="animate-spin" aria-hidden /> : null}
          {t('admin.shipping.zones.form.add')}
        </button>
      </div>
    </form>
  )
}

function RowShell({
  active,
  onClick,
  onDelete,
  deleting,
  children,
}: {
  active: boolean
  onClick?: () => void
  onDelete: () => void
  deleting: boolean
  children: ReactNode
}) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'group flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors',
        onClick && 'cursor-pointer',
        active
          ? 'bg-[rgba(163,148,255,0.12)] text-white'
          : 'text-white/70 hover:bg-white/5',
      )}
      onClick={onClick}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        disabled={deleting}
        aria-label={t('admin.shipping.zones.deleteRow')}
        onClick={(event) => {
          event.stopPropagation()
          onDelete()
        }}
        className={cn(
          'inline-flex size-6 shrink-0 items-center justify-center rounded-md text-white/30',
          'opacity-0 transition-opacity group-hover:opacity-100 hover:bg-support-error/10 hover:text-support-error',
          'disabled:cursor-not-allowed disabled:opacity-50',
          focusRingClasses,
        )}
      >
        {deleting ? (
          <Loader2 size={11} className="animate-spin" aria-hidden />
        ) : (
          <Trash2 size={11} aria-hidden />
        )}
      </button>
    </div>
  )
}

export function ZoneManager() {
  const { t } = useTranslation()
  const zones = useZoneManager()

  const [addingCountry, setAddingCountry] = useState(false)
  const [addingGovernorate, setAddingGovernorate] = useState(false)
  const [addingDistrict, setAddingDistrict] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return
    setConfirmBusy(true)
    let ok: boolean
    if (confirmTarget.kind === 'country') ok = await zones.removeCountry(confirmTarget.id)
    else if (confirmTarget.kind === 'governorate')
      ok = await zones.removeGovernorate(confirmTarget.id)
    else ok = await zones.removeDistrict(confirmTarget.id)
    setConfirmBusy(false)
    if (ok) setConfirmTarget(null)
  }

  return (
    <GlassCard
      padding="lg"
      strong
      className="flex w-full flex-col gap-6 rounded-[var(--admin-radius-2xl)]"
      aria-label={t('admin.shipping.zones.aria')}
    >
      <div>
        <h3 className="font-[family-name:var(--admin-font-display)] text-xl font-normal text-white">
          {t('admin.shipping.zones.title')}
        </h3>
        <p className="mt-1 text-xs text-white/40">{t('admin.shipping.zones.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <ColumnShell
          title={t('admin.shipping.zones.countries')}
          count={zones.countries.length}
          onAddClick={() => setAddingCountry((previous) => !previous)}
          addLabel={t('admin.shipping.zones.form.addCountryAria')}
        >
          {addingCountry ? (
            <AddCountryForm
              submitting={zones.countryMutating}
              onCancel={() => setAddingCountry(false)}
              onSubmit={async (values) => {
                const ok = await zones.addCountry({
                  name: values.name.trim(),
                  code: values.code.trim(),
                  currency: values.currency.trim(),
                  flag: values.flag.trim() || undefined,
                })
                if (ok) setAddingCountry(false)
              }}
            />
          ) : null}

          {zones.countriesError ? (
            <p className="px-1 text-[10px] text-support-error">{zones.countriesError}</p>
          ) : null}

          {zones.countriesLoading ? (
            <div className="flex flex-col gap-1.5 p-1">
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ) : null}

          {!zones.countriesLoading && zones.countries.length === 0 ? (
            <EmptyState
              bare
              className="py-6"
              title={t('admin.shipping.zones.countriesEmpty')}
            />
          ) : null}

          {zones.countries.map((country: AdminCountryRow) => (
            <RowShell
              key={country.id}
              active={zones.selectedCountryId === country.id}
              onClick={() => zones.selectCountry(country.id)}
              onDelete={() =>
                setConfirmTarget({ kind: 'country', id: country.id, name: country.name })
              }
              deleting={zones.countryMutating && zones.selectedCountryId === country.id}
            >
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{country.name}</span>
                <StatusBadge tone="neutral" className="shrink-0 text-[7px]">
                  {country.code}
                </StatusBadge>
              </div>
            </RowShell>
          ))}
        </ColumnShell>

        <ColumnShell
          title={t('admin.shipping.zones.governorates')}
          count={zones.selectedCountryId ? zones.governorates.length : undefined}
          onAddClick={() => setAddingGovernorate((previous) => !previous)}
          addLabel={t('admin.shipping.zones.form.addGovernorateAria')}
        >
          {!zones.selectedCountryId ? (
            <EmptyState
              bare
              className="py-6"
              title={t('admin.shipping.zones.selectCountryFirst')}
            />
          ) : (
            <>
              {addingGovernorate ? (
                <AddGovernorateForm
                  submitting={zones.governorateMutating}
                  onCancel={() => setAddingGovernorate(false)}
                  onSubmit={async (values) => {
                    if (!zones.selectedCountryId) return
                    const ok = await zones.addGovernorate({
                      country: zones.selectedCountryId,
                      name: values.name.trim(),
                      shippingPrice: Number(values.shippingPrice) || 0,
                    })
                    if (ok) setAddingGovernorate(false)
                  }}
                />
              ) : null}

              {zones.governoratesError ? (
                <p className="px-1 text-[10px] text-support-error">
                  {zones.governoratesError}
                </p>
              ) : null}

              {zones.governoratesLoading ? (
                <div className="flex flex-col gap-1.5 p-1">
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              ) : null}

              {!zones.governoratesLoading && zones.governorates.length === 0 ? (
                <EmptyState
                  bare
                  className="py-6"
                  title={t('admin.shipping.zones.governoratesEmpty')}
                />
              ) : null}

              {zones.governorates.map((gov: AdminGovernorateRow) => (
                <RowShell
                  key={gov.id}
                  active={zones.selectedGovernorateId === gov.id}
                  onClick={() => zones.selectGovernorate(gov.id)}
                  onDelete={() =>
                    setConfirmTarget({ kind: 'governorate', id: gov.id, name: gov.name })
                  }
                  deleting={
                    zones.governorateMutating && zones.selectedGovernorateId === gov.id
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{gov.name}</span>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      defaultValue={gov.shippingPrice}
                      onClick={(event) => event.stopPropagation()}
                      onBlur={(event) => {
                        const next = Number(event.target.value)
                        if (!Number.isNaN(next) && next !== gov.shippingPrice) {
                          void zones.editGovernorate(gov.id, { shippingPrice: next })
                        }
                      }}
                      className="w-16 shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-end text-[10px] text-white"
                    />
                  </div>
                </RowShell>
              ))}
            </>
          )}
        </ColumnShell>

        <ColumnShell
          title={t('admin.shipping.zones.districts')}
          count={zones.selectedGovernorateId ? zones.districts.length : undefined}
          onAddClick={() => setAddingDistrict((previous) => !previous)}
          addLabel={t('admin.shipping.zones.form.addDistrictAria')}
        >
          {!zones.selectedGovernorateId ? (
            <EmptyState
              bare
              className="py-6"
              title={t('admin.shipping.zones.selectGovernorateFirst')}
            />
          ) : (
            <>
              {addingDistrict ? (
                <AddDistrictForm
                  submitting={zones.districtMutating}
                  onCancel={() => setAddingDistrict(false)}
                  onSubmit={async (values) => {
                    if (!zones.selectedGovernorateId) return
                    const ok = await zones.addDistrict({
                      governorate: zones.selectedGovernorateId,
                      name: values.name.trim(),
                      shippingPrice: Number(values.shippingPrice) || 0,
                    })
                    if (ok) setAddingDistrict(false)
                  }}
                />
              ) : null}

              {zones.districtsError ? (
                <p className="px-1 text-[10px] text-support-error">
                  {zones.districtsError}
                </p>
              ) : null}

              {zones.districtsLoading ? (
                <div className="flex flex-col gap-1.5 p-1">
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              ) : null}

              {!zones.districtsLoading && zones.districts.length === 0 ? (
                <EmptyState
                  bare
                  className="py-6"
                  title={t('admin.shipping.zones.districtsEmpty')}
                />
              ) : null}

              {zones.districts.map((district: AdminDistrictRow) => (
                <RowShell
                  key={district.id}
                  active={false}
                  onDelete={() =>
                    setConfirmTarget({
                      kind: 'district',
                      id: district.id,
                      name: district.name,
                    })
                  }
                  deleting={zones.districtMutating}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{district.name}</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        defaultValue={district.shippingPrice}
                        onClick={(event) => event.stopPropagation()}
                        onBlur={(event) => {
                          const next = Number(event.target.value)
                          if (!Number.isNaN(next) && next !== district.shippingPrice) {
                            void zones.editDistrict(district.id, { shippingPrice: next })
                          }
                        }}
                        className="w-16 shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-end text-[10px] text-white"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          void zones.editDistrict(district.id, {
                            isCovered: !district.isCovered,
                          })
                        }}
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.06em]',
                          district.isCovered
                            ? 'bg-support-success/10 text-support-success'
                            : 'bg-white/5 text-white/30',
                        )}
                      >
                        {district.isCovered
                          ? t('admin.shipping.zones.covered')
                          : t('admin.shipping.zones.closed')}
                      </button>
                      {district.bostaCovered ? (
                        <span className="rounded-full bg-[rgba(163,148,255,0.1)] px-2 py-0.5 text-[7px] font-bold uppercase text-[#a394ff]">
                          {t('admin.shipping.zones.bostaCovered')}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </RowShell>
              ))}
            </>
          )}
        </ColumnShell>
      </div>

      <Dialog
        open={Boolean(confirmTarget)}
        title={t('admin.shipping.zones.deleteTitle')}
        description={
          confirmTarget
            ? t('admin.shipping.zones.deleteDescription', { name: confirmTarget.name })
            : undefined
        }
        onClose={() => setConfirmTarget(null)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmTarget(null)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
            >
              {t('admin.shipping.zones.form.cancel')}
            </button>
            <button
              type="button"
              disabled={confirmBusy}
              onClick={() => void handleConfirmDelete()}
              className="inline-flex items-center gap-2 rounded-xl bg-support-error/90 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              {confirmBusy ? <Loader2 size={12} className="animate-spin" aria-hidden /> : null}
              {t('admin.shipping.zones.confirmDelete')}
            </button>
          </div>
        }
      >
        <p className="text-sm text-white/60">
          {t('admin.shipping.zones.deleteWarning')}
        </p>
      </Dialog>
    </GlassCard>
  )
}
