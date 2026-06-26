import { shopPromotions } from './moreReasonsData'
import { PromotionCard } from './PromotionCard'
import { ContentSection } from '../layout/ContentSection'
import { SectionHeader } from '../landing/SectionHeader'

export function MoreReasonsSection() {
  return (
    <ContentSection aria-labelledby="more-reasons-heading">
      <SectionHeader id="more-reasons-heading" title="More reasons to shop" size="compact" />

      <div
        className={[
          'grid grid-cols-1 gap-5',
          'md:grid-cols-2 md:gap-5',
          'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.38fr)]',
          'lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]',
          'lg:gap-6',
          'lg:min-h-[min(42vw,560px)]',
        ].join(' ')}
      >
        {shopPromotions.map((promotion) => (
          <PromotionCard
            key={promotion.id}
            promotion={promotion}
            className={[
              promotion.gridClassName,
              promotion.layout === 'tall' && 'md:col-span-2 md:row-span-2 lg:col-span-1',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>
    </ContentSection>
  )
}
