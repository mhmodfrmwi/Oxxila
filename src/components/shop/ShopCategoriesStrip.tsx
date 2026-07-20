// src/components/shop/ShopCategoriesStrip.tsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLandingCatalogContext } from '../../hooks/useLandingCatalogContext'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import type { ApiCategory } from '../../types/catalog'
import { categoryBrowsePath } from '../../utils/categoryBrowseParams'
import { StripCarousel } from '../carousel/StripCarousel'
import { ShopCategoryCard } from './ShopCategoryCard'
import { shopCategoryArtwork, type ShopCategory } from './shopData'

const DESKTOP_BREAKPOINT = '(min-width: 1024px)'

function categoryName(t: (key: string) => string, id: string, fallback: string) {
  const key = `shop.categories.items.${id}`
  const translated = t(key)
  return translated === key ? fallback : translated
}

function normalizeCategoryKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Resolve live catalog category for artwork card (slug/navigation only). */
function findLiveCategory(
  categories: readonly ApiCategory[],
  artworkId: string,
  artworkName: string,
): ApiCategory | undefined {
  const active = categories.filter((category) => category.isActive !== false)
  const bySlug = active.find((category) => category.slug === artworkId)
  if (bySlug) return bySlug

  const artworkKey = normalizeCategoryKey(artworkName)
  return active.find((category) => {
    const slugKey = normalizeCategoryKey(category.slug)
    const nameKey = normalizeCategoryKey(category.name)
    return slugKey === artworkKey || nameKey === artworkKey || slugKey === artworkId
  })
}

function CategoryGrid({ categories }: { categories: readonly ShopCategory[] }) {
  return (
    <div className="flex w-full items-start justify-between gap-3">
      {categories.map((category) => (
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

function CategoryCarousel({
  categories,
  ariaLabel,
}: {
  categories: readonly ShopCategory[]
  ariaLabel: string
}) {
  return (
    <StripCarousel
      items={categories}
      getItemKey={(category) => category.id}
      ariaLabel={ariaLabel}
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
  const { t } = useTranslation()
  const { categories } = useLandingCatalogContext()
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT)

  const shopCategories = useMemo<ShopCategory[]>(
    () =>
      shopCategoryArtwork.map((artwork) => {
        const live = findLiveCategory(categories, artwork.id, artwork.name)
        return {
          id: artwork.id,
          name: categoryName(t, artwork.id, artwork.name),
          image: artwork.image,
          href: categoryBrowsePath(live?.slug ?? artwork.id),
        }
      }),
    [categories, t],
  )

  return (
    <section
      aria-label={t('shop.categories.ariaLabel')}
      className="bg-background pb-6 pt-2 sm:pb-8 sm:pt-3 lg:pb-10"
    >
      <div className="container-content">
        {isDesktop ? (
          <CategoryGrid categories={shopCategories} />
        ) : (
          <CategoryCarousel
            categories={shopCategories}
            ariaLabel={t('shop.categories.ariaLabel')}
          />
        )}
      </div>
    </section>
  )
}
