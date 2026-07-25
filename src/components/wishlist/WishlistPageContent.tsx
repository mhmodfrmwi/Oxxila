// src/components/wishlist/WishlistPageContent.tsx
import { ArrowLeft, Heart } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'
import { LOGIN_PATH, MY_ACCOUNT_PATH, SHOP_PATH } from '../../config/routes'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { cn } from '../../lib/cn'
import { mapWishlistItemsToRecommended } from '../../utils/wishlistMappers'
import { FormMessage } from '../auth/FormMessage'
import { Footer } from '../landing/footer/Footer'
import { ProductCard } from '../shop/recommended/ProductCard'
import { Button } from '../ui/Button'
import { focusRingClasses } from '../ui/interactionStyles'
import { ClearWishlistDialog } from './ClearWishlistDialog'

function WishlistSkeleton() {
  return (
    <ul className="wishlist-grid" aria-hidden>
      {Array.from({ length: 10 }, (_, index) => (
        <li key={index} className="wishlist-skeleton-card">
          <div className="wishlist-skeleton-frame animate-pulse" />
          <div className="wishlist-skeleton-lines">
            <div className="wishlist-skeleton-line title animate-pulse" />
            <div className="wishlist-skeleton-line price animate-pulse" />
            <div className="wishlist-skeleton-line rating animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function WishlistEmptyState() {
  const { t } = useTranslation()

  return (
    <div className="wishlist-empty" role="status">
      <div className="wishlist-empty-icon">
        <Heart size={28} strokeWidth={1.5} aria-hidden />
      </div>
      <h2>{t('wishlist.emptyTitle')}</h2>
      <p>{t('wishlist.emptyMessage')}</p>
      <Link to={SHOP_PATH} className="wishlist-empty-cta">
        <Button variant="primary">{t('wishlist.shopCta')}</Button>
      </Link>
    </div>
  )
}

export function WishlistPageContent() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { items, itemCount, loading, error, clearingWishlist, clearWishlist } =
    useWishlist()
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)

  const products = useMemo(() => mapWishlistItemsToRecommended(items), [items])
  const hasItems = products.length > 0

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_PATH} replace />
  }

  return (
    <>
      <div className="container-content wishlist-page">
        <Link
          to={MY_ACCOUNT_PATH}
          className={cn('wishlist-back', focusRingClasses, 'rounded-sm')}
        >
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden className="rtl:-scale-x-100" />
          {t('wishlist.back')}
        </Link>

        <header className="wishlist-header">
          <div>
            <h1 className="wishlist-title">{t('wishlist.title')}</h1>
            {hasItems && !loading && !error ? (
              <p className="wishlist-count">
                {t('wishlist.itemCount', { count: itemCount })}
              </p>
            ) : null}
          </div>
          {hasItems && !loading && !error ? (
            <Button
              type="button"
              variant="ghost"
              disabled={clearingWishlist}
              onClick={() => {
                setClearError(null)
                setClearDialogOpen(true)
              }}
              className="text-support-error hover:bg-support-error/10 hover:text-support-error"
            >
              {t('wishlist.clear.action')}
            </Button>
          ) : null}
        </header>

        {loading ? (
          <WishlistSkeleton />
        ) : error ? (
          <FormMessage message={error} />
        ) : !hasItems ? (
          <WishlistEmptyState />
        ) : (
          <ul className="wishlist-grid">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} layout="grid" variant="wishlist" />
              </li>
            ))}
          </ul>
        )}
      </div>

      <ClearWishlistDialog
        open={clearDialogOpen && hasItems}
        itemCount={itemCount}
        submitting={clearingWishlist}
        error={clearError}
        onError={setClearError}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={async () => {
          await clearWishlist()
          setClearDialogOpen(false)
        }}
      />

      <Footer />
    </>
  )
}
