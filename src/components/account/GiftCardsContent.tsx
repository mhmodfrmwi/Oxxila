// src/components/account/GiftCardsContent.tsx
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Link } from 'react-router-dom'
import { RETURNS_HISTORY_PATH } from '../../config/routes'
import { useGiftCards } from '../../hooks/useGiftCards'
import type { ApiGiftCardTransaction } from '../../api/giftCards'
import { cn } from '../../lib/cn'
import { formatCartPrice } from '../../utils/formatProductPrice'
import { focusRingClasses } from '../ui/interactionStyles'

function formatDate(iso: string, locale: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(locale.startsWith('ar') ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function transactionLabel(tx: ApiGiftCardTransaction, t: TFunction) {
  if (tx.type === 'issued' && tx.source === 'cod_return') {
    return t('giftCards.tx.codReturnIssued')
  }
  if (tx.type === 'redeemed' && tx.orderNumber) {
    return t('giftCards.tx.orderRedeemed', { orderNumber: tx.orderNumber })
  }
  if (tx.type === 'issued') {
    return t('giftCards.tx.creditIssued')
  }
  return t('giftCards.tx.creditRedeemed')
}

export function GiftCardsContent() {
  const { t, i18n } = useTranslation()
  const { balance, transactions, loading, error, refresh } = useGiftCards()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-primary-text sm:text-3xl">
          {t('giftCards.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary-text sm:text-base">
          {t('giftCards.description')}
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-subtle/40 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary-text">
          {t('giftCards.balanceLabel')}
        </p>
        {loading ? (
          <div className="mt-3 flex items-center gap-2 text-secondary-text">
            <Loader2 size={18} className="animate-spin" aria-hidden />
            {t('giftCards.loading')}
          </div>
        ) : (
          <p className="mt-2 font-serif text-3xl font-medium text-primary-text sm:text-4xl">
            {formatCartPrice(balance)}
          </p>
        )}
        <p className="mt-3 text-sm text-secondary-text">{t('giftCards.balanceHint')}</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-support-error/20 bg-support-error/5 p-4">
          <p className="text-sm text-support-error" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className={cn(
              'mt-3 text-sm font-medium text-link underline-offset-2 hover:underline',
              focusRingClasses,
            )}
          >
            {t('giftCards.retry')}
          </button>
        </div>
      ) : null}

      <section aria-labelledby="gift-cards-history-heading">
        <h2 id="gift-cards-history-heading" className="font-serif text-xl text-primary-text">
          {t('giftCards.historyTitle')}
        </h2>

        {loading ? (
          <div className="mt-4 space-y-3" aria-hidden>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-2xl bg-surface-muted/70 dark:bg-surface-subtle/40"
              />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border-subtle px-5 py-8 text-center">
            <p className="font-medium text-primary-text">{t('giftCards.emptyTitle')}</p>
            <p className="mt-2 text-sm text-secondary-text">{t('giftCards.emptyDescription')}</p>
            <Link
              to={RETURNS_HISTORY_PATH}
              className={cn(
                'mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-button-primary px-6 text-sm font-medium text-on-emphasis hover:bg-button-primary-hover',
                focusRingClasses,
              )}
            >
              {t('giftCards.viewReturns')}
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border-subtle overflow-hidden rounded-2xl border border-border-subtle">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'issued'
              return (
                <li
                  key={tx.id}
                  className="flex flex-wrap items-start justify-between gap-3 bg-card px-4 py-4 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary-text">
                      {transactionLabel(tx, t)}
                    </p>
                    <p className="mt-1 text-xs text-secondary-text">
                      {formatDate(tx.createdAt, i18n.language)}
                    </p>
                  </div>
                  <div className="text-end">
                    <p
                      className={cn(
                        'text-sm font-semibold tabular-nums',
                        isCredit ? 'text-support-success' : 'text-primary-text',
                      )}
                    >
                      {isCredit ? '+' : '−'}
                      {formatCartPrice(tx.amount)}
                    </p>
                    <p className="mt-1 text-xs text-secondary-text">
                      {t('giftCards.balanceAfter', { balance: formatCartPrice(tx.balanceAfter) })}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
