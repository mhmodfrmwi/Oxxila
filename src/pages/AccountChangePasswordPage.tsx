// src/pages/AccountChangePasswordPage.tsx
import { useTranslation } from 'react-i18next'
import { AccountChangePasswordContent } from '../components/account/AccountChangePasswordContent'
import { AccountLayout } from '../components/account/AccountLayout'

export function AccountChangePasswordPage() {
  const { t } = useTranslation()

  return (
    <AccountLayout breadcrumbLabel={t('profile.nav.changePassword')}>
      <AccountChangePasswordContent />
    </AccountLayout>
  )
}
