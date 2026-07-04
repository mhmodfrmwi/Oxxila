// src/components/shop/ShopCategoriesStrip.tsx
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { StripCarousel } from '../carousel/StripCarousel'
import { ShopCategoryCard } from './ShopCategoryCard'
import { shopCategories } from './shopData'

const DESKTOP_BREAKPOINT = '(min-width: 1024px)'

function categoryName(t: (key: string) => string, id: string, fallback: string) {
  const key = `shop.categories.items.${id}`
  const translated = t(key)
  return translated === key ? fallback : translated
}

function CategoryGrid() {
  const { t } = useTranslation()

  return (
    <div className="flex w-full items-start justify-between gap-3">
      {shopCategories.map((category) => (
        <ShopCategoryCard
          key={category.id}
          name={categoryName(t, category.id, category.name)}
          image={category.image}
          href={category.href}
          layout="grid"
        />
      ))}
    </div>
  )
}

function CategoryCarousel() {
  const { t } = useTranslation()

  return (
    <StripCarousel
      items={shopCategories}
      getItemKey={(category) => category.id}
      ariaLabel={t('shop.categories.ariaLabel')}
      renderItem={(category) => (
        <ShopCategoryCard
          name={categoryName(t, category.id, category.name)}
          image={category.image}
          href={category.href}
          layout="carousel"
        />
      )}
    />
  )
}

export function ShopCategoriesStrip() {
  const { t } = useTranslation()
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT)

  return (
    <section
      aria-label={t('shop.categories.ariaLabel')}
      className="bg-background pb-6 pt-2 sm:pb-8 sm:pt-3 lg:pb-10"
    >
      <div className="container-content">
        {isDesktop ? <CategoryGrid /> : <CategoryCarousel />}
      </div>
    </section>
  )
}
