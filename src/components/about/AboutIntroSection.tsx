// src/components/about/AboutIntroSection.tsx
import { useTranslation } from 'react-i18next'
import { Heading } from '../ui/Heading'
import type { AboutTextItem } from '../../utils/aboutCopy'
import {
  ABOUT_INTRO_CARD_IDS,
  aboutIntroIcons,
  type AboutIntroCardId,
} from './aboutData'

interface AboutIntroSectionProps {
  eyebrow?: string | null
  title?: string | null
  paragraphs?: string[] | null
  cards?: AboutTextItem[] | null
}

export function AboutIntroSection({
  eyebrow,
  title,
  paragraphs,
  cards,
}: AboutIntroSectionProps = {}) {
  const { t } = useTranslation()
  const resolvedParagraphs =
    paragraphs?.filter((item) => item.trim()).length
      ? paragraphs.filter((item) => item.trim())
      : [t('about.intro.paragraph1'), t('about.intro.paragraph2')]

  const resolvedCards: Array<AboutTextItem & { id: AboutIntroCardId }> =
    cards && cards.length > 0
      ? ABOUT_INTRO_CARD_IDS.map((id, index) => ({
          id,
          title: cards[index]?.title || t(`about.intro.cards.${id}.title`),
          description:
            cards[index]?.description || t(`about.intro.cards.${id}.description`),
        }))
      : ABOUT_INTRO_CARD_IDS.map((id) => ({
          id,
          title: t(`about.intro.cards.${id}.title`),
          description: t(`about.intro.cards.${id}.description`),
        }))

  return (
    <section className="container-content pb-8 sm:pb-10 lg:pb-14" aria-labelledby="about-intro-title">
      <div className="about-intro-grid">
        <div className="about-intro-copy">
          <span className="about-eyebrow">{eyebrow?.trim() || t('about.intro.eyebrow')}</span>
          <Heading variant="section-compact" id="about-intro-title" className="mb-4">
            {title?.trim() || t('about.intro.title')}
          </Heading>
          {resolvedParagraphs.map((paragraph, index) => (
            <p key={`intro-p-${index}`}>{paragraph}</p>
          ))}
        </div>

        <div className="about-intro-cards">
          {resolvedCards.map((card) => {
            const Icon = aboutIntroIcons[card.id]
            return (
              <article key={card.id} className="about-feature-card">
                <div className="about-feature-card__icon" aria-hidden>
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h3 className="about-feature-card__title">{card.title}</h3>
                <p className="about-feature-card__description">{card.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
