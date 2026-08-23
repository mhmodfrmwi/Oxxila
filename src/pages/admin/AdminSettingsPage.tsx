// src/pages/admin/AdminSettingsPage.tsx
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { AdminRolesCard } from '../../components/admin/settings/AdminRolesCard'
import { AdminRolesManagerCard } from '../../components/admin/settings/AdminRolesManagerCard'
import { BannersManagerCard } from '../../components/admin/settings/BannersManagerCard'
import { CartRecoveryCard } from '../../components/admin/settings/CartRecoveryCard'
import { CouponManagerCard } from '../../components/admin/settings/CouponManagerCard'
import { OffersManagerCard } from '../../components/admin/settings/OffersManagerCard'
import { PaymentGatewaysCard } from '../../components/admin/settings/PaymentGatewaysCard'
import { useAdminPermissions } from '../../hooks/useAdminPermissions'

/**
 * System Configuration (Phase 7).
 * Figma: Settings `937:21865` — visible cards only (Store Identity / Shipping & Logistics hidden).
 */
export function AdminSettingsPage() {
  const { t } = useTranslation()
  const { canReadTab } = useAdminPermissions()
  const canManageRoles = canReadTab('roles')

  return (
    <>
      <AdminPageHeader
        title={t('admin.settings.title')}
        subtitle={t('admin.settings.subtitle')}
      />

      {/* Figma: flex gap-32 justify-center w-full; left Fixed 1056; right Fixed 512 */}
      <div className="flex w-full flex-col gap-[var(--admin-content-gap-tight)] xl:flex-row xl:items-start xl:justify-center">
        <div className="flex w-full min-w-0 flex-col gap-[var(--admin-content-gap-tight)] xl:w-[min(var(--admin-settings-main-width),calc(100%-var(--admin-rail-width)-1.6rem))] xl:shrink-0">
          <PaymentGatewaysCard />
          <CouponManagerCard />
          <OffersManagerCard />
          <BannersManagerCard />
        </div>

        <div className="flex w-full shrink-0 flex-col gap-[var(--admin-content-gap-tight)] xl:w-[var(--admin-rail-width)]">
          <CartRecoveryCard />
          {canManageRoles ? <AdminRolesManagerCard /> : null}
          {canManageRoles ? <AdminRolesCard /> : null}
        </div>
      </div>
    </>
  )
}
