// src/components/about/AboutMedicalSection.tsx
import { useTranslation } from 'react-i18next'
import { Heading } from '../ui/Heading'
import type { AboutTextItem } from '../../utils/aboutCopy'
import {
  ABOUT_MEDICAL_IDS,
  aboutMedicalIcons,
  aboutSphereImage,
  type AboutMedicalId,
} from './aboutData'

interface AboutMedicalSectionProps {
  title?: string | null
  subtitle?: string | null
  cards?: AboutTextItem[] | null
}

export function AboutMedicalSection({
  title,
  subtitle,
  cards,
}: AboutMedicalSectionProps = {}) {
  const { t } = useTranslation()
  const resolvedCards: Array<AboutTextItem & { id: AboutMedicalId }> =
    cards && cards.length > 0
      ? ABOUT_MEDICAL_IDS.map((id, index) => ({
          id,
          title: cards[index]?.title || t(`about.medical.items.${id}.title`),
          description:
            cards[index]?.description || t(`about.medical.items.${id}.description`),
        }))
      : ABOUT_MEDICAL_IDS.map((id) => ({
          id,
          title: t(`about.medical.items.${id}.title`),
          description: t(`about.medical.items.${id}.description`),
        }))

  return (
    <section
      id="medical"
      className="container-content scroll-mt-24 pb-8 sm:pb-10 lg:pb-14"
      aria-labelledby="about-medical-title"
    >
      <div className="about-medical-grid">
        <div className="about-medical-visual">
          <img
            src={aboutSphereImage}
            alt={t('about.medical.imageAlt')}
            className="about-medical-visual__image"
            loading="lazy"
          />
        </div>

        <div>
          <Heading variant="section-compact" id="about-medical-title">
            {title?.trim() || t('about.medical.title')}
          </Heading>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-secondary-text md:text-base">
            {subtitle?.trim() || t('about.medical.subtitle')}
          </p>

          <ul className="about-medical-list">
            {resolvedCards.map((card) => {
              const Icon = aboutMedicalIcons[card.id]
              return (
                <li key={card.id} className="about-medical-item">
                  <div className="about-medical-item__icon" aria-hidden>
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="about-medical-item__title">{card.title}</h3>
                    <p className="about-medical-item__description">{card.description}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
