// src/components/product/ProductImageGallery.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'
import { PRODUCT_IMAGE_PLACEHOLDER } from '../../utils/productImage'
import type { ProductImage } from '../../types/productDetail'

interface ProductImageGalleryProps {
  images: readonly ProductImage[]
  activeIndex?: number
  onActiveIndexChange?: (index: number) => void
  className?: string
}

export function ProductImageGallery({
  images,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  className,
}: ProductImageGalleryProps) {
  const { t, i18n } = useTranslation()
  const [internalIndex, setInternalIndex] = useState(0)
  const activeIndex = controlledIndex ?? internalIndex
  const isRtl = i18n.dir() === 'rtl'
  const showNav = images.length > 1
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  function setActiveIndex(index: number) {
    if (onActiveIndexChange) {
      onActiveIndexChange(index)
    } else {
      setInternalIndex(index)
    }
  }

  const activeImage = images[activeIndex] ?? images[0]

  function goPrev() {
    setActiveIndex(activeIndex <= 0 ? images.length - 1 : activeIndex - 1)
  }

  function goNext() {
    setActiveIndex(activeIndex >= images.length - 1 ? 0 : activeIndex + 1)
  }

  if (!activeImage) return null

  function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
    if (event.currentTarget.src !== PRODUCT_IMAGE_PLACEHOLDER) {
      event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER
    }
  }

  return (
    <div className={cn('product-detail-gallery flex w-full min-w-0 flex-col', className)}>
      <div className="product-card-frame product-detail-gallery-main w-full overflow-hidden">
        <img
          src={activeImage.src}
          alt={activeImage.alt}
          className="h-full w-full object-cover object-center"
          loading="eager"
          draggable={false}
          onError={handleImageError}
        />

        {showNav && (
          <div
            className="product-detail-gallery-nav"
            aria-label={t('productDetail.gallery.navigation')}
          >
            <button
              type="button"
              onClick={goPrev}
              aria-label={t('productDetail.gallery.previous')}
              className={cn(
                'product-detail-gallery-arrow flex items-center justify-center p-1',
                focusRingClasses,
              )}
            >
              <PrevIcon size={12} strokeWidth={1.5} aria-hidden />
            </button>

            <ul
              className={cn('product-detail-gallery-dots flex items-center')}
              aria-label={t('productDetail.gallery.pagination')}
            >
              {images.map((image, index) => (
                <li key={`${image.src}-dot-${index}`} className="product-detail-gallery-dot-slot">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={t('productDetail.gallery.goToImage', { number: index + 1 })}
                    aria-current={index === activeIndex ? 'true' : undefined}
                    className={cn('product-detail-gallery-dot', focusRingClasses)}
                    data-active={index === activeIndex ? 'true' : 'false'}
                  />
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={goNext}
              aria-label={t('productDetail.gallery.next')}
              className={cn(
                'product-detail-gallery-arrow flex items-center justify-center p-1',
                focusRingClasses,
              )}
            >
              <NextIcon size={12} strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface ProductMediaThumbnailsProps {
  images: readonly ProductImage[]
  activeIndex: number
  onSelect: (index: number) => void
  className?: string
}

export function ProductMediaThumbnails({
  images,
  activeIndex,
  onSelect,
  className,
}: ProductMediaThumbnailsProps) {
  const { t } = useTranslation()

  if (images.length <= 1) return null

  return (
    <ul
      className={cn('product-detail-media-thumbs flex flex-wrap items-end', className)}
      aria-label={t('productDetail.gallery.productMedia')}
    >
      {images.map((image, index) => (
        <li key={`${image.src}-media-${index}`}>
          <button
            type="button"
            onClick={() => onSelect(index)}
            aria-label={t('productDetail.gallery.viewMedia', { number: index + 1 })}
            aria-current={index === activeIndex ? 'true' : undefined}
            className={cn(
              'product-card-frame product-detail-thumb block overflow-hidden',
              focusRingClasses,
            )}
            data-active={index === activeIndex ? 'true' : 'false'}
          >
            <img
              src={image.src}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              draggable={false}
              onError={(event) => {
                if (event.currentTarget.src !== PRODUCT_IMAGE_PLACEHOLDER) {
                  event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER
                }
              }}
            />
          </button>
        </li>
      ))}
    </ul>
  )
}
