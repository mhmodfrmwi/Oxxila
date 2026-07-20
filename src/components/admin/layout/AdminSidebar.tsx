// src/components/admin/layout/AdminSidebar.tsx
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logoSettings from '../../../assets/admin/oxilla-logo-settings.svg'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import {
  ADMIN_NAV_ITEMS,
  ADMIN_SETTINGS_NAV,
  type AdminNavItem,
} from '../config/adminNav'
import { AdminBrandLogo } from './AdminBrandLogo'
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
            ? 'border border-[rgb(163_148_255_/_0.2)] bg-[rgb(163_148_255_/_0.1)] px-[17px] py-[13px] text-accent'
            : 'px-4 py-3 text-white/60 hover:bg-white/[0.04] hover:text-white/80',
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
 * Figma Component 50 — full-viewport admin sidebar.
 * Specs: 264px wide, glass bg, 32px brand pad, 16px nav pad / 8px gaps,
 * settings card pinned to bottom.
 */
export function AdminSidebar({ className }: AdminSidebarProps) {
  const { t } = useTranslation()

  return (
    <aside
      className={cn(
        'flex h-dvh w-[var(--admin-sidebar-width)] shrink-0 flex-col',
        'border-e border-white/10 bg-white/5 backdrop-blur-[12px]',
        className,
      )}
      aria-label={t('admin.nav.ariaLabel')}
    >
      <div className="shrink-0 p-8">
        <AdminBrandLogo />
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavItemLink key={item.id} item={item} />
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 px-6 pt-[25px] pb-6">
        <NavLink
          to={ADMIN_SETTINGS_NAV.to}
          className={({ isActive }) =>
            cn(
              'flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-[13px]',
              'transition-colors hover:bg-white/[0.08]',
              focusRingClasses,
              isActive && 'border-[rgb(163_148_255_/_0.35)] bg-[rgb(163_148_255_/_0.1)]',
            )
          }
        >
          <img
            src={logoSettings}
            alt=""
            width={34}
            height={35}
            className="h-[35px] w-[34.286px] shrink-0 object-contain"
            aria-hidden
          />
          <span className="min-w-0 flex-1 text-sm leading-5 font-semibold text-white">
            {t(ADMIN_SETTINGS_NAV.labelKey)}
          </span>
        </NavLink>
      </div>
    </aside>
  )
}
