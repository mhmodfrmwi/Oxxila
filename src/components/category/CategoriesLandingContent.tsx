// src/components/category/CategoriesLandingContent.tsx
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { HOME_PATH } from '../../config/routes'
import { useLandingCatalogContext } from '../../hooks/useLandingCatalogContext'
import { catalogDisplayName } from '../../utils/catalogDisplayName'
import { categoryBrowsePath } from '../../utils/categoryBrowseParams'
import { resolveProductImageUrl } from '../../utils/productImage'
import { Footer } from '../landing/footer/Footer'
import { Breadcrumb } from '../ui/Breadcrumb'
import { Heading } from '../ui/Heading'
import { cn } from '../../lib/cn'
import { cardHoverLiftClasses, focusRingClasses } from '../ui/interactionStyles'

export function CategoriesLandingContent() {
  const { t, i18n } = useTranslation()
  const { categories, loading, error } = useLandingCatalogContext()
  const activeCategories = categories.filter((category) => category.isActive !== false)

  return (
    <>
      <div className="container-content pb-8 sm:pb-10">
        <Breadcrumb
          className="mb-5 sm:mb-6"
          items={[
            { label: t('breadcrumb.home'), href: HOME_PATH },
            { label: t('breadcrumb.categories') },
          ]}
        />

        <header className="mb-6 sm:mb-8">
          <Heading variant="page">{t('categoriesLanding.title')}</Heading>
          <p className="mt-2 text-sm text-secondary-text">
            {t('categoriesLanding.subtitle')}
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 min-[769px]:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[4/5] animate-pulse rounded-[20px] bg-surface-muted"
                aria-hidden
              />
            ))}
          </div>
        ) : error ? (
          <p className="py-12 text-center text-sm text-support-error" role="alert">
            {error}
          </p>
        ) : activeCategories.length === 0 ? (
          <p className="py-12 text-center text-sm text-secondary-text" role="status">
            {t('categoriesLanding.noCategories')}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 min-[769px]:grid-cols-3 xl:grid-cols-4 xl:gap-5">
            {activeCategories.map((category) => (
              <li key={category._id}>
                <Link
                  to={categoryBrowsePath(category.slug)}
                  className={cn(
                    'group flex h-full flex-col overflow-hidden rounded-[20px] border border-border-subtle bg-card',
                    cardHoverLiftClasses,
                    focusRingClasses,
                  )}
                >
                  <div className="aspect-[4/5] overflow-hidden bg-surface-muted">
                    <img
                      src={resolveProductImageUrl(category.image)}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-4 py-3">
                    <h2 className="font-serif text-sm font-medium text-primary-text sm:text-base">
                      {catalogDisplayName(
                        category,
                        i18n.resolvedLanguage ?? i18n.language,
                        'category',
                      )}
                    </h2>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </>
  )
}
