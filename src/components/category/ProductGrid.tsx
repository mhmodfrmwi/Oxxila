// src/components/category/ProductGrid.tsx
import { cn } from '../../lib/cn'
import { ProductCard } from '../shop/recommended/ProductCard'
import type { RecommendedProduct } from '../shop/recommended/recommendedProductsData'

interface ProductGridProps {
  products: readonly RecommendedProduct[]
  className?: string
}

export function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <ul
      className={cn(
        // Phones <400px: 1-up so cards stay readable · mobile 2-up (gap 12) · laptop 3 · desktop 4 — equal-height rows
        'grid w-full grid-cols-2 items-stretch gap-[var(--catalog-card-gap)] max-[399px]:grid-cols-1',
        'md:grid-cols-3',
        'xl:grid-cols-4',
        className,
      )}
    >
      {products.map((product) => (
        <li key={product.id} className="flex min-w-0 w-full">
          <ProductCard product={product} layout="grid" className="w-full" />
        </li>
      ))}
    </ul>
  )
}
