// src/pages/admin/AdminComingSoonPage.tsx
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import {
  ADMIN_CUSTOMERS_PATH,
  ADMIN_ORDERS_PATH,
  ADMIN_PRODUCTS_PATH,
  ADMIN_REVIEWS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_SHIPPING_PATH,
} from '../../config/routes'

const TITLE_KEYS: Record<string, string> = {
  [ADMIN_PRODUCTS_PATH]: 'admin.nav.products',
  [ADMIN_ORDERS_PATH]: 'admin.nav.orders',
  [ADMIN_CUSTOMERS_PATH]: 'admin.nav.customers',
  [ADMIN_REVIEWS_PATH]: 'admin.nav.reviews',
  [ADMIN_SHIPPING_PATH]: 'admin.nav.shipping',
  [ADMIN_SETTINGS_PATH]: 'admin.nav.settings',
}

/**
 * Route stub for Phase 0 — keeps sidebar links valid without feature UI.
 */
export function AdminComingSoonPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const titleKey = TITLE_KEYS[pathname] ?? 'admin.foundation.title'
  const title = t(titleKey)

  return (
    <>
      <AdminPageHeader title={title} subtitle={t('admin.comingSoon.subtitle')} />
      <EmptyState
        title={t('admin.comingSoon.title')}
        description={t('admin.comingSoon.description')}
      />
    </>
  )
}
