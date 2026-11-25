// src/components/landing/SkinConcernSection.tsx
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { ContentSection } from '../layout/ContentSection'
import { StripCarousel } from '../carousel/StripCarousel'
import { CategoryCard } from './CategoryCard'
import { useLandingCatalogContext } from '../../hooks/useLandingCatalogContext'
import { SectionHeader } from './SectionHeader'
import { cn } from '../../lib/cn'
import { FadeUp } from '../ui/FadeUp'

// Below this the six-up row squeezes cards under ~180px; the home page swipes instead of stacking.
const GRID_BREAKPOINT = '(min-width: 1200px)'
const COMPACT_TABLET_GRID_BREAKPOINT = '(min-width: 640px)'

function concernLabel(t: (key: string) => string, id: string, fallback: string) {
  const key = `home.skinConcerns.items.${id}`
  const translated = t(key)
  return translated === key ? fallback : translated
}

function ConcernSkeleton({ layout }: { layout: 'grid' | 'carousel' }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-medium bg-card',
        layout === 'carousel'
          ? 'aspect-[200/228] w-[min(200px,52vw)] shrink-0 sm:w-[220px]'
          : 'aspect-[200/228] min-w-0 w-full',
      )}
      aria-hidden
    />
  )
}

function ConcernGrid({ columns }: { columns: 3 | 6 }) {
  const { t } = useTranslation()
  const { skinConcerns, loading } = useLandingCatalogContext()

  return (
    <div className={cn('grid gap-4', columns === 6 ? 'grid-cols-6' : 'grid-cols-3')}>
      {loading
        ? Array.from({ length: 6 }).map((_, index) => (
            <ConcernSkeleton key={index} layout="grid" />
          ))
        : skinConcerns.map((concern, index) => (
            <FadeUp key={concern.id} className="min-w-0" delay={index * 0.06}>
              <CategoryCard
                name={concernLabel(t, concern.id, concern.name)}
                image={concern.image}
                href={concern.href}
                layout="grid"
              />
            </FadeUp>
          ))}
    </div>
  )
}

function ConcernCarousel() {
  const { t } = useTranslation()
  const { skinConcerns, loading } = useLandingCatalogContext()

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <ConcernSkeleton key={index} layout="carousel" />
        ))}
      </div>
    )
  }

  return (
    <StripCarousel
      items={skinConcerns}
      getItemKey={(concern) => concern.id}
      ariaLabel={t('home.skinConcerns.ariaLabel')}
      renderItem={(concern) => (
        <CategoryCard
          name={concernLabel(t, concern.id, concern.name)}
          image={concern.image}
          href={concern.href}
          layout="carousel"
        />
      )}
    />
  )
}

export interface SkinConcernSectionProps {
  title?: string
  subtitle?: string
  align?: 'left' | 'center'
  size?: 'default' | 'compact'
  className?: string
}

export function SkinConcernSection({
  title,
  subtitle,
  align = 'left',
  size = 'compact',
  className,
}: SkinConcernSectionProps) {
  const { t } = useTranslation()
  const isGrid = useMediaQuery(GRID_BREAKPOINT)
  const isTablet = useMediaQuery(COMPACT_TABLET_GRID_BREAKPOINT)
  const resolvedTitle = title ?? t('home.skinConcerns.titleCompact')
  const isDefault = size === 'default'

  return (
    <ContentSection
      aria-labelledby="skin-concerns-heading"
      className={className}
      padding={isDefault ? 'compact' : 'default'}
    >
      <FadeUp>
        <SectionHeader
          id="skin-concerns-heading"
          align={align}
          title={resolvedTitle}
          subtitle={subtitle}
          size={isDefault ? 'medium' : 'compact'}
        />
      </FadeUp>

      <FadeUp className={cn(isDefault && 'mt-6 sm:mt-8 lg:mt-10')} delay={0.1}>
        {isGrid ? (
          <ConcernGrid columns={6} />
        ) : !isDefault && isTablet ? (
          <ConcernGrid columns={3} />
        ) : (
          <ConcernCarousel />
        )}
      </FadeUp>
    </ContentSection>
  )
}
