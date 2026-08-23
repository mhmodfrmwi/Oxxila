// src/pages/GiftCardsPage.tsx
import { useTranslation } from 'react-i18next'
import { AccountLayout } from '../components/account/AccountLayout'
import { GiftCardsContent } from '../components/account/GiftCardsContent'

export function GiftCardsPage() {
  const { t } = useTranslation()

  return (
    <AccountLayout breadcrumbLabel={t('nav.dropdown.giftCards')}>
      <GiftCardsContent />
    </AccountLayout>
  )
}
