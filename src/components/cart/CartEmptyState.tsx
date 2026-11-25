// src/components/cart/CartEmptyState.tsx
import { ShoppingBag, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { SHOP_PATH, collectionPath } from '../../config/routes'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { focusRingClasses } from '../ui/interactionStyles'

const QUICK_LINKS = [
  { slug: 'best-sellers', labelKey: 'catalogCollections.bestSellers' },
  { slug: 'offers', labelKey: 'catalogCollections.offers' },
  { slug: 'new-arrivals', labelKey: 'catalogCollections.newArrivals' },
] as const

/** Empty cart: friendly illustration, one clear CTA, and shortcuts into the catalog. */
export function CartEmptyState() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="cart-empty-state" role="status">
      <div className="cart-empty-art" aria-hidden>
        <span className="cart-empty-ring cart-empty-ring--outer" />
        <span className="cart-empty-ring cart-empty-ring--inner" />
        <span className="cart-empty-bag">
          <ShoppingBag size={34} strokeWidth={1.5} />
        </span>
        <Sparkles size={16} className="cart-empty-spark cart-empty-spark--a" />
        <Sparkles size={12} className="cart-empty-spark cart-empty-spark--b" />
      </div>

      <Heading variant="card" as="h2">
        {t('cart.empty.title')}
      </Heading>
      <p className="max-w-sm text-sm leading-6 text-secondary-text">{t('cart.empty.description')}</p>

      <Button type="button" variant="primary" pill className="mt-1 px-8" onClick={() => navigate(SHOP_PATH)}>
        {t('actions.continueShopping')}
      </Button>

      <ul className="mt-2 flex flex-wrap items-center justify-center gap-2" aria-label={t('cart.empty.quickLinks')}>
        {QUICK_LINKS.map(({ slug, labelKey }) => (
          <li key={slug}>
            <Link
              to={collectionPath(slug)}
              className={cn(
                'inline-flex min-h-9 items-center rounded-full border border-border-subtle bg-background px-4 text-sm',
                'text-primary-text transition-colors hover:border-button-primary hover:text-button-primary',
                focusRingClasses,
              )}
            >
              {t(labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
