// src/components/admin/orders/OrderRowActionsMenu.tsx
import { Eye, RefreshCw, RotateCcw, XCircle } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ADMIN_RETURNS_PATH } from '../../../config/routes'
import type { AdminOrderRow } from '../../../types/adminOrders'
import { canAdminCancelOrder } from '../../../utils/adminOrdersFormat'
import {
  AdminMenuItem,
  AdminMenuLinkItem,
  AdminMenuTrigger,
  adminMenuPanelAnchorClass,
  useAdminMenuDismiss,
} from '../ui/adminMenu'

interface OrderRowActionsMenuProps {
  order: AdminOrderRow
  onOpenOrder: (orderId: string) => void
  onCancelOrder: (order: AdminOrderRow) => void
  onChangeStatus: (order: AdminOrderRow) => void
}

export function OrderRowActionsMenu({
  order,
  onOpenOrder,
  onCancelOrder,
  onChangeStatus,
}: OrderRowActionsMenuProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const canCancel = canAdminCancelOrder(order.orderStatus)
  const hasReturnRequests =
    order.orderStatus === 'returned' || order.orderStatus === 'partially_returned'

  useAdminMenuDismiss(open, setOpen, rootRef)

  return (
    <div ref={rootRef} className="relative inline-flex justify-center">
      <AdminMenuTrigger
        open={open}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((previous) => !previous)}
        aria-label={t('admin.orders.actionAria', { id: order.orderNumber })}
      />

      {open ? (
        <div id={menuId} role="menu" className={adminMenuPanelAnchorClass}>
          <AdminMenuItem
            role="menuitem"
            icon={<Eye size={16} aria-hidden />}
            onClick={() => {
              setOpen(false)
              onOpenOrder(order.id)
            }}
          >
            {t('admin.orders.menu.viewDetails')}
          </AdminMenuItem>
          <AdminMenuItem
            role="menuitem"
            icon={<RefreshCw size={16} aria-hidden />}
            onClick={() => {
              setOpen(false)
              onChangeStatus(order)
            }}
          >
            {t('admin.orders.menu.changeStatus')}
          </AdminMenuItem>
          {hasReturnRequests ? (
            <AdminMenuLinkItem
              role="menuitem"
              href={`${ADMIN_RETURNS_PATH}?orderId=${encodeURIComponent(order.id)}`}
              icon={<RotateCcw size={16} aria-hidden />}
              onClick={() => setOpen(false)}
            >
              {t('admin.orders.menu.viewReturns')}
            </AdminMenuLinkItem>
          ) : null}
          {canCancel ? (
            <AdminMenuItem
              role="menuitem"
              variant="danger"
              icon={<XCircle size={16} aria-hidden />}
              onClick={() => {
                setOpen(false)
                onCancelOrder(order)
              }}
            >
              {t('admin.orders.menu.cancel')}
            </AdminMenuItem>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
