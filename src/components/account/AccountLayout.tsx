// src/components/account/AccountLayout.tsx
import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { HOME_PATH, LOGIN_PATH, MY_ACCOUNT_PATH } from '../../config/routes'
import { useAuth } from '../../context/AuthContext'
import { Footer } from '../landing/footer/Footer'
import { Layout } from '../layout/Layout'
import { PageBleed } from '../layout/PageBleed'
import { Breadcrumb } from '../ui/Breadcrumb'
import { AccountSidebar, type AccountNavItem } from './AccountSidebar'

interface AccountLayoutProps {
  children: ReactNode
  breadcrumbLabel?: string
  navItems?: AccountNavItem[]
}

export function AccountLayout({
  children,
  breadcrumbLabel,
  navItems,
}: AccountLayoutProps) {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_PATH} replace />
  }

  const name = user?.name ?? ''
  const email = user?.email ?? ''
  const avatar = user?.avatar

  return (
    <Layout>
      <PageBleed>
        <div className="container-content pb-8 sm:pb-10">
          <Breadcrumb
            className="mb-5 sm:mb-6"
            items={[
              { label: t('nav.home'), href: HOME_PATH },
              {
                label: t('profile.myAccount'),
                href: breadcrumbLabel ? MY_ACCOUNT_PATH : undefined,
              },
              ...(breadcrumbLabel ? [{ label: breadcrumbLabel }] : []),
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,16.5rem)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:gap-8">
            <AccountSidebar
              name={name}
              email={email}
              avatar={avatar}
              navItems={navItems}
              className="lg:sticky lg:top-6"
            />

            <section className="min-w-0 rounded-3xl border border-border-subtle bg-card p-5 shadow-sm sm:p-8 lg:p-10">
              {children}
            </section>
          </div>
        </div>
        <Footer />
      </PageBleed>
    </Layout>
  )
}
