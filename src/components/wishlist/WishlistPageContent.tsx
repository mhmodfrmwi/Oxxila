// src/components/wishlist/WishlistPageContent.tsx
import { ArrowLeft, Heart } from 'lucide-react'
import { useMemo } from 'react'
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
  const { items, loading, error } = useWishlist()

  const products = useMemo(() => mapWishlistItemsToRecommended(items), [items])

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

        <h1 className="wishlist-title">{t('wishlist.title')}</h1>

        {loading ? (
          <WishlistSkeleton />
        ) : error ? (
          <FormMessage message={error} />
        ) : products.length === 0 ? (
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

      <Footer />
    </>
  )
}
