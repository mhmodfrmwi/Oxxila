// src/components/admin/layout/AdminPageHeader.tsx
import { type ReactNode } from 'react'
import { cn } from '../../../lib/cn'

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

/** Settings shell Header: Fixed 1600×64, title/subtitle gap 4, items-center. */
export function AdminPageHeader({
  title,
  subtitle,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        'flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 shrink flex-col gap-[var(--admin-title-subtitle-gap)]">
        <h1 className="admin-page-title">{title}</h1>
        {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {actions}
        </div>
      )}
    </header>
  )
}
