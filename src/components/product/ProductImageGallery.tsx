import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, type SyntheticEvent } from 'react'
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
  const [internalIndex, setInternalIndex] = useState(0)
  const activeIndex = controlledIndex ?? internalIndex

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

        <div className="product-detail-gallery-nav" aria-label="Gallery navigation">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className={cn(
              'product-detail-gallery-arrow flex items-center justify-center p-1',
              focusRingClasses,
            )}
          >
            <ChevronLeft size={12} strokeWidth={1.5} aria-hidden />
          </button>

          <ul className={cn('product-detail-gallery-dots flex items-center')} aria-label="Image pagination">
            {images.map((image, index) => (
              <li key={`${image.src}-dot-${index}`} className="product-detail-gallery-dot-slot">
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
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
            aria-label="Next image"
            className={cn(
              'product-detail-gallery-arrow flex items-center justify-center p-1',
              focusRingClasses,
            )}
          >
            <ChevronRight size={12} strokeWidth={1.5} aria-hidden />
          </button>
        </div>
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
  return (
    <ul
      className={cn(
        'product-detail-media-thumbs flex flex-wrap items-end',
        className,
      )}
      aria-label="Product media"
    >
      {images.map((image, index) => (
        <li key={`${image.src}-media-${index}`}>
          <button
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`View media ${index + 1}`}
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
