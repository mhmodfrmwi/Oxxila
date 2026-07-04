// src/components/cart/CartEmptyState.tsx
import { ShoppingBag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { SHOP_PATH } from '../../config/routes'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'

export function CartEmptyState() {
  const { t } = useTranslation()

  return (
    <div className="cart-empty-state" role="status">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-secondary-text">
        <ShoppingBag size={28} strokeWidth={1.5} aria-hidden />
      </div>
      <Heading variant="card" as="h2">
        {t('cart.empty.title')}
      </Heading>
      <p className="max-w-sm text-sm text-secondary-text">{t('cart.empty.description')}</p>
      <Link to={SHOP_PATH}>
        <Button variant="primary">{t('actions.continueShopping')}</Button>
      </Link>
    </div>
  )
}
