// src/components/account/AccountSidebar.tsx
import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router-dom'
import { ACCOUNT_SIDEBAR_NAV } from '../../config/accountNav'
import { HOME_PATH } from '../../config/routes'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'
import { UserAvatar } from './UserAvatar'

export interface AccountNavItem {
  id: string
  labelKey: string
  to: string
  end?: boolean
}

const defaultNavItems: AccountNavItem[] = ACCOUNT_SIDEBAR_NAV.map((item) => ({
  id: item.id,
  labelKey: item.labelKey,
  to: item.to,
  ...('end' in item && item.end ? { end: true as const } : {}),
}))

interface AccountSidebarProps {
  name: string
  email: string
  avatar?: string
  avatarLoading?: boolean
  navItems?: AccountNavItem[]
  className?: string
}

export function AccountSidebar({
  name,
  email,
  avatar,
  avatarLoading = false,
  navItems = defaultNavItems,
  className,
}: AccountSidebarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const toast = useToast()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)

    try {
      await logout()
      toast.success(t('nav.logOut'))
      navigate(HOME_PATH, { replace: true })
    } catch {
      toast.error(t('nav.logOut'))
    } finally {
      setLoggingOut(false)
    }
  }

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'block rounded-xl px-4 py-3 text-sm font-medium transition-colors',
      focusRingClasses,
      isActive
        ? 'bg-button-primary text-on-emphasis'
        : 'text-primary-text hover:bg-accent/10 hover:text-accent',
    )

  return (
    <aside
      className={cn(
        'rounded-3xl border border-border-subtle bg-card p-5 shadow-sm sm:p-6',
        className,
      )}
      aria-label={t('profile.sidebarAria')}
    >
      <div className="mb-6 flex flex-col items-center text-center">
        <UserAvatar
          name={name}
          src={avatar}
          size="lg"
          alt={name}
          loading={avatarLoading}
        />
        <p className="mt-4 font-serif text-lg font-medium text-primary-text">{name}</p>
        {email && (
          <p className="mt-1 break-all text-sm text-secondary-text">{email}</p>
        )}
      </div>

      <nav aria-label={t('profile.navAria')}>
        <ul className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavLink to={item.to} end={item.end} className={itemClass}>
                {t(item.labelKey)}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-2 rounded-xl px-4 py-3 text-start text-sm font-medium',
                'text-support-error hover:bg-support-error/10',
                focusRingClasses,
                loggingOut && 'pointer-events-none opacity-60',
              )}
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              aria-busy={loggingOut}
            >
              <LogOut size={16} aria-hidden />
              {loggingOut ? t('nav.loggingOut') : t('profile.nav.logout')}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
