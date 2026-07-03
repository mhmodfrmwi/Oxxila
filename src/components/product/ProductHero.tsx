import { Heart, Package, Share2, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { LOGIN_PATH } from '../../config/routes'
import { ApiError, getAccessToken } from '../../lib/api'
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
}: {
  icon: typeof Heart
  label: string
}) {
  return (
    <button type="button" aria-label={label} className="product-detail-icon-action">
      <Icon size={20} strokeWidth={1.5} aria-hidden />
    </button>
  )
}

export function ProductHero({ product, className }: ProductHeroProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
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
    offerEndsLabel,
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
    availability,
    tags,
    stockCount,
    deliveryEstimate,
  } = product

  const [quantity, setQuantity] = useState(1)
  const [selectedShade, setSelectedShade] = useState(shades?.[0] ?? '')
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '')
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const discountLabel =
    discountPercent != null && discountPercent > 0 ? `${discountPercent}% off` : null

  async function handleAddToCart() {
    if (!isAuthenticated || !getAccessToken()) {
      navigate(LOGIN_PATH)
      return
    }

    if (!product.id?.trim()) {
      setCartMessage('Unable to add this product. Product ID is missing.')
      setCartMessageIsError(true)
      return
    }

    if (stockCount <= 0) {
      setCartMessage('This product is out of stock.')
      setCartMessageIsError(true)
      return
    }

    setCartLoading(true)
    setCartMessage(null)
    setCartMessageIsError(false)

    try {
      await addToCart(product.id, quantity)
      setCartMessage('Added to cart.')
      setCartMessageIsError(false)
    } catch (error) {
      setCartMessage(
        error instanceof ApiError ? error.message : 'Unable to add item to cart.',
      )
      setCartMessageIsError(true)
    } finally {
      setCartLoading(false)
    }
  }

  return (
    <section className={cn('product-detail-hero', className)} aria-label="Product details">
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

        {badge && (
          <div className="mb-2.5">
            <ProductBadge>{badge}</ProductBadge>
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
          <span className="product-detail-price-current">{formatProductPriceDetail(price)}</span>
          <span className="product-detail-price-unit">/ pcs</span>
          {originalPrice != null && (
            <span className="product-detail-price-old">{formatProductPriceDetail(originalPrice)}</span>
          )}
          {discountLabel && (
            <span className="product-detail-discount-badge">{discountLabel}</span>
          )}
          {offerEndsLabel && (
            <span className="product-detail-price-unit">{offerEndsLabel}</span>
          )}
        </div>

        {soldCount != null && (
          <p className="product-detail-price-unit">{soldCount} Sold</p>
        )}

        <p className="product-detail-stock-badge">
          <Package size={16} strokeWidth={1.5} aria-hidden />
          <span>
            {stockCount} in stock ready
            {deliveryEstimate ? ` — ${deliveryEstimate}` : ''}
          </span>
        </p>

        <p className="product-detail-info-description">{description}</p>

        <section className="product-detail-media-section" aria-label="Product media">
          <p className="product-detail-section-label">Media</p>
          <ProductMediaThumbnails
            images={images}
            activeIndex={activeImageIndex}
            onSelect={setActiveImageIndex}
          />
        </section>

        {beforeAfterImages.length > 0 && (
        <section className="product-detail-ba-section" aria-label="Before and after results">
          <p className="product-detail-section-label">Before / After</p>
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
            label="Shade"
            options={shades}
            value={selectedShade}
            onChange={setSelectedShade}
          />
        )}

        {sizes.length > 0 && (
          <VariantSelector
            label="Size"
            options={sizes}
            value={selectedSize}
            onChange={setSelectedSize}
          />
        )}

        <div className="product-detail-quantity-section">
          <p>Quantity</p>
          <QuantitySelector value={quantity} onChange={setQuantity} />
        </div>

        <div className="product-detail-actions">
          <Button
            variant="primary"
            pill
            fullWidth
            className="product-detail-cta"
            onClick={() => void handleAddToCart()}
            disabled={cartLoading || stockCount <= 0}
          >
            <ShoppingBag size={18} strokeWidth={1.5} aria-hidden />
            {cartLoading ? 'Adding...' : 'Add to Cart'}
          </Button>
          <Button
            variant="outline"
            pill
            fullWidth
            className="product-detail-cta product-detail-cta-outline !border"
          >
            One Click Checkout
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
          <SocialIconButton icon={Heart} label="Add to wishlist" />
          <SocialIconButton icon={Share2} label="Share product" />
        </div>

        <dl className="product-detail-meta">
          <div>
            <dt>SKU</dt>
            <dd>{sku}</dd>
          </div>
          <div>
            <dt>Category</dt>
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
              <dt>Subcategory</dt>
              <dd className="capitalize">{subCategoryName}</dd>
            </div>
          )}
          <div>
            <dt>Brand</dt>
            <dd className="capitalize">{brand}</dd>
          </div>
          <div>
            <dt>Availability</dt>
            <dd>{availability}</dd>
          </div>
          <div className="col-span-2">
            <dt>Tags</dt>
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
