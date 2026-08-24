// src/components/about/AboutHeroSection.tsx
import { useTranslation } from 'react-i18next'
import { aboutHeroImage } from './aboutData'

/** Static docs hero — copy and image are not CMS-driven. */
export function AboutHeroSection() {
  const { t } = useTranslation()

  return (
    <section className="container-content py-6 sm:py-8 lg:py-10" aria-labelledby="about-hero-title">
      <div className="about-hero">
        <div className="about-hero__media" aria-hidden>
          <img
            src={aboutHeroImage}
            alt=""
            className="about-hero__image"
            loading="eager"
            fetchPriority="high"
          />
          <div className="about-hero__overlay" />
        </div>

        <div className="about-hero__content">
          <h1 id="about-hero-title" className="about-hero__title">
            {t('about.hero.title')}
          </h1>
          <p className="about-hero__subtitle">{t('about.hero.subtitle')}</p>
        </div>
      </div>
    </section>
  )
}
