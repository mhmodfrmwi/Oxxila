import { useTranslation } from 'react-i18next'
import { ABOUT_QUALITY_IDS, aboutQualityIcons } from './aboutData'

export function AboutQualitySection() {
  const { t } = useTranslation()

  return (
    <section className="container-content pb-8 sm:pb-10 lg:pb-14" aria-labelledby="about-quality-title">
      <div className="about-quality-panel">
        <header className="about-quality-panel__header">
          <h2 id="about-quality-title" className="about-quality-panel__title">
            {t('about.quality.title')}
          </h2>
          <p className="about-quality-panel__subtitle">{t('about.quality.subtitle')}</p>
        </header>

        <div className="about-quality-grid">
          {ABOUT_QUALITY_IDS.map((id) => {
            const Icon = aboutQualityIcons[id]
            return (
              <article key={id} className="about-quality-card">
                <div className="about-quality-card__icon" aria-hidden>
                  <Icon size={28} strokeWidth={1.75} />
                </div>
                <h3 className="about-quality-card__title">{t(`about.quality.items.${id}.title`)}</h3>
                <p className="about-quality-card__description">
                  {t(`about.quality.items.${id}.description`)}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
