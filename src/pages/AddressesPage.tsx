// src/pages/AddressesPage.tsx
import { useTranslation } from 'react-i18next'
import { AccountAddressesContent } from '../components/account/AccountAddressesContent'
import { AccountLayout } from '../components/account/AccountLayout'

export function AddressesPage() {
  const { t } = useTranslation()

  return (
    <AccountLayout breadcrumbLabel={t('profile.nav.myAddresses')}>
      <AccountAddressesContent />
    </AccountLayout>
  )
}
