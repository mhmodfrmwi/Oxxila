// src/components/about/AboutInfrastructureSection.tsx
import { useTranslation } from 'react-i18next'
import { Heading } from '../ui/Heading'
import type { AboutTextItem } from '../../utils/aboutCopy'
import {
  ABOUT_INFRASTRUCTURE_IDS,
  aboutInfrastructureIcons,
  type AboutInfrastructureId,
} from './aboutData'

interface AboutInfrastructureSectionProps {
  title?: string | null
  cards?: AboutTextItem[] | null
}

export function AboutInfrastructureSection({
  title,
  cards,
}: AboutInfrastructureSectionProps = {}) {
  const { t } = useTranslation()
  const resolvedCards: Array<AboutTextItem & { id: AboutInfrastructureId }> =
    cards && cards.length > 0
      ? ABOUT_INFRASTRUCTURE_IDS.map((id, index) => ({
          id,
          title: cards[index]?.title || t(`about.infrastructure.items.${id}.title`),
          description:
            cards[index]?.description ||
            t(`about.infrastructure.items.${id}.description`),
        }))
      : ABOUT_INFRASTRUCTURE_IDS.map((id) => ({
          id,
          title: t(`about.infrastructure.items.${id}.title`),
          description: t(`about.infrastructure.items.${id}.description`),
        }))

  return (
    <section
      className="container-content pb-8 sm:pb-10 lg:pb-14"
      aria-labelledby="about-infrastructure-title"
    >
      <header className="about-infrastructure-header">
        <Heading variant="section-compact" id="about-infrastructure-title">
          {title?.trim() || t('about.infrastructure.title')}
        </Heading>
      </header>

      <div className="about-infrastructure-grid">
        {resolvedCards.map((card) => {
          const Icon = aboutInfrastructureIcons[card.id]
          return (
            <article key={card.id} className="about-infrastructure-card">
              <div className="about-infrastructure-card__icon-wrap" aria-hidden>
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="about-infrastructure-card__title">{card.title}</h3>
                <p className="about-infrastructure-card__description">{card.description}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
