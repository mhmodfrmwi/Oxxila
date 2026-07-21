// src/pages/admin/AdminSettingsPage.tsx
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { AdminRolesCard } from '../../components/admin/settings/AdminRolesCard'
import { CartRecoveryCard } from '../../components/admin/settings/CartRecoveryCard'
import { CouponManagerCard } from '../../components/admin/settings/CouponManagerCard'
import { OffersManagerCard } from '../../components/admin/settings/OffersManagerCard'
import { PaymentGatewaysCard } from '../../components/admin/settings/PaymentGatewaysCard'
import { ShippingLogisticsCard } from '../../components/admin/settings/ShippingLogisticsCard'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../../components/ui/interactionStyles'

/**
 * System Configuration (Phase 7).
 * Figma: Settings `937:21865` — visible cards only (Store Identity hidden).
 */
export function AdminSettingsPage() {
  const { t } = useTranslation()

  return (
    <>
      <AdminPageHeader
        title={t('admin.settings.title')}
        subtitle={t('admin.settings.subtitle')}
        actions={
          <button
            type="button"
            disabled
            title={t('admin.settings.applySoon')}
            className={cn(
              'rounded-full bg-gradient-to-r from-[#a394ff] to-[#8e7dff] px-6 py-2.5',
              'text-sm font-bold text-white',
              'cursor-not-allowed opacity-50',
              'shadow-[0_10px_15px_-3px_rgba(163,148,255,0.2),0_4px_6px_-4px_rgba(163,148,255,0.2)]',
              focusRingClasses,
            )}
          >
            {t('admin.settings.applyAll')}
          </button>
        }
      />

      <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-8 xl:max-w-[66rem]">
          <PaymentGatewaysCard />
          <CouponManagerCard />
          <OffersManagerCard />
          <ShippingLogisticsCard />
        </div>

        <div className="flex w-full shrink-0 flex-col gap-8 xl:w-[min(100%,32rem)]">
          <CartRecoveryCard />
          <AdminRolesCard />
        </div>
      </div>
    </>
  )
}
