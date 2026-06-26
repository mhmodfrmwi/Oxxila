import { useMediaQuery } from '../../hooks/useMediaQuery'
import { StripCarousel } from '../carousel/StripCarousel'
import { ShopCategoryCard } from './ShopCategoryCard'
import { shopCategories } from './shopData'

const DESKTOP_BREAKPOINT = '(min-width: 1024px)'

function CategoryGrid() {
  return (
    <div className="flex w-full items-start justify-between gap-3">
      {shopCategories.map((category) => (
        <ShopCategoryCard
          key={category.id}
          name={category.name}
          image={category.image}
          href={category.href}
          layout="grid"
        />
      ))}
    </div>
  )
}

function CategoryCarousel() {
  return (
    <StripCarousel
      items={shopCategories}
      getItemKey={(category) => category.id}
      ariaLabel="Shop categories"
      renderItem={(category) => (
        <ShopCategoryCard
          name={category.name}
          image={category.image}
          href={category.href}
          layout="carousel"
        />
      )}
    />
  )
}

export function ShopCategoriesStrip() {
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT)

  return (
    <section aria-label="Shop categories" className="bg-background pb-6 pt-2 sm:pb-8 sm:pt-3 lg:pb-10">
      <div className="container-content">
        {isDesktop ? <CategoryGrid /> : <CategoryCarousel />}
      </div>
    </section>
  )
}
