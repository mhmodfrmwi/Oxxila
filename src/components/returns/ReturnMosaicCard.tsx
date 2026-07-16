// src/components/returns/ReturnMosaicCard.tsx
import type { ReturnRequestItem } from '../../api/returns'
import { cn } from '../../lib/cn'
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  resolveProductImageUrl,
} from '../../utils/productImage'

interface ReturnMosaicCardProps {
  items: ReturnRequestItem[]
  className?: string
}

export function ReturnMosaicCard({ items, className }: ReturnMosaicCardProps) {
  const count = items.length
  if (count === 0) return null

  const showOverflow = count > 4
  const visible = showOverflow ? items.slice(0, 3) : items.slice(0, 4)
  const overflow = showOverflow ? count - 3 : 0
  const gridClass =
    count === 1
      ? 'returns-history-mosaic--1'
      : count === 2
        ? 'returns-history-mosaic--2'
        : 'returns-history-mosaic--4'

  return (
    <div className={cn('returns-history-mosaic', gridClass, className)} aria-hidden>
      {visible.map((item, index) => {
        const src = resolveProductImageUrl(item.image) || PRODUCT_IMAGE_PLACEHOLDER
        return (
          <div key={`${item.orderItemId}-${index}`} className="returns-history-mosaic-cell">
            <img
              src={src}
              alt=""
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER
              }}
            />
          </div>
        )
      })}
      {overflow > 0 && (
        <div className="returns-history-mosaic-cell">
          <span className="returns-history-mosaic-more">+{overflow}</span>
        </div>
      )}
    </div>
  )
}
