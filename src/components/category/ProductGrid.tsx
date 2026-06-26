import { cn } from '../../lib/cn'
import { ProductCard } from '../shop/recommended/ProductCard'
import type { RecommendedProduct } from '../shop/recommended/recommendedProductsData'

interface ProductGridProps {
  products: RecommendedProduct[]
  className?: string
}

export function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4',
        className,
      )}
    >
      {products.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductCard product={product} layout="grid" />
        </li>
      ))}
    </ul>
  )
}
