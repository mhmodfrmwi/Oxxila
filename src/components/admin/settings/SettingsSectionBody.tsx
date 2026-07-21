// src/components/admin/settings/SettingsSectionBody.tsx
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'

interface SettingsSectionBodyProps {
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyTitle: string
  emptyDescription?: string
  onRetry?: () => void
  skeleton?: ReactNode
  children?: ReactNode
}

function DefaultSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  )
}

/** Shared loading / error / empty / content switch for Settings cards. */
export function SettingsSectionBody({
  loading = false,
  error = null,
  empty = false,
  emptyTitle,
  emptyDescription,
  onRetry,
  skeleton,
  children,
}: SettingsSectionBodyProps) {
  const { t } = useTranslation()

  if (loading) {
    return <>{skeleton ?? <DefaultSkeleton />}</>
  }

  if (error) {
    return (
      <EmptyState
        bare
        className="py-8"
        title={t('admin.settings.loadErrorTitle')}
        description={error}
        action={
          onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry}>
              {t('admin.settings.retry')}
            </Button>
          ) : undefined
        }
      />
    )
  }

  if (empty) {
    return (
      <EmptyState
        bare
        className="py-8"
        title={emptyTitle}
        description={emptyDescription}
        action={
          onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry}>
              {t('admin.settings.retry')}
            </Button>
          ) : undefined
        }
      />
    )
  }

  return <>{children}</>
}
