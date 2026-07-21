// src/components/admin/shipping/ShippingMethodPanel.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { GlassCard } from '../ui/GlassCard'

interface ShippingMethodPanelProps {
  courierEnabled: boolean
  inHouseEnabled: boolean
}

/** Read-only method toggles — no global shipping-settings API yet. */
function MethodToggle({
  checked,
  label,
}: {
  checked: boolean
  label: string
}) {
  return (
    <span
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full',
        checked ? 'bg-[#a394ff]' : 'bg-white/15',
      )}
      role="switch"
      aria-checked={checked}
      aria-disabled="true"
      aria-label={label}
      title={label}
    >
      <span
        className={cn(
          'absolute top-1 start-1 size-4 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-5 rtl:-translate-x-5',
        )}
        aria-hidden
      />
    </span>
  )
}

export function ShippingMethodPanel({
  courierEnabled,
  inHouseEnabled,
}: ShippingMethodPanelProps) {
  const { t } = useTranslation()

  return (
    <GlassCard
      padding="lg"
      className="flex flex-col gap-6 rounded-[2rem]"
      aria-label={t('admin.shipping.method.panelAria')}
    >
      <h3 className="font-[family-name:var(--admin-font-display)] text-lg font-normal text-white">
        {t('admin.shipping.method.title')}
      </h3>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">
              {t('admin.shipping.method.courier')}
            </p>
            <p className="text-[10px] text-white/40">
              {t('admin.shipping.method.courierHint')}
            </p>
          </div>
          <MethodToggle
            checked={courierEnabled}
            label={t('admin.shipping.method.courierToggleSoon')}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">
              {t('admin.shipping.method.inHouse')}
            </p>
            <p className="text-[10px] text-white/40">
              {t('admin.shipping.method.inHouseHint')}
            </p>
          </div>
          <MethodToggle
            checked={inHouseEnabled}
            label={t('admin.shipping.method.inHouseToggleSoon')}
          />
        </div>
      </div>
    </GlassCard>
  )
}
