// src/pages/AccountOrdersPage.tsx
import { useTranslation } from 'react-i18next'
import { AccountLayout } from '../components/account/AccountLayout'
import { AccountSectionPlaceholder } from '../components/account/AccountSectionPlaceholder'
import { SHOP_PATH } from '../config/routes'

export function AccountOrdersPage() {
  const { t } = useTranslation()

  return (
    <AccountLayout breadcrumbLabel={t('profile.nav.myOrders')}>
      <AccountSectionPlaceholder
        titleKey="profile.orders.title"
        descriptionKey="profile.orders.empty"
        actionLabelKey="actions.continueShopping"
        actionTo={SHOP_PATH}
      />
    </AccountLayout>
  )
}
