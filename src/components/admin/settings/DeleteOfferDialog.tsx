// src/components/admin/settings/DeleteOfferDialog.tsx
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../../lib/api'
import type { AdminOfferRow } from '../../../types/adminOffers'
import { Button } from '../../ui/Button'
import { Dialog } from '../ui/Dialog'

interface DeleteOfferDialogProps {
  open: boolean
  offer: AdminOfferRow | null
  submitting: boolean
  onClose: () => void
  onConfirm: (offerId: string) => Promise<void>
}

function resolveDeleteErrorKey(error: unknown): string {
  const statusCode = error instanceof ApiError ? error.statusCode : undefined
  switch (statusCode) {
    case 400:
      return 'badRequest'
    case 401:
      return 'unauthorized'
    case 403:
      return 'forbidden'
    case 404:
      return 'notFound'
    case 409:
      return 'conflict'
    default:
      return statusCode && statusCode >= 500 ? 'server' : 'unknown'
  }
}

/** Match formatOfferDiscount XOR: percent wins unless legacy percent=0 + amount. */
function resolveOfferTypeKey(offer: AdminOfferRow): 'percent' | 'amount' {
  const hasAmount =
    offer.discountAmount != null && Number.isFinite(offer.discountAmount)
  const hasPercent =
    offer.discountPercent != null && Number.isFinite(offer.discountPercent)
  if (hasPercent && !(offer.discountPercent === 0 && hasAmount && offer.discountAmount! > 0)) {
    return 'percent'
  }
  return 'amount'
}

export function DeleteOfferDialog({
  open,
  offer,
  submitting,
  onClose,
  onConfirm,
}: DeleteOfferDialogProps) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) setError(null)
  }, [open])

  const handleClose = () => {
    if (submitting) return
    setError(null)
    onClose()
  }

  const handleConfirm = async () => {
    if (!offer || submitting) return
    setError(null)

    try {
      await onConfirm(offer.id)
      onClose()
    } catch (caught) {
      setError(
        t(`admin.settings.offers.delete.errors.${resolveDeleteErrorKey(caught)}`),
      )
    }
  }

  const rows = offer
    ? [
        {
          label: t('admin.settings.offers.delete.name'),
          value: offer.productName,
        },
        {
          label: t('admin.settings.offers.delete.type'),
          value: t(
            `admin.settings.offers.drawer.types.${resolveOfferTypeKey(offer)}`,
          ),
        },
        {
          label: t('admin.settings.offers.delete.discount'),
          value: offer.discountLabel,
        },
        {
          label: t('admin.settings.offers.delete.status'),
          value: offer.isActive
            ? t('admin.settings.offers.active')
            : t('admin.settings.offers.inactive'),
        },
        {
          label: t('admin.settings.offers.delete.startDate'),
          value: offer.startLabel,
        },
        {
          label: t('admin.settings.offers.delete.endDate'),
          value: offer.endLabel,
        },
      ]
    : []

  return (
    <Dialog
      open={open}
      title={t('admin.settings.offers.delete.title')}
      description={t('admin.settings.offers.delete.description')}
      onClose={handleClose}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={handleClose}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting || !offer}
            onClick={() => void handleConfirm()}
            className="border-support-error/40 text-support-error hover:bg-support-error/10"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : null}
            {submitting
              ? t('admin.settings.offers.delete.deleting')
              : t('admin.settings.offers.delete.confirm')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <dl className="grid gap-3 rounded-xl border border-border-subtle bg-surface-muted p-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-xs text-secondary-text">{row.label}</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-primary-text">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <p
          className="rounded-xl border border-support-error/25 bg-support-error/10 p-3 text-sm leading-5 text-support-error"
          role="note"
        >
          {t('admin.settings.offers.delete.warning')}
        </p>

        {error ? (
          <p className="text-sm text-support-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Dialog>
  )
}
