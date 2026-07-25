// src/pages/AccountOrdersPage.tsx
import { useTranslation } from 'react-i18next'
import { AccountLayout } from '../components/account/AccountLayout'
import { AccountOrdersContent } from '../components/account/AccountOrdersContent'

export function AccountOrdersPage() {
  const { t } = useTranslation()

  return (
    <AccountLayout breadcrumbLabel={t('profile.nav.myOrders')}>
      <AccountOrdersContent />
    </AccountLayout>
  )
}
