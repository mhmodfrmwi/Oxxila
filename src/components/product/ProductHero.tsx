// src/components/product/ProductHero.tsx
import { Heart, Package, Share2, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { LOGIN_PATH } from '../../config/routes'
import { ApiError, getAccessToken } from '../../lib/api'
import { useProductCardActions } from '../../hooks/useProductCardActions'
import { Button } from '../ui/Button'
import { ProductBadge } from '../ui/ProductBadge'
import { ProductRating } from '../ui/ProductRating'
import { formatProductPriceDetail } from '../../utils/formatProductPrice'
import { ProductDescriptionCard } from './ProductDescriptionCard'
import { ProductImageGallery, ProductMediaThumbnails } from './ProductImageGallery'
import type { ProductDetail } from '../../types/productDetail'
import { QuantitySelector } from './QuantitySelector'
import { VariantSelector } from './VariantSelector'

interface ProductHeroProps {
  product: ProductDetail
  className?: string
}

function BrandMark({ brand, brandLogo }: { brand: string; brandLogo?: string }) {
  const initial = brand.charAt(0).toUpperCase()

  return (
    <div className="product-detail-info-brand">
      <span className="product-detail-info-brand-mark" aria-hidden>
        {brandLogo ? (
          <img src={brandLogo} alt="" className="h-full w-full object-contain" />
        ) : (
          initial
        )}
      </span>
      <span className="product-detail-info-brand-name">{brand}</span>
    </div>
  )
}

function SocialIconButton({
  icon: Icon,
  label,
  onClick,
  filled = false,
  disabled = false,
}: {
  icon: typeof Heart
  label: string
  onClick?: () => void
  filled?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={filled || undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'product-detail-icon-action',
        filled && 'product-detail-icon-action-active',
      )}
    >
      <Icon size={20} strokeWidth={1.5} aria-hidden fill={filled ? 'currentColor' : 'none'} />
    </button>
  )
}

function translateBadge(badge: string | undefined, t: (key: string) => string) {
  if (!badge) return undefined
  switch (badge) {
    case 'Best seller':
      return t('productDetail.badge.bestSeller')
    case 'Certified':
      return t('productDetail.badge.certified')
    case 'Bundle':
      return t('productDetail.badge.bundle')
    default:
      return badge
  }
}

