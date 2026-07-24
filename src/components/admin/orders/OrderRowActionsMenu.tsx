// src/components/admin/orders/OrderRowActionsMenu.tsx
import { MoreHorizontal } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ADMIN_RETURNS_PATH } from '../../../config/routes'
import type { AdminOrderRow } from '../../../types/adminOrders'
import { canAdminCancelOrder } from '../../../utils/adminOrdersFormat'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

interface OrderRowActionsMenuProps {
  order: AdminOrderRow
  onOpenOrder: (orderId: string) => void
  onCancelOrder: (order: AdminOrderRow) => void
}

export function OrderRowActionsMenu({
  order,
  onOpenOrder,
  onCancelOrder,
}: OrderRowActionsMenuProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const canCancel = canAdminCancelOrder(order.orderStatus)
  // Milestone 3 — orders already tied to a return request deep-link into Returns Management.
  const hasReturnRequests =
    order.orderStatus === 'returned' || order.orderStatus === 'partially_returned'

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative inline-flex justify-center">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          'inline-flex rounded-lg p-2 text-white/70',
          'transition-colors hover:bg-white/10 hover:text-white',
          focusRingClasses,
        )}
        aria-label={t('admin.orders.actionAria', { id: order.orderNumber })}
      >
        <MoreHorizontal size={19} aria-hidden />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute end-0 top-full z-20 mt-1 min-w-[9.5rem] overflow-hidden rounded-xl border border-white/10 bg-[#1a1c29] py-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            className={cn(
              'block w-full px-3 py-2 text-start text-xs font-medium text-white/80',
              'hover:bg-white/10 hover:text-white',
              focusRingClasses,
            )}
            onClick={() => {
              setOpen(false)
              onOpenOrder(order.id)
            }}
          >
            {t('admin.orders.menu.viewDetails')}
          </button>
          {hasReturnRequests ? (
            <Link
              to={`${ADMIN_RETURNS_PATH}?orderId=${encodeURIComponent(order.id)}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                'block w-full px-3 py-2 text-start text-xs font-medium text-white/80',
                'hover:bg-white/10 hover:text-white',
                focusRingClasses,
              )}
            >
              {t('admin.orders.menu.viewReturns')}
            </Link>
          ) : null}
          {canCancel ? (
            <button
              type="button"
              role="menuitem"
              className={cn(
                'block w-full px-3 py-2 text-start text-xs font-medium text-support-error',
                'hover:bg-support-error/10',
                focusRingClasses,
              )}
              onClick={() => {
                setOpen(false)
                onCancelOrder(order)
              }}
            >
              {t('admin.orders.menu.cancel')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
