// src/components/admin/orders/OrdersStatusTabs.tsx
import { useTranslation } from 'react-i18next'
import type { AdminOrdersStatusTab } from '../../../types/adminOrders'
import { formatCount } from '../../../utils/adminOrdersFormat'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

const TABS: readonly AdminOrdersStatusTab[] = [
  'all',
  'pending',
  'processing',
  'shipped',
  'out_for_delivery',
  'failed_attempt',
  'delivered',
  'partially_returned',
  'returned',
  'cancelled',
] as const

interface OrdersStatusTabsProps {
  active: AdminOrdersStatusTab
  /** Count badge shown on the active tab (filtered total). */
  activeCount: number
  onChange: (tab: AdminOrdersStatusTab) => void
  disabled?: boolean
}

export function OrdersStatusTabs({
  active,
  activeCount,
  onChange,
  disabled = false,
}: OrdersStatusTabsProps) {
  const { t, i18n } = useTranslation()

  return (
    <div
      className="flex gap-4 overflow-x-auto border-b border-white/10"
      role="tablist"
      aria-label={t('admin.orders.statusFilterAria')}
    >
      {TABS.map((tab) => {
        const isActive = tab === active
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(tab)}
            className={cn(
              'relative shrink-0 px-2 pb-[14px] text-sm transition-colors',
              focusRingClasses,
              isActive
                ? 'border-b-2 border-accent pb-[13.2px] font-semibold text-accent'
                : 'font-medium text-white/40 hover:text-white/60',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <span className="inline-flex items-end gap-2">
              <span>{t(`admin.orders.tabs.${tab}`)}</span>
              {isActive ? (
                <span className="rounded-full bg-accent/20 px-1.5 py-px text-[8px] font-semibold leading-[11.2px] text-accent">
                  {formatCount(activeCount, i18n.language)}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}
