// src/components/cart/CartPageContent.tsx
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { HOME_PATH } from '../../config/routes'
import { goToCheckout } from '../../utils/authReturnTo'
import { formatCartPrice } from '../../utils/formatProductPrice'
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
import { FormMessage } from '../auth/FormMessage'
import { Button } from '../ui/Button'
import { CartEmptyState } from './CartEmptyState'
import { CartItemRow } from './CartItemRow'
import { CartPageSkeleton } from './CartPageSkeleton'
import { CartShippingBar } from './CartShippingBar'
import { ClearCartDialog } from './ClearCartDialog'
import { OrderSummaryCard } from './OrderSummaryCard'

export function CartPageContent() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const {
    cart,
    itemCount,
    loading,
    loadError,
    updatingItemId,
    couponLoading,
    clearingCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    refreshCart,
    pendingCoupon,
    couponPreview,
    couponPreviewError,
  } = useCart()
  const { primaryAddress, loading: addressLoading } = useCartAddresses()
  const { products: browsingProducts, loading: browsingLoading } = useBrowsingHistory(6)
  const { products: buyAgainProducts, loading: buyAgainLoading } = useBuyAgainProducts()
  const [selectedOverrides, setSelectedOverrides] = useState<Record<string, boolean>>({})
  const [actionError, setActionError] = useState<string | null>(null)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)

  const items = useMemo(() => cart?.items ?? [], [cart?.items])
  const hasItems = items.length > 0

  const selectedIds = useMemo(() => {
    const next: Record<string, boolean> = {}
    for (const item of items) {
      next[item._id] = selectedOverrides[item._id] ?? true
    }
    return next
  }, [items, selectedOverrides])

  const itemCountLabel = t('cart.itemCount', { count: itemCount })

  // Guest with a saved code: show the discount in the summary now. It is only a preview — the
  // code is recorded as used once an order is actually placed.
  const guestCouponActive = Boolean(pendingCoupon && couponPreview && couponPreview.discountAmount > 0)
  const summaryCart =
    cart && pendingCoupon && couponPreview
      ? {
          ...cart,
          couponCode: null,
          discountAmount: couponPreview.discountAmount,
          totalPrice: couponPreview.totalPrice,
        }
      : cart
  const couponNote = pendingCoupon
    ? couponPreviewError
      ? couponPreviewError
      : couponPreview?.freeShipping
        ? t('cart.summary.couponFreeShipping')
        : guestCouponActive
          ? t(couponPreview!.discountType === 'percentage' ? 'cart.summary.couponSavesPercent' : 'cart.summary.couponSaves', {
              amount: formatCartPrice(couponPreview!.discountAmount, i18n.language),
              percent: couponPreview!.discountValue,
            })
          : null
    : null

  async function handleQuantityChange(itemId: string, quantity: number) {
    setActionError(null)
    try {
      await updateCartItem(itemId, quantity)
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : t('cart.updateQuantityError'),
      )
    }
  }

  async function handleRemove(itemId: string) {
    setActionError(null)
    try {
      await removeCartItem(itemId)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : t('cart.removeItemError'))
    }
  }

  return (
    <>
      <div className="container-content mx-auto max-w-[1240px] pb-8 sm:pb-10">
        <Breadcrumb
          className="mb-5 sm:mb-6"
          items={[
            { label: t('nav.home'), href: HOME_PATH },
            { label: t('nav.cart') },
          ]}
        />

        {loading && !cart ? (
          <CartPageSkeleton />
        ) : loadError && !cart ? (
          <div className="space-y-4" role="alert">
            <header className="mb-5 sm:mb-6">
              <Heading variant="page" className="cart-page-title mb-1">
                {t('cart.title')}
              </Heading>
            </header>
            <FormMessage message={loadError || t('cart.loadError')} />
            <Button type="button" variant="outline" onClick={() => void refreshCart()}>
              {t('cart.retry')}
            </Button>
          </div>
        ) : (
          <>
            <header className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:mb-6">
              <div>
                <Heading variant="page" className="cart-page-title mb-1">
                  {t('cart.title')}
                </Heading>
                {hasItems && (
                  <p className="text-sm text-secondary-text">{itemCountLabel}</p>
                )}
              </div>
              {hasItems && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={clearingCart}
                  onClick={() => {
                    setClearError(null)
                    setClearDialogOpen(true)
                  }}
                  className="text-support-error hover:bg-support-error/10 hover:text-support-error"
                >
                  {t('cart.clear.action')}
                </Button>
              )}
            </header>

            {/* Guests have no saved address yet — it's collected at checkout. */}
            {hasItems && (
              <div className="mb-5 sm:mb-6">
                {isAuthenticated ? (
                  <CartShippingBar address={primaryAddress} loading={addressLoading} />
                ) : (
                  <p className="cart-shipping-bar text-secondary-text">{t('cart.shipping.guestNote')}</p>
                )}
              </div>
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
                <section aria-label={t('cart.itemsAria')} className="min-w-0">
                  <div className="cart-items-list">
                    {items.map((item) => (
                      <CartItemRow
                        key={item._id}
                        item={item}
                        selected={selectedIds[item._id] ?? true}
                        onSelectedChange={(selected) =>
                          setSelectedOverrides((current) => ({
                            ...current,
                            [item._id]: selected,
                          }))
                        }
                        onQuantityChange={(quantity) =>
                          void handleQuantityChange(item._id, quantity)
                        }
                        onRemove={() => void handleRemove(item._id)}
                        disabled={updatingItemId === item._id}
                      />
                    ))}
                  </div>
                </section>

                {cart && (
                  <OrderSummaryCard
                    cart={summaryCart ?? cart}
                    couponLoading={couponLoading}
                    checkoutDisabled={Boolean(updatingItemId)}
                    onApplyCoupon={applyCoupon}
                    onRemoveCoupon={removeCoupon}
                    // Guests can enter a code too: it is saved and applied after they sign in.
                    showPromo
                    pendingCoupon={pendingCoupon}
                    couponNote={couponNote}
                    discountPercent={
                      pendingCoupon && couponPreview?.discountType === 'percentage'
                        ? couponPreview.discountValue
                        : null
                    }
                    onCtaClick={() => goToCheckout(navigate, isAuthenticated)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {(browsingLoading || browsingProducts.length > 0) && (
        <ContentSection padding="compact" aria-labelledby="cart-browsing-heading">
          <SectionHeader
            id="cart-browsing-heading"
            title={t('cart.recentlyViewed')}
            size="compact"
          />
          {browsingLoading ? (
            <div className="h-[280px] animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
          ) : (
            <ProductCarousel
              products={browsingProducts}
              ariaLabel={t('cart.recentlyViewedAria')}
            />
          )}
        </ContentSection>
      )}

      {(buyAgainLoading || buyAgainProducts.length > 0) && (
        <ContentSection padding="compact" aria-labelledby="cart-buy-again-heading">
          <SectionHeader id="cart-buy-again-heading" title={t('cart.buyAgain')} size="compact" />
          {buyAgainLoading ? (
            <div className="h-[280px] animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
          ) : (
            <ProductCarousel products={buyAgainProducts} ariaLabel={t('cart.buyAgainAria')} />
          )}
        </ContentSection>
      )}

      <ClearCartDialog
        open={clearDialogOpen && hasItems}
        itemCount={itemCount}
        subtotal={cart?.subtotal ?? 0}
        submitting={clearingCart}
        error={clearError}
        onError={setClearError}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={async () => {
          await clearCart()
          setSelectedOverrides({})
          setClearDialogOpen(false)
        }}
      />

      <Footer />
    </>
  )
}
