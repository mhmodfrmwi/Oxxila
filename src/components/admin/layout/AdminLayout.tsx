// src/components/admin/layout/AdminLayout.tsx
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { ADMIN_NAV_ITEMS, ADMIN_SETTINGS_NAV } from '../config/adminNav'
import { AdminBrandLogo } from './AdminBrandLogo'
import { AdminNavIcon } from './AdminNavIcon'
import { AdminSidebar } from './AdminSidebar'

/**
 * Admin application chrome. Styles are scoped via `.admin-shell`
 * so storefront tokens remain untouched outside this tree.
 *
 * Desktop: sidebar is `fixed` + full viewport height so it never
 * collapses with page content. Main content offsets with inline-start padding.
 */
export function AdminLayout() {
  const { t } = useTranslation()
  const mobileItems = [
    ...ADMIN_NAV_ITEMS.map((item) => ({
      id: item.id,
      labelKey: item.labelKey,
      to: item.to,
      end: item.end,
      iconSrc: item.iconSrc,
      iconSize: item.iconSize,
    })),
    {
      id: ADMIN_SETTINGS_NAV.id,
      labelKey: ADMIN_SETTINGS_NAV.labelKey,
      to: ADMIN_SETTINGS_NAV.to,
      end: undefined as boolean | undefined,
      iconSrc: null as string | null,
      iconSize: null as 20 | 24 | null,
    },
  ]

  return (
    <div className="admin-shell flex min-h-dvh flex-col lg:block">
      <AdminSidebar className="fixed inset-y-0 start-0 z-30 hidden lg:flex" />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:ps-[var(--admin-sidebar-width)]">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-white/5 backdrop-blur-[12px] lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <AdminBrandLogo showSubtitle={false} />
            <span className="text-[0.65rem] font-medium tracking-[0.2em] text-white/40 uppercase">
              {t('admin.brand.subtitle')}
            </span>
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
                ) : null}
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-[var(--admin-content-padding)] sm:py-[var(--admin-content-padding)]">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-[var(--admin-content-gap)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
