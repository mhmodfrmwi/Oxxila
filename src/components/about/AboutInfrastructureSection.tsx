import { useTranslation } from 'react-i18next'
import { Heading } from '../ui/Heading'
import { ABOUT_INFRASTRUCTURE_IDS, aboutInfrastructureIcons } from './aboutData'

export function AboutInfrastructureSection() {
  const { t } = useTranslation()

  return (
    <section className="container-content pb-8 sm:pb-10 lg:pb-14" aria-labelledby="about-infrastructure-title">
      <header className="about-infrastructure-header">
        <Heading variant="section-compact" id="about-infrastructure-title">
          {t('about.infrastructure.title')}
        </Heading>
      </header>

      <div className="about-infrastructure-grid">
        {ABOUT_INFRASTRUCTURE_IDS.map((id) => {
          const Icon = aboutInfrastructureIcons[id]
          return (
            <article key={id} className="about-infrastructure-card">
              <div className="about-infrastructure-card__icon-wrap" aria-hidden>
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="about-infrastructure-card__title">
                  {t(`about.infrastructure.items.${id}.title`)}
                </h3>
                <p className="about-infrastructure-card__description">
                  {t(`about.infrastructure.items.${id}.description`)}
                </p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
