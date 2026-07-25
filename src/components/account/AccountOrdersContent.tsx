// src/components/account/AccountOrdersContent.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { SHOP_PATH } from '../../config/routes'
import { useAccountOrders } from '../../hooks/useAccountOrders'
import type { ApiOrder } from '../../types/order'
import { formatOrderReferenceId } from '../../utils/orderFormat'
import { FormMessage } from '../auth/FormMessage'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { AccountOrderCard } from './AccountOrderCard'
import { CancelMyOrderDialog } from './CancelMyOrderDialog'

function AccountOrdersSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-48 animate-pulse rounded-2xl bg-surface-muted sm:h-44"
        />
      ))}
    </div>
  )
}

export function AccountOrdersContent() {
  const { t } = useTranslation()
  const {
    orders,
    loading,
    error,
    page,
    totalPages,
    canGoPrev,
    canGoNext,
    setPage,
    reload,
    cancellingId,
    cancelOrder,
    annotationsByOrderId,
  } = useAccountOrders()

  const [cancelTarget, setCancelTarget] = useState<ApiOrder | null>(null)

  return (
    <div>
      <header className="mb-8">
        <Heading variant="page">{t('profile.orders.title')}</Heading>
        <p className="mt-2 text-sm text-secondary-text sm:text-base">
          {t('profile.orders.subtitle')}
        </p>
      </header>

      {loading ? (
        <AccountOrdersSkeleton />
      ) : error ? (
        <div className="space-y-4" role="alert">
          <FormMessage message={error} />
          <Button type="button" variant="outline" onClick={() => reload()}>
            {t('profile.retry')}
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-[14rem] flex-col items-start justify-center">
          <h2 className="text-lg font-medium text-primary-text">
            {t('profile.orders.emptyTitle')}
          </h2>
          <p className="mt-2 max-w-lg text-sm text-secondary-text sm:text-base">
            {t('profile.orders.empty')}
          </p>
          <Link to={SHOP_PATH} className="mt-6">
            <Button variant="primary" pill>
              {t('actions.continueShopping')}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-4" aria-label={t('profile.orders.listAria')}>
            {orders.map((order) => (
              <li key={order._id}>
                <AccountOrderCard
                  order={order}
                  annotations={
                    annotationsByOrderId.get(order._id) ?? {
                      returnRequest: null,
                      isReturnEligible: false,
                    }
                  }
                  cancelling={cancellingId === order._id}
                  onCancel={setCancelTarget}
                />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav
              className="mt-6 flex flex-wrap items-center justify-between gap-3"
              aria-label={t('profile.orders.paginationAria')}
            >
              <p className="text-sm text-secondary-text">
                {t('profile.orders.pageOf', { page, total: totalPages })}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canGoPrev}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  {t('profile.orders.prev')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canGoNext}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  {t('profile.orders.next')}
                </Button>
              </div>
            </nav>
          )}
        </>
      )}

      <CancelMyOrderDialog
        open={cancelTarget !== null}
        orderLabel={
          cancelTarget ? formatOrderReferenceId(cancelTarget) : null
        }
        submitting={cancellingId !== null}
        onClose={() => {
          if (cancellingId) return
          setCancelTarget(null)
        }}
        onConfirm={async (reason) => {
          if (!cancelTarget) return
          await cancelOrder(cancelTarget._id, reason)
          setCancelTarget(null)
        }}
      />
    </div>
  )
}
