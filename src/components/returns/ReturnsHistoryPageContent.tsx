// src/components/returns/ReturnsHistoryPageContent.tsx
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'
import { MY_ACCOUNT_PATH, RETURNS_PATH } from '../../config/routes'
import { useReturnsHistoryPage } from '../../hooks/useReturnsHistoryPage'
import { cn } from '../../lib/cn'
import { FormMessage } from '../auth/FormMessage'
import { Footer } from '../landing/footer/Footer'
import { focusRingClasses } from '../ui/interactionStyles'
import { ReturnHistoryCard } from './ReturnHistoryCard'
import { ReturnMosaicCard } from './ReturnMosaicCard'

function ReturnsHistorySkeleton() {
  return (
    <div aria-hidden>
      <div className="returns-history-skeleton-mosaics">
        <div className="returns-history-skeleton-mosaic animate-pulse" />
        <div className="returns-history-skeleton-mosaic animate-pulse" />
      </div>
      <div className="mb-6 h-8 w-52 animate-pulse rounded-lg bg-surface-muted" />
      <div className="space-y-6">
        <div className="returns-history-skeleton-card animate-pulse" />
        <div className="returns-history-skeleton-card animate-pulse" />
      </div>
    </div>
  )
}

export function ReturnsHistoryPageContent() {
  const { t } = useTranslation()
  const { isAuthenticated, loginPath, returns, loading, error } = useReturnsHistoryPage()

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />
  }

  const mosaics = returns.slice(0, 2)

  return (
    <>
      <div className="container-content returns-history-page">
        <Link
          to={MY_ACCOUNT_PATH}
          className={cn('returns-history-back', focusRingClasses, 'rounded-sm')}
        >
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden className="rtl:-scale-x-100" />
          {t('returnsHistory.back')}
        </Link>

        <h1 className="returns-history-title">{t('returnsHistory.title')}</h1>

        {loading ? (
          <ReturnsHistorySkeleton />
        ) : error ? (
          <FormMessage message={error} />
        ) : returns.length === 0 ? (
          <div className="returns-history-empty">
            <h2>{t('returnsHistory.emptyTitle')}</h2>
            <p>{t('returnsHistory.emptyMessage')}</p>
            <Link
              to={RETURNS_PATH}
              className={cn(
                'inline-flex min-h-11 items-center justify-center rounded-xl bg-button-primary px-6 text-sm font-medium text-on-emphasis transition-colors hover:bg-button-primary-hover',
                focusRingClasses,
              )}
            >
              {t('returnsHistory.startReturn')}
            </Link>
          </div>
        ) : (
          <>
            {mosaics.length > 0 && (
              <div className="returns-history-mosaics">
                {mosaics.map((entry) => (
                  <ReturnMosaicCard key={entry._id} items={entry.items} />
                ))}
              </div>
            )}

            <h2 className="returns-history-section-title">
              {t('returnsHistory.trackingStatus')}
            </h2>

            <div className="returns-history-list">
              {returns.map((entry) => (
                <ReturnHistoryCard key={entry._id} returnRequest={entry} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  )
}
