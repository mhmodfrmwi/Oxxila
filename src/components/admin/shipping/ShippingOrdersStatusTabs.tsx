// src/components/admin/shipping/ShippingOrdersStatusTabs.tsx
import { useTranslation } from 'react-i18next'
import type { AdminShippingOrdersTab } from '../../../types/adminShipping'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

const TABS: readonly AdminShippingOrdersTab[] = [
  'all',
  'pending',
  'shipped',
  'delivered',
] as const

interface ShippingOrdersStatusTabsProps {
  active: AdminShippingOrdersTab
  onChange: (tab: AdminShippingOrdersTab) => void
  disabled?: boolean
}

export function ShippingOrdersStatusTabs({
  active,
  onChange,
  disabled = false,
}: ShippingOrdersStatusTabsProps) {
  const { t } = useTranslation()

  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label={t('admin.shipping.statusFilterAria')}
    >
      {TABS.map((tab) => {
        const isActive = tab === active
        const isAll = tab === 'all'
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(tab)}
            className={cn(
              'rounded-lg px-4 py-1.5 transition-colors',
              focusRingClasses,
              isActive
                ? 'border border-white/10 bg-white/10 text-xs font-semibold text-white'
                : 'bg-white/5 text-[9px] font-bold uppercase tracking-wide text-white/30 hover:text-white/55',
              isAll && isActive && 'text-[10px]',
              !isAll && isActive && 'text-[9px] font-bold uppercase',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            {t(`admin.shipping.tabs.${tab}`)}
          </button>
        )
      })}
    </div>
  )
}
