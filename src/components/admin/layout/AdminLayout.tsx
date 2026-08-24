// src/components/admin/layout/AdminLayout.tsx
import type { CSSProperties } from 'react'
import { useMemo } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logoSettings from '../../../assets/admin/oxilla-logo-settings.svg'
import { cn } from '../../../lib/cn'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import { filterAdminNavItems } from '../../../utils/adminPermissions'
import { focusRingClasses } from '../../ui/interactionStyles'
import { AdminPermissionGate } from '../AdminPermissionGate'
import {
  adminPageShellStyle,
  resolveAdminPageShell,
} from '../config/adminPageShell'
import { ADMIN_NAV_ITEMS, ADMIN_SETTINGS_NAV } from '../config/adminNav'
import { AdminBrandLogo } from './AdminBrandLogo'
import { AdminLogoutButton } from './AdminLogoutButton'
import { AdminNavIcon } from './AdminNavIcon'
import { AdminSidebar } from './AdminSidebar'

/**
 * Admin chrome. Outer shell matches Settings Figma `937:21865` on every route.
 * Sidebar = Component 50 Fixed (~264px). Content start = `--admin-main-offset` (256).
 */
export function AdminLayout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { permissions, canReadTab } = useAdminPermissions()
  const shell = resolveAdminPageShell(pathname)

  const visibleNavItems = useMemo(
    () => filterAdminNavItems(ADMIN_NAV_ITEMS, permissions),
    [permissions],
  )

  const showSettings = canReadTab('settings')

  const mobileItems = useMemo(
    () => [
      ...visibleNavItems.map((item) => ({
        id: item.id,
        labelKey: item.labelKey,
        to: item.to,
        end: item.end,
        iconSrc: item.iconSrc,
        iconSize: item.iconSize,
      })),
      ...(showSettings
        ? [
            {
              id: ADMIN_SETTINGS_NAV.id,
              labelKey: ADMIN_SETTINGS_NAV.labelKey,
              to: ADMIN_SETTINGS_NAV.to,
              end: undefined as boolean | undefined,
              iconSrc: logoSettings as string | null,
              iconSize: null as 20 | 24 | null,
            },
          ]
        : []),
    ],
    [showSettings, visibleNavItems],
  )

  return (
    <div
      className="admin-shell flex min-h-dvh flex-col lg:block"
      data-admin-screen={shell.id}
      style={adminPageShellStyle(shell) as CSSProperties}
    >
      <AdminSidebar className="fixed inset-y-0 start-0 z-30 hidden lg:flex" />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:ps-[var(--admin-main-offset)]">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-white/5 backdrop-blur-[9.6px] lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <AdminBrandLogo showSubtitle={false} />
            <div className="flex items-center gap-2">
              <span className="text-[0.52rem] font-medium tracking-[0.2em] text-white/40 uppercase">
                {t('admin.brand.subtitle')}
              </span>
              <AdminLogoutButton compact />
            </div>
          </div>
          <nav
            className="flex gap-1 overflow-x-auto px-3 pb-3"
            aria-label={t('admin.nav.ariaLabel')}
          >
            {mobileItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium',
                    focusRingClasses,
                    isActive
                      ? 'border border-[rgb(163_148_255_/_0.2)] bg-[rgb(163_148_255_/_0.1)] text-accent'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/80',
                  )
                }
              >
                {item.iconSrc && item.iconSize ? (
                  <AdminNavIcon
                    src={item.iconSrc}
                    size={item.iconSize}
                    className="!size-3.5"
                  />
                ) : item.iconSrc ? (
                  <img
                    src={item.iconSrc}
                    alt=""
                    width={14}
                    height={14}
                    className="size-3.5 shrink-0 object-contain"
                    aria-hidden
                  />
                ) : null}
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col px-4 py-5 sm:p-[var(--admin-content-padding)]">
          <div className="flex w-full min-w-0 flex-1 flex-col gap-[var(--admin-content-gap)]">
            <AdminPermissionGate>
              <Outlet />
            </AdminPermissionGate>
          </div>
        </main>
      </div>
    </div>
  )
}