function formatOfferDate(value: string, locale: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ProductHero({ product, className }: ProductHeroProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const {
    wishlisted,
    wishlistPending,
    handleWishlistToggle,
  } = useProductCardActions(product.id)
  const [cartLoading, setCartLoading] = useState(false)
  const [cartMessage, setCartMessage] = useState<string | null>(null)
  const [cartMessageIsError, setCartMessageIsError] = useState(false)

  const {
    brand,
    brandLogo,
    badge,
    title,
    price,
    originalPrice,
    rating,
    reviewCount,
    discountPercent,
    offerEndsAt,
    soldCount,
    description,
    advantages,
    composition,
    images,
    beforeAfterImages,
    sizes,
    shades,
    sku,
    categoryName,
    categoryHref,
    subCategoryName,
    tags,
    stockCount,
    deliveryEstimate,
  } = product

  const [quantity, setQuantity] = useState(1)
  const [selectedShade, setSelectedShade] = useState(shades?.[0] ?? '')
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '')
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const maxQuantity = Math.max(1, stockCount)
  const isOutOfStock = stockCount <= 0

  useEffect(() => {
    setQuantity((current) => {
      if (isOutOfStock) return 1
      return Math.min(Math.max(1, current), maxQuantity)
    })
  }, [isOutOfStock, maxQuantity, product.id])

  const discountLabel =
    discountPercent != null && discountPercent > 0
      ? t('productDetail.percentOff', { percent: discountPercent })
      : null

  const offerEndsLabel = offerEndsAt
    ? t('productDetail.offerEnds', { date: formatOfferDate(offerEndsAt, i18n.language) })
    : undefined

  const availabilityLabel =
    isOutOfStock ? t('productDetail.outOfStock') : t('productDetail.inStock')

  const stockBadgeLabel = isOutOfStock
    ? t('productDetail.outOfStock')
    : deliveryEstimate
      ? t('productDetail.inStockReadyWithDelivery', {
          count: stockCount,
          delivery: deliveryEstimate,
        })
      : t('productDetail.inStockReady', { count: stockCount })

  const badgeLabel = translateBadge(badge, t)

  async function handleAddToCart() {
    if (!isAuthenticated || !getAccessToken()) {
      navigate(LOGIN_PATH)
      return
    }

    if (!product.id?.trim()) {
      setCartMessage(t('productDetail.cart.missingId'))
      setCartMessageIsError(true)
      return
    }

    if (isOutOfStock) {
      setCartMessage(t('productDetail.cart.outOfStock'))
      setCartMessageIsError(true)
      return
    }

    const safeQuantity = Math.min(Math.max(1, quantity), maxQuantity)

    setCartLoading(true)
    setCartMessage(null)
    setCartMessageIsError(false)

    try {
      await addToCart(product.id, safeQuantity)
      setCartMessage(t('productDetail.cart.added'))
      setCartMessageIsError(false)
    } catch (error) {
      setCartMessage(
        error instanceof ApiError ? error.message : t('productDetail.cart.failed'),
      )
      setCartMessageIsError(true)
    } finally {
      setCartLoading(false)
    }
  }

  return (
    <section
      className={cn('product-detail-hero', className)}
      aria-label={t('productDetail.ariaLabel')}
    >
      <div className="product-detail-hero-shell">
        <div className="product-detail-hero-grid">
          <ProductDescriptionCard
            className="product-detail-hero-description order-3 lg:order-1"
            description={description}
            advantages={advantages}
            composition={composition}
          />

          <ProductImageGallery
            className="product-detail-hero-gallery order-1 lg:order-2"
            images={images}
            activeIndex={activeImageIndex}
            onActiveIndexChange={setActiveImageIndex}
          />

          <article className="product-detail-purchase-card order-2 min-w-0 lg:order-3">
            <BrandMark brand={brand} brandLogo={brandLogo} />

            <h1 className="product-detail-info-title">{title}</h1>

            {badgeLabel && (
              <div className="mb-2.5">
                <ProductBadge>{badgeLabel}</ProductBadge>
              </div>
            )}

            <ProductRating
              className="product-detail-info-rating"
              rating={rating}
              reviewCount={reviewCount}
              variant="detail"
              starSize={16}
            />

            <div className="product-detail-price-row">
              <span className="product-detail-price-current">
                {formatProductPriceDetail(price)}
              </span>
              <span className="product-detail-price-unit">{t('productDetail.perPiece')}</span>
              {originalPrice != null && (
                <span className="product-detail-price-old">
                  {formatProductPriceDetail(originalPrice)}
                </span>
              )}
              {discountLabel && (
                <span className="product-detail-discount-badge">{discountLabel}</span>
              )}
              {offerEndsLabel && (
                <span className="product-detail-price-unit">{offerEndsLabel}</span>
              )}
            </div>

            {soldCount != null && (
              <p className="product-detail-price-unit">
                {t('productDetail.sold', { count: soldCount })}
              </p>
            )}

            <p
              className={cn(
                'product-detail-stock-badge',
                isOutOfStock && 'product-detail-stock-badge--out-of-stock',
              )}
            >
              <Package size={16} strokeWidth={1.5} aria-hidden />
              <span>{stockBadgeLabel}</span>
            </p>

            <p className="product-detail-info-description">{description}</p>

            <section
              className="product-detail-media-section"
              aria-label={t('productDetail.mediaAria')}
            >
              <p className="product-detail-section-label">{t('productDetail.media')}</p>
              <ProductMediaThumbnails
                images={images}
                activeIndex={activeImageIndex}
                onSelect={setActiveImageIndex}
              />
            </section>

            {beforeAfterImages.length > 0 && (
              <section
                className="product-detail-ba-section"
                aria-label={t('productDetail.beforeAfterAria')}
              >
                <p className="product-detail-section-label">{t('productDetail.beforeAfter')}</p>
                <ul className="product-detail-media-thumbs flex flex-wrap">
                  {beforeAfterImages.map((image, index) => (
                    <li key={`${image.src}-ba-${index}`}>
                      <div className="product-card-frame product-detail-ba-thumb overflow-hidden border border-border-subtle">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          draggable={false}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {shades != null && shades.length > 0 && (
              <VariantSelector
                label={t('productDetail.shade')}
                options={shades}
                value={selectedShade}
                onChange={setSelectedShade}
              />
            )}

            {sizes.length > 0 && (
              <VariantSelector
                label={t('productDetail.size')}
                options={sizes}
                value={selectedSize}
                onChange={setSelectedSize}
              />
            )}

            <div className="product-detail-quantity-section">
              <p>{t('productDetail.quantity')}</p>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={maxQuantity}
              />
            </div>

            <div className="product-detail-actions">
              <Button
                variant="primary"
                pill
                fullWidth
                className="product-detail-cta"
                onClick={() => void handleAddToCart()}
                disabled={cartLoading || isOutOfStock}
              >
                <ShoppingBag size={18} strokeWidth={1.5} aria-hidden />
                {cartLoading ? t('productDetail.adding') : t('actions.addToCart')}
              </Button>
              <Button
                variant="outline"
                pill
                fullWidth
                className="product-detail-cta product-detail-cta-outline !border"
              >
                {t('productDetail.oneClickCheckout')}
              </Button>
            </div>

            {cartMessage && (
              <p
                className={cn(
                  'text-sm',
                  cartMessageIsError ? 'text-support-error' : 'text-support-success',
                )}
                role={cartMessageIsError ? 'alert' : 'status'}
              >
                {cartMessage}
              </p>
            )}

            <div className="product-detail-social-actions">
              <SocialIconButton
                icon={Heart}
                label={
                  wishlisted
                    ? t('wishlist.removeFromWishlist')
                    : t('shop.product.addToWishlist')
                }
                filled={wishlisted}
                disabled={wishlistPending}
                onClick={() => {
                  void handleWishlistToggle()
                }}
              />
              <SocialIconButton icon={Share2} label={t('productDetail.share')} />
            </div>

            <dl className="product-detail-meta">
              <div>
                <dt>{t('productDetail.sku')}</dt>
                <dd>{sku}</dd>
              </div>
              <div>
                <dt>{t('productDetail.category')}</dt>
                <dd>
                  <Link
                    to={categoryHref}
                    className="capitalize text-link transition-colors hover:text-link-hover"
                  >
                    {categoryName}
                  </Link>
                </dd>
              </div>
              {subCategoryName && (
                <div>
                  <dt>{t('productDetail.subcategory')}</dt>
                  <dd className="capitalize">{subCategoryName}</dd>
                </div>
              )}
              <div>
                <dt>{t('productDetail.brand')}</dt>
                <dd className="capitalize">{brand}</dd>
              </div>
              <div>
                <dt>{t('productDetail.availability')}</dt>
                <dd>{availabilityLabel}</dd>
              </div>
              <div className="col-span-2">
                <dt>{t('productDetail.tags')}</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-surface-muted px-2 py-0.5 text-xs leading-4 text-primary-text"
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  )
}
