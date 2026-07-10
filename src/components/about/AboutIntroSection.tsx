import { useTranslation } from 'react-i18next'
import { Heading } from '../ui/Heading'
import { ABOUT_INTRO_CARD_IDS, aboutIntroIcons } from './aboutData'

export function AboutIntroSection() {
  const { t } = useTranslation()

  return (
    <section className="container-content pb-8 sm:pb-10 lg:pb-14" aria-labelledby="about-intro-title">
      <div className="about-intro-grid">
        <div className="about-intro-copy">
          <span className="about-eyebrow">{t('about.intro.eyebrow')}</span>
          <Heading variant="section-compact" id="about-intro-title" className="mb-4">
            {t('about.intro.title')}
          </Heading>
          <p>{t('about.intro.paragraph1')}</p>
          <p>{t('about.intro.paragraph2')}</p>
        </div>

        <div className="about-intro-cards">
          {ABOUT_INTRO_CARD_IDS.map((id) => {
            const Icon = aboutIntroIcons[id]
            return (
              <article key={id} className="about-feature-card">
                <div className="about-feature-card__icon" aria-hidden>
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h3 className="about-feature-card__title">{t(`about.intro.cards.${id}.title`)}</h3>
                <p className="about-feature-card__description">
                  {t(`about.intro.cards.${id}.description`)}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
