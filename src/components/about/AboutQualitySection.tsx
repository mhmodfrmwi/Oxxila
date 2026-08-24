// src/components/about/AboutQualitySection.tsx
import { useTranslation } from 'react-i18next'
import type { AboutTextItem } from '../../utils/aboutCopy'
import {
  ABOUT_QUALITY_IDS,
  aboutQualityIcons,
  type AboutQualityId,
} from './aboutData'

interface AboutQualitySectionProps {
  title?: string | null
  subtitle?: string | null
  cards?: AboutTextItem[] | null
}

export function AboutQualitySection({
  title,
  subtitle,
  cards,
}: AboutQualitySectionProps = {}) {
  const { t } = useTranslation()
  const resolvedCards: Array<AboutTextItem & { id: AboutQualityId }> =
    cards && cards.length > 0
      ? ABOUT_QUALITY_IDS.map((id, index) => ({
          id,
          title: cards[index]?.title || t(`about.quality.items.${id}.title`),
          description:
            cards[index]?.description || t(`about.quality.items.${id}.description`),
        }))
      : ABOUT_QUALITY_IDS.map((id) => ({
          id,
          title: t(`about.quality.items.${id}.title`),
          description: t(`about.quality.items.${id}.description`),
        }))

  return (
    <section
      id="quality"
      className="container-content scroll-mt-24 pb-8 sm:pb-10 lg:pb-14"
      aria-labelledby="about-quality-title"
    >
      <div className="about-quality-panel">
        <header className="about-quality-panel__header">
          <h2 id="about-quality-title" className="about-quality-panel__title">
            {title?.trim() || t('about.quality.title')}
          </h2>
          <p className="about-quality-panel__subtitle">
            {subtitle?.trim() || t('about.quality.subtitle')}
          </p>
        </header>

        <div className="about-quality-grid">
          {resolvedCards.map((card) => {
            const Icon = aboutQualityIcons[card.id]
            return (
              <article key={card.id} className="about-quality-card">
                <div className="about-quality-card__icon" aria-hidden>
                  <Icon size={28} strokeWidth={1.75} />
                </div>
                <h3 className="about-quality-card__title">{card.title}</h3>
                <p className="about-quality-card__description">{card.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
