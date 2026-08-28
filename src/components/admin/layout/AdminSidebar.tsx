// src/components/admin/layout/AdminSidebar.tsx
import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logoMark from '../../../assets/oxxila-logo-mark.svg'
import { cn } from '../../../lib/cn'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import { filterAdminNavItems } from '../../../utils/adminPermissions'
import { focusRingClasses } from '../../ui/interactionStyles'
import {
  ADMIN_NAV_ITEMS,
  ADMIN_ACTIVITY_LOG_NAV,
  ADMIN_SETTINGS_NAV,
  type AdminNavItem,
} from '../config/adminNav'
import { ADMIN_SETTINGS_PATH } from '../../../config/routes'
import { AdminBrandLogo } from './AdminBrandLogo'
import { AdminLogoutButton } from './AdminLogoutButton'
import { AdminNavIcon } from './AdminNavIcon'

function NavItemLink({ item }: { item: AdminNavItem }) {
  const { t } = useTranslation()

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex w-full items-center gap-3 rounded-xl transition-colors',
          focusRingClasses,
          isActive
            ? 'border border-[rgb(163_148_255_/_0.2)] bg-[rgb(163_148_255_/_0.1)] px-[13.6px] py-[9px] text-accent'
            : 'px-4 py-2.5 text-white/60 hover:bg-white/[0.04] hover:text-white/80',
        )
      }
    >
      {({ isActive }) => (
        <>
          <AdminNavIcon src={item.iconSrc} size={item.iconSize} />
          <span
            className={cn(
              'text-base leading-6 whitespace-nowrap',
              isActive ? 'font-medium' : 'font-normal',
            )}
          >
            {t(item.labelKey)}
          </span>
        </>
      )}
    </NavLink>
  )
}

interface AdminSidebarProps {
  className?: string
}

/**
 * Figma Component 50 — Fixed-width sidebar (~264.29px via --admin-sidebar-width).
 * Main content offset is separate (--admin-main-offset: 256, Settings shell).
 */
export function AdminSidebar({ className }: AdminSidebarProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const { permissions, canReadTab, isSuperAdmin } = useAdminPermissions()

  const settingsActive = location.pathname.startsWith(ADMIN_SETTINGS_PATH)

  const visibleNavItems = useMemo(
    () => filterAdminNavItems(ADMIN_NAV_ITEMS, permissions),
    [permissions],
  )

  const sidebarItems = useMemo(
    () =>
      isSuperAdmin ? [...visibleNavItems, ADMIN_ACTIVITY_LOG_NAV] : visibleNavItems,
    [isSuperAdmin, visibleNavItems],
  )

  const showSettings = canReadTab('settings')

  return (
    <aside
      className={cn(
        'flex h-dvh w-[var(--admin-sidebar-width)] shrink-0 flex-col',
        'border-e border-white/10 bg-white/5 backdrop-blur-[9.6px]',
        className,
      )}
      aria-label={t('admin.nav.ariaLabel')}
    >
      <div className="shrink-0 p-8">
        <AdminBrandLogo />
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        {sidebarItems.map((item) => (
          <NavItemLink key={item.id} item={item} />
        ))}

        <div className="mt-auto pt-2">
          <AdminLogoutButton />
        </div>
      </nav>

      {showSettings ? (
        <div className="shrink-0 border-t border-white/10 px-6 pt-[20px] pb-6">
          <NavLink
            to={ADMIN_SETTINGS_NAV.to}
            className={() =>
              cn(
                'flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-[10.4px]',
                'transition-colors hover:bg-white/[0.08]',
                focusRingClasses,
                settingsActive &&
                  'border-[rgb(163_148_255_/_0.35)] bg-[rgb(163_148_255_/_0.1)]',
              )
            }
          >
            <img
              src={logoMark}
              alt=""
              width={27}
              height={28}
              className="h-[28px] w-[27.429px] shrink-0 object-contain"
              aria-hidden
            />
            <span className="min-w-0 flex-1 text-base leading-6 font-semibold text-white">
              {t(ADMIN_SETTINGS_NAV.labelKey)}
            </span>
          </NavLink>
        </div>
      ) : null}
    </aside>
  )
}
