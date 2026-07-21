// src/components/admin/settings/OffersManagerCard.tsx
import { Pencil } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminOffers } from '../../../hooks/useAdminOffers'
import type { OfferDrawerMode } from '../../../hooks/useOfferDrawer'
import { cn } from '../../../lib/cn'
import type { AdminOfferRow } from '../../../types/adminOffers'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { EmptyState } from '../ui/EmptyState'
import { OfferDrawer } from './OfferDrawer'

/**
 * Offers Manager — list + create/edit drawer (Phase 7D).
 * Figma Settings Offers card; second "Start Time" column rendered as End Time.
 */
export function OffersManagerCard() {
  const { t } = useTranslation()
  const {
    offers,
    pagination,
    loading,
    error,
    page,
    setPage,
    reload,
    upsertOffer,
  } = useAdminOffers()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<OfferDrawerMode>('create')
  const [editOfferId, setEditOfferId] = useState<string | null>(null)

  const openCreate = useCallback(() => {
    setDrawerMode('create')
    setEditOfferId(null)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((offerId: string) => {
    setDrawerMode('edit')
    setEditOfferId(offerId)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setEditOfferId(null)
  }, [])

  const handleSaved = useCallback(
    (offer: AdminOfferRow) => {
      upsertOffer(offer)
      reload()
    },
    [reload, upsertOffer],
  )

  const columns = useMemo<DataTableColumn<AdminOfferRow>[]>(
    () => [
      {
        id: 'product',
        header: t('admin.settings.offers.columns.product'),
        cell: (row) => (
          <span className="text-sm font-bold tracking-[0.05em] text-[#e2e2e2]">
            {row.productName}
          </span>
        ),
      },
      {
        id: 'discount',
        header: t('admin.settings.offers.columns.discount'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <span className="text-sm font-semibold text-[#a394ff]">
            {row.discountLabel}
          </span>
        ),
      },
      {
        id: 'amount',
        header: t('admin.settings.offers.columns.amount'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <span className="text-sm font-medium tabular-nums text-[#e2e2e2]">
            {row.amountLabel}
          </span>
        ),
      },
      {
        id: 'startTime',
        header: t('admin.settings.offers.columns.startTime'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <span className="text-sm font-medium whitespace-nowrap text-[#e2e2e2]">
            {row.startLabel}
          </span>
        ),
      },
      {
        id: 'endTime',
        header: t('admin.settings.offers.columns.endTime'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <span className="text-sm font-medium whitespace-nowrap text-[#e2e2e2]">
            {row.endLabel}
          </span>
        ),
      },
      {
        id: 'action',
        header: t('admin.settings.offers.columns.action'),
        headerClassName: 'text-end',
        className: 'text-end',
        cell: (row) => (
          <button
            type="button"
            onClick={() => openEdit(row.id)}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
              'transition-colors hover:bg-white/10 hover:text-white',
              focusRingClasses,
            )}
            aria-label={t('admin.settings.offers.editAria', {
              name: row.productName,
            })}
          >
            <Pencil size={16} aria-hidden />
          </button>
        ),
      },
    ],
    [openEdit, t],
  )

  const failed = Boolean(error) && !loading && offers.length === 0
  const staleError = Boolean(error) && offers.length > 0
  const currentPage = pagination?.currentPage ?? page
  const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages && totalPages > 1

  if (failed) {
    return (
      <EmptyState
        title={t('admin.settings.offers.loadErrorTitle')}
        description={error ?? t('admin.settings.loadErrorTitle')}
        className="rounded-[2.5rem]"
        action={
          <Button type="button" variant="outline" onClick={reload}>
            {t('admin.settings.retry')}
          </Button>
        }
      />
    )
  }

  return (
    <>
      {staleError ? (
        <p
          className="mb-3 rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={offers}
        getRowId={(row) => row.id}
        loading={loading}
        emptyTitle={t('admin.settings.offers.emptyTitle')}
        emptyDescription={t('admin.settings.offers.emptyDescription')}
        emptyAction={
          <Button type="button" variant="outline" onClick={reload}>
            {t('admin.settings.retry')}
          </Button>
        }
        aria-label={t('admin.settings.offers.aria')}
        className="rounded-[2.5rem]"
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-[family-name:var(--admin-font-display)] text-xl font-normal text-white">
              {t('admin.settings.offers.title')}
            </h3>
            <button
              type="button"
              onClick={openCreate}
              className={cn(
                'text-sm font-semibold text-[#a394ff]',
                'transition-opacity hover:opacity-80',
                focusRingClasses,
              )}
            >
              {t('admin.settings.offers.createOffer')}
            </button>
          </div>
        }
        footer={
          totalPages > 1 ? (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={!canGoPrev || loading}
                onClick={() => setPage(currentPage - 1)}
                className={cn(
                  'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/50',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                  focusRingClasses,
                )}
              >
                {t('admin.settings.offers.prev')}
              </button>
              <button
                type="button"
                disabled={!canGoNext || loading}
                onClick={() => setPage(currentPage + 1)}
                className={cn(
                  'rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                  focusRingClasses,
                )}
              >
                {t('admin.settings.offers.next')}
              </button>
            </div>
          ) : undefined
        }
      />

      <OfferDrawer
        open={drawerOpen}
        mode={drawerMode}
        offerId={editOfferId}
        onClose={closeDrawer}
        onSaved={handleSaved}
      />
    </>
  )
}
