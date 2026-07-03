// src/components/cart/CartPageContent.tsx
import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { HOME_PATH, LOGIN_PATH, PAYMENT_PATH } from '../../config/routes'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useBrowsingHistory } from '../../hooks/useBrowsingHistory'
import { useBuyAgainProducts } from '../../hooks/useBuyAgainProducts'
import { useCartAddresses } from '../../hooks/useCartAddresses'
import { ApiError } from '../../lib/api'
import { Breadcrumb } from '../ui/Breadcrumb'
import { Heading } from '../ui/Heading'
import { ContentSection } from '../layout/ContentSection'
import { Footer } from '../landing/footer/Footer'
import { SectionHeader } from '../landing/SectionHeader'
import { ProductCarousel } from '../shop/recommended/ProductCarousel'
import { CartEmptyState } from './CartEmptyState'
import { CartItemRow } from './CartItemRow'
import { CartPageSkeleton } from './CartPageSkeleton'
import { CartShippingBar } from './CartShippingBar'
import { OrderSummaryCard } from './OrderSummaryCard'

export function CartPageContent() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const {
    cart,
    itemCount,
    loading,
    updatingItemId,
    couponLoading,
    updateCartItem,
    removeCartItem,
    applyCoupon,
    removeCoupon,
  } = useCart()
  const { primaryAddress, loading: addressLoading } = useCartAddresses()
  const { products: browsingProducts, loading: browsingLoading } = useBrowsingHistory(6)
  const { products: buyAgainProducts, loading: buyAgainLoading } = useBuyAgainProducts()
  const [selectedOverrides, setSelectedOverrides] = useState<Record<string, boolean>>({})
  const [actionError, setActionError] = useState<string | null>(null)

  const items = useMemo(() => cart?.items ?? [], [cart?.items])
  const hasItems = items.length > 0

  const selectedIds = useMemo(() => {
    const next: Record<string, boolean> = {}
    for (const item of items) {
      next[item._id] = selectedOverrides[item._id] ?? true
    }
    return next
  }, [items, selectedOverrides])

  const itemCountLabel = useMemo(() => {
    if (itemCount === 1) return '1 item'
    return `${itemCount} items`
  }, [itemCount])

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_PATH} replace />
  }

  async function handleQuantityChange(itemId: string, quantity: number) {
    setActionError(null)
    try {
      await updateCartItem(itemId, quantity)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Could not update quantity')
    }
  }

  async function handleRemove(itemId: string) {
    setActionError(null)
    try {
      await removeCartItem(itemId)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Could not remove item')
    }
  }

  return (
    <>
      <div className="container-content pb-8 sm:pb-10">
        <Breadcrumb
          className="mb-5 sm:mb-6"
          items={[
            { label: 'Home', href: HOME_PATH },
            { label: 'Cart' },
          ]}
        />

        {loading && !cart ? (
          <CartPageSkeleton />
        ) : (
          <>
            <header className="mb-5 sm:mb-6">
              <Heading variant="page" className="mb-2">
                Shopping Cart
              </Heading>
              {hasItems && (
                <p className="text-sm text-secondary-text">{itemCountLabel}</p>
              )}
            </header>

            {hasItems && (
              <CartShippingBar
                address={primaryAddress}
                loading={addressLoading}
                className="mb-6 sm:mb-8"
              />
            )}

            {actionError && (
              <p className="mb-4 text-sm text-support-error" role="alert">
                {actionError}
              </p>
            )}

            {!hasItems ? (
              <CartEmptyState />
            ) : (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
                <section aria-label="Cart items" className="min-w-0">
                  <div className="rounded-2xl border border-border-subtle bg-card px-4 sm:px-5">
                    {items.map((item) => (
                      <CartItemRow
                        key={item._id}
                        item={item}
                        selected={selectedIds[item._id] ?? true}
                        onSelectedChange={(selected) =>
                          setSelectedOverrides((current) => ({ ...current, [item._id]: selected }))
                        }
                        onQuantityChange={(quantity) => void handleQuantityChange(item._id, quantity)}
                        onRemove={() => void handleRemove(item._id)}
                        disabled={updatingItemId === item._id}
                      />
                    ))}
                  </div>
                </section>

                {cart && (
                  <OrderSummaryCard
                    cart={cart}
                    couponLoading={couponLoading}
                    checkoutDisabled={Boolean(updatingItemId)}
                    onApplyCoupon={applyCoupon}
                    onRemoveCoupon={removeCoupon}
                    onCtaClick={() => navigate(PAYMENT_PATH)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ContentSection padding="compact" aria-labelledby="cart-browsing-heading">
        <SectionHeader id="cart-browsing-heading" title="Products recently viewed" size="compact" />
        {browsingLoading ? (
          <div className="h-[280px] animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
        ) : (
          <ProductCarousel products={browsingProducts} ariaLabel="Products recently viewed" />
        )}
      </ContentSection>

      <ContentSection padding="compact" aria-labelledby="cart-buy-again-heading">
        <SectionHeader id="cart-buy-again-heading" title="Buy again" size="compact" />
        {buyAgainLoading ? (
          <div className="h-[280px] animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
        ) : (
          <ProductCarousel products={buyAgainProducts} ariaLabel="Buy again products" />
        )}
      </ContentSection>

      <Footer />
    </>
  )
}
