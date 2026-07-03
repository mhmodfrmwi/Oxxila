// src/components/cart/CartEmptyState.tsx
import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SHOP_PATH } from '../../config/routes'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'

export function CartEmptyState() {
  return (
    <div className="cart-empty-state" role="status">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-secondary-text">
        <ShoppingBag size={28} strokeWidth={1.5} aria-hidden />
      </div>
      <Heading variant="card" as="h2">
        Your cart is empty
      </Heading>
      <p className="max-w-sm text-sm text-secondary-text">
        Browse our shop and add products to your bag. Your selections will appear here.
      </p>
      <Link to={SHOP_PATH}>
        <Button variant="primary">Continue shopping</Button>
      </Link>
    </div>
  )
}
