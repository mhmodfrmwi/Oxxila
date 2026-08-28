// src/components/admin/layout/AdminLoadingScreen.tsx
import { Loader2 } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { cn } from '../../../lib/cn'
import {
  adminPageShellStyle,
  resolveAdminPageShell,
} from '../config/adminPageShell'
import { Skeleton } from '../ui/Skeleton'
import { AdminBrandLogo } from './AdminBrandLogo'

interface AdminLoadingScreenProps {
  className?: string
  messageKey?: string
}

export function AdminLoadingScreen({
  className,
  messageKey = 'admin.loading',
}: AdminLoadingScreenProps) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const shell = resolveAdminPageShell(pathname)

  return (
    <div
      className={cn('admin-shell flex min-h-dvh flex-col lg:block', className)}
      style={adminPageShellStyle(shell) as CSSProperties}
      aria-busy="true"
      aria-live="polite"
      aria-label={t(messageKey)}
    >
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-30 hidden w-[var(--admin-sidebar-width)] flex-col',
          'border-e border-white/10 bg-white/5 backdrop-blur-[9.6px] lg:flex',
        )}
        aria-hidden
      >
        <div className="shrink-0 p-8">
          <AdminBrandLogo />
        </div>
        <nav className="flex flex-1 flex-col gap-2 p-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-xl" />
          ))}
        </nav>
        <div className="shrink-0 border-t border-white/10 px-6 pt-5 pb-6">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:ps-[var(--admin-main-offset)]">
        <header className="border-b border-white/10 bg-white/5 px-4 py-4 backdrop-blur-[9.6px] lg:hidden">
          <AdminBrandLogo showSubtitle={false} />
        </header>

        <main className="flex flex-1 flex-col gap-[var(--admin-content-gap)] p-[var(--admin-content-padding)]">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>

          <div className="flex w-full flex-col gap-6 sm:flex-row sm:flex-wrap xl:flex-nowrap">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="admin-glass flex min-h-[var(--admin-kpi-min-height)] min-w-0 flex-1 flex-col gap-3 rounded-[var(--admin-radius-lg)] p-[var(--admin-card-pad-md)] sm:basis-[calc(50%-0.6rem)] xl:basis-0"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-center">
            <Skeleton className="admin-glass min-h-[18rem] flex-1 rounded-[var(--admin-radius-lg)]" />
            <Skeleton className="admin-glass min-h-[18rem] w-full rounded-[var(--admin-radius-lg)] lg:max-w-[25.6rem]" />
          </div>

          <div className="flex items-center justify-center gap-2.5 py-2 text-sm text-secondary-text">
            <Loader2 size={18} className="animate-spin text-accent" aria-hidden />
            <span>{t(messageKey)}</span>
          </div>
        </main>
      </div>
    </div>
  )
}
