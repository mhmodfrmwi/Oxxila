// src/components/product/ProductHero.tsx
import { Heart, Share2, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { LOGIN_PATH, PAYMENT_PATH } from '../../config/routes'
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
  /** Prefer reconciled review stats over product denormalized counters. */
  ratingOverride?: number
  reviewCountOverride?: number
  className?: string
}

function BrandMark({
  brand,
  brandLogo,
  href,
}: {
  brand: string
  brandLogo?: string
  href?: string
}) {
  const name = brand.trim()
  if (!name) return null

  const initial = name.charAt(0).toUpperCase()
  const className =
    'mb-3 inline-flex max-w-full items-center gap-2.5 text-primary-text transition-opacity hover:opacity-80'

  const content = (
    <>
      <span
        className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface-muted text-sm font-semibold"
        aria-hidden
      >
        {brandLogo ? (
          <img src={brandLogo} alt="" className="h-full w-full object-contain p-1" />
        ) : (
          initial
        )}
      </span>
      <span className="truncate font-serif text-sm font-medium tracking-wide md:text-base">
        {name}
      </span>
    </>
  )

  if (href) {
    return (
      <Link to={href} className={className} aria-label={name}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
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

function translateTag(tag: string, t: (key: string) => string) {
  switch (tag) {
    case 'Sensitive skin':
      return t('productDetail.tag.sensitiveSkin')
    case 'Certified':
      return t('productDetail.badge.certified')
    default:
      return tag
  }
}

function formatOfferDate(value: string, locale: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale.startsWith('ar') ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ProductHero({
  product,
  ratingOverride,
  reviewCountOverride,
  className,
}: ProductHeroProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const {
    wishlisted,
    wishlistPending,
    handleWishlistToggle,
  } = useProductCardActions(product.id)
  const [cartLoading, setCartLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [cartMessage, setCartMessage] = useState<string | null>(null)
  const [cartMessageIsError, setCartMessageIsError] = useState(false)
  const [sharePending, setSharePending] = useState(false)

  const {
    brand,
    brandLogo,
    brandHref,
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
    categoryName,
    categoryHref,
    subCategoryName,
    tags,
    stockCount,
  } = product

  const displayRating = ratingOverride ?? rating
  const displayReviewCount = reviewCountOverride ?? reviewCount

  const [quantity, setQuantity] = useState(1)
  const [selectedShade, setSelectedShade] = useState(shades?.[0] ?? '')
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '')
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const isOutOfStock = stockCount <= 0
  const maxQuantity = isOutOfStock ? 1 : Math.max(1, stockCount)

  useEffect(() => {
    setQuantity((current) => {
      if (isOutOfStock) return 1
      return Math.min(Math.max(1, current), maxQuantity)
    })
  }, [isOutOfStock, maxQuantity, product.id])

  useEffect(() => {
    setSelectedShade(shades?.[0] ?? '')
    setSelectedSize(sizes[0] ?? '')
    setActiveImageIndex(0)
  }, [product.id, shades, sizes])

  const discountLabel =
    discountPercent != null && discountPercent > 0
      ? t('productDetail.percentOff', { percent: discountPercent })
      : null

  const offerEndsLabel = offerEndsAt
    ? t('productDetail.offerEnds', { date: formatOfferDate(offerEndsAt, i18n.language) })
    : undefined

  const availabilityLabel =
    isOutOfStock ? t('productDetail.outOfStock') : t('productDetail.inStock')

  const badgeLabel = translateBadge(badge, t)

  function requireAuth(): boolean {
    if (isAuthenticated && getAccessToken()) return true
    toast.error(t('productDetail.auth.signInRequired'), t('productDetail.auth.signInRequiredDetail'))
    navigate(LOGIN_PATH)
    return false
  }

  async function handleAddToCart() {
    if (!requireAuth()) return

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
      // CartContext already shows a success toast — avoid duplicate inline success.
    } catch (error) {
      setCartMessage(
        error instanceof ApiError ? error.message : t('productDetail.cart.failed'),
      )
      setCartMessageIsError(true)
    } finally {
      setCartLoading(false)
    }
  }

  async function handleOneClickCheckout() {
    if (!requireAuth()) return
    if (!product.id?.trim() || isOutOfStock || checkoutLoading) return

    const safeQuantity = Math.min(Math.max(1, quantity), maxQuantity)
    setCheckoutLoading(true)
    setCartMessage(null)
    setCartMessageIsError(false)

    try {
      await addToCart(product.id, safeQuantity)
      navigate(PAYMENT_PATH)
    } catch (error) {
      setCartMessage(
        error instanceof ApiError ? error.message : t('productDetail.cart.failed'),
      )
      setCartMessageIsError(true)
    } finally {
      setCheckoutLoading(false)
    }
  }

  async function handleShare() {
    if (sharePending || typeof window === 'undefined') return
    const url = window.location.href
    const shareData = {
      title: `${brand} ${title}`.trim(),
      text: title,
      url,
    }

    setSharePending(true)
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share(shareData)
        return
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        toast.success(t('productDetail.shareCopied'))
        return
      }
      toast.error(t('productDetail.shareFailed'))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast.error(t('productDetail.shareFailed'))
    } finally {
      setSharePending(false)
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
            <BrandMark brand={brand} brandLogo={brandLogo} href={brandHref} />

            <h1 className="product-detail-info-title">{title}</h1>

            {badgeLabel && (
              <div className="mb-2.5">
                <ProductBadge>{badgeLabel}</ProductBadge>
              </div>
            )}

            <ProductRating
              className="product-detail-info-rating"
              rating={displayRating}
              reviewCount={displayReviewCount}
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

            {soldCount != null && soldCount > 0 ? (
              <p className="product-detail-stock-badge" role="status">
                <ShoppingBag size={16} strokeWidth={1.75} aria-hidden />
                <span>
                  {t('productDetail.soldRecently', { count: soldCount })}
                </span>
              </p>
            ) : null}

            <p className="product-detail-info-description">{description}</p>

            {images.length > 1 && (
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
            )}

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
                disabled={isOutOfStock || cartLoading || checkoutLoading}
              />
            </div>

            <div className="product-detail-actions">
              <Button
                variant="primary"
                pill
                fullWidth
                className="product-detail-cta"
                onClick={() => void handleAddToCart()}
                disabled={cartLoading || checkoutLoading || isOutOfStock}
                aria-busy={cartLoading || undefined}
              >
                <ShoppingBag size={18} strokeWidth={1.5} aria-hidden />
                {cartLoading ? t('productDetail.adding') : t('actions.addToCart')}
              </Button>
              <Button
                variant="outline"
                pill
                fullWidth
                className="product-detail-cta product-detail-cta-outline !border"
                onClick={() => void handleOneClickCheckout()}
                disabled={cartLoading || checkoutLoading || isOutOfStock}
                aria-busy={checkoutLoading || undefined}
              >
                {checkoutLoading
                  ? t('productDetail.oneClickCheckoutLoading')
                  : t('productDetail.oneClickCheckout')}
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
              <SocialIconButton
                icon={Share2}
                label={t('productDetail.share')}
                disabled={sharePending}
                onClick={() => {
                  void handleShare()
                }}
              />
            </div>

            <dl className="product-detail-meta">
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
              {subCategoryName ? (
                <div>
                  <dt>{t('productDetail.subcategory')}</dt>
                  <dd className="capitalize">{subCategoryName}</dd>
                </div>
              ) : null}
              {brand.trim() ? (
                <div>
                  <dt>{t('productDetail.brand')}</dt>
                  <dd className="capitalize">
                    {brandHref ? (
                      <Link
                        to={brandHref}
                        className="text-link transition-colors hover:text-link-hover"
                      >
                        {brand}
                      </Link>
                    ) : (
                      brand
                    )}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>{t('productDetail.availability')}</dt>
                <dd>{availabilityLabel}</dd>
              </div>
              {tags.length > 0 && (
                <div className="col-span-2">
                  <dt>{t('productDetail.tags')}</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-surface-muted px-2 py-0.5 text-xs leading-4 text-primary-text"
                      >
                        {translateTag(tag, t)}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </article>
        </div>
      </div>
    </section>
  )
}
