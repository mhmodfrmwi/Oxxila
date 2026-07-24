// src/components/admin/returns/ApproveReturnDialog.tsx
import { isAbortError } from '../../../lib/isAbortError'
import { Loader2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAdminCarrierPickups, getAdminCarriers } from '../../../api/admin/carriers'
import { ApiError } from '../../../lib/api'
import { cn } from '../../../lib/cn'
import type { ApproveReturnFormPayload } from '../../../types/adminReturns'
import type { ApiAdminCarrier, ApiCarrierPickup } from '../../../types/adminShipping'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Dialog } from '../ui/Dialog'

interface ApproveReturnDialogProps {
  open: boolean
  returnShortId?: string | null
  submitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: (payload: ApproveReturnFormPayload) => Promise<boolean>
}

const HANDLERS = ['internal', 'bosta'] as const

function isBostaApiCarrier(carrier: ApiAdminCarrier): boolean {
  return carrier.type === 'api' && carrier.apiProvider === 'bosta' && carrier.isActive !== false
}

const selectClass = cn(
  'mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px]',
  'text-sm text-white',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

export function ApproveReturnDialog({
  open,
  returnShortId,
  submitting,
  error,
  onClose,
  onSubmit,
}: ApproveReturnDialogProps) {
  const { t } = useTranslation()
  const formId = useId()

  const [logisticsHandler, setLogisticsHandler] =
    useState<(typeof HANDLERS)[number]>('internal')
  const [carriers, setCarriers] = useState<ApiAdminCarrier[]>([])
  const [carriersLoading, setCarriersLoading] = useState(false)
  const [carriersError, setCarriersError] = useState<string | null>(null)
  const [carrierId, setCarrierId] = useState('')
  const [pickups, setPickups] = useState<ApiCarrierPickup[]>([])
  const [pickupsLoading, setPickupsLoading] = useState(false)
  const [pickupsError, setPickupsError] = useState<string | null>(null)
  const [dropOffPickupId, setDropOffPickupId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLogisticsHandler('internal')
    setCarrierId('')
    setDropOffPickupId('')
    setPickups([])
    setFormError(null)
  }, [open])

  useEffect(() => {
    if (!open || logisticsHandler !== 'bosta') return
    const controller = new AbortController()
    setCarriersLoading(true)
    setCarriersError(null)
    void (async () => {
      try {
        const response = await getAdminCarriers({ signal: controller.signal })
        setCarriers((response.data ?? []).filter(isBostaApiCarrier))
      } catch (err) {
        if (isAbortError(err)) return
        setCarriersError(
          err instanceof ApiError ? err.message : t('admin.returns.actions.approve.carriersError'),
        )
      } finally {
        setCarriersLoading(false)
      }
    })()
    return () => controller.abort()
  }, [open, logisticsHandler, t])

  useEffect(() => {
    if (!carrierId) {
      setPickups([])
      return
    }
    const controller = new AbortController()
    setPickupsLoading(true)
    setPickupsError(null)
    void (async () => {
      try {
        const response = await getAdminCarrierPickups(carrierId, { signal: controller.signal })
        setPickups(response.data ?? [])
      } catch (err) {
        if (isAbortError(err)) return
        setPickupsError(
          err instanceof ApiError ? err.message : t('admin.returns.actions.approve.pickupsError'),
        )
      } finally {
        setPickupsLoading(false)
      }
    })()
    return () => controller.abort()
  }, [carrierId, t])

  const handleClose = () => {
    if (submitting) return
    onClose()
  }

  const handleSubmit = async () => {
    setFormError(null)

    if (logisticsHandler === 'bosta') {
      if (!carrierId) {
        setFormError(t('admin.returns.actions.approve.carrierRequired'))
        return
      }
      if (!dropOffPickupId) {
        setFormError(t('admin.returns.actions.approve.pickupRequired'))
        return
      }
    }

    const ok = await onSubmit(
      logisticsHandler === 'bosta'
        ? { logisticsHandler: 'bosta', carrierId, dropOffPickupId }
        : { logisticsHandler: 'internal' },
    )
    if (ok) onClose()
  }

  const displayError = formError || error

  return (
    <Dialog
      open={open}
      title={t('admin.returns.actions.approve.title')}
      description={
        returnShortId
          ? t('admin.returns.actions.approve.description', { id: returnShortId })
          : undefined
      }
      onClose={handleClose}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={submitting} onClick={handleClose}>
            {t('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="gradient"
            disabled={submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting ? <Loader2 size={13} className="animate-spin" aria-hidden /> : null}
            {t('admin.returns.actions.approve.confirm')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className={labelClass}>{t('admin.returns.actions.approve.handlerLabel')}</p>
          <div className="mt-2 flex flex-col gap-2">
            {HANDLERS.map((handler) => (
              <label
                key={handler}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                  focusRingClasses,
                  logisticsHandler === handler
                    ? 'border-[#a394ff]/50 bg-[rgba(163,148,255,0.12)]'
                    : 'border-white/10 bg-white/5 hover:bg-white/[0.07]',
                  submitting && 'cursor-not-allowed opacity-60',
                )}
              >
                <input
                  type="radio"
                  name={`${formId}-handler`}
                  value={handler}
                  checked={logisticsHandler === handler}
                  disabled={submitting}
                  onChange={() => {
                    setLogisticsHandler(handler)
                    setCarrierId('')
                    setDropOffPickupId('')
                    setFormError(null)
                  }}
                  className="accent-[#a394ff]"
                />
                <span className="text-sm font-medium text-white">
                  {t(`admin.returns.logisticsHandler.${handler}`)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {logisticsHandler === 'bosta' ? (
          <>
            <div>
              <label className={labelClass} htmlFor={`${formId}-carrier`}>
                {t('admin.returns.actions.approve.carrierLabel')}
              </label>
              {carriersLoading ? (
                <p className="mt-2 text-xs text-white/40">
                  {t('admin.returns.actions.approve.carriersLoading')}
                </p>
              ) : carriersError ? (
                <p className="mt-2 text-xs text-support-error">{carriersError}</p>
              ) : carriers.length === 0 ? (
                <p className="mt-2 text-xs text-white/40">
                  {t('admin.returns.actions.approve.noCarriers')}
                </p>
              ) : (
                <select
                  id={`${formId}-carrier`}
                  value={carrierId}
                  disabled={submitting}
                  onChange={(event) => {
                    setCarrierId(event.target.value)
                    setDropOffPickupId('')
                    setFormError(null)
                  }}
                  className={selectClass}
                >
                  <option value="">{t('admin.returns.actions.approve.carrierPlaceholder')}</option>
                  {carriers.map((carrier) => (
                    <option key={carrier._id} value={carrier._id}>
                      {carrier.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {carrierId ? (
              <div>
                <label className={labelClass} htmlFor={`${formId}-pickup`}>
                  {t('admin.returns.actions.approve.pickupLabel')}
                </label>
                {pickupsLoading ? (
                  <p className="mt-2 text-xs text-white/40">
                    {t('admin.returns.actions.approve.pickupsLoading')}
                  </p>
                ) : pickupsError ? (
                  <p className="mt-2 text-xs text-support-error">{pickupsError}</p>
                ) : pickups.length === 0 ? (
                  <p className="mt-2 text-xs text-white/40">
                    {t('admin.returns.actions.approve.noPickups')}
                  </p>
                ) : (
                  <select
                    id={`${formId}-pickup`}
                    value={dropOffPickupId}
                    disabled={submitting}
                    onChange={(event) => {
                      setDropOffPickupId(event.target.value)
                      setFormError(null)
                    }}
                    className={selectClass}
                  >
                    <option value="">{t('admin.returns.actions.approve.pickupPlaceholder')}</option>
                    {pickups.map((pickup) => (
                      <option key={pickup._id} value={pickup._id}>
                        {pickup.locationName}
                        {pickup.isDefault ? ' \u2605' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : null}
          </>
        ) : null}

        {displayError ? (
          <p className="text-sm text-support-error" role="alert">
            {displayError}
          </p>
        ) : null}
      </div>
    </Dialog>
  )
}
