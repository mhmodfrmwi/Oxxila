// src/pages/AccountPage.tsx
import { AccountLayout } from '../components/account/AccountLayout'
import { ProfilePageContent } from '../components/account/ProfilePageContent'

export function AccountPage() {
  return (
    <AccountLayout>
      <ProfilePageContent />
    </AccountLayout>
  )
}
