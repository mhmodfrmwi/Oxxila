// src/components/admin/reports/ProductSalesHeaderCard.tsx
import { ImageOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProductSalesProductHeader } from '../../../types/adminReports'
import { formatAdminProductPrice } from '../../../utils/adminProductsFormat'
import { resolveProductImageUrl } from '../../../utils/productImage'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

interface ProductSalesHeaderCardProps {
  product: ProductSalesProductHeader | null
  loading?: boolean
}

export function ProductSalesHeaderCard({
  product,
  loading = false,
}: ProductSalesHeaderCardProps) {
  const { t, i18n } = useTranslation()

  if (loading && !product) {
    return <Skeleton className="h-28 rounded-[var(--admin-radius-2xl)]" />
  }

  if (!product) return null

  const imageUrl = resolveProductImageUrl(product.image)

  return (
    <GlassCard strong className="rounded-[var(--admin-radius-2xl)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-white/5">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-white/30">
              <ImageOff size={24} aria-hidden />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-primary-text">{product.name}</h2>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-secondary-text">
            {product.category?.name ? (
              <span>
                {t('admin.reports.detail.category')}: {product.category.name}
              </span>
            ) : null}
            {product.brand?.name ? (
              <span>
                {t('admin.reports.detail.brand')}: {product.brand.name}
              </span>
            ) : null}
            <span>
              {t('admin.reports.detail.currentPrice')}:{' '}
              {formatAdminProductPrice(product.price, i18n.language)}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
