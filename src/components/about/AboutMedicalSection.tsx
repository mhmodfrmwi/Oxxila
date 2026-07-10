import { useTranslation } from 'react-i18next'
import { Heading } from '../ui/Heading'
import { ABOUT_MEDICAL_IDS, aboutMedicalIcons, aboutSphereImage } from './aboutData'

export function AboutMedicalSection() {
  const { t } = useTranslation()

  return (
    <section className="container-content pb-8 sm:pb-10 lg:pb-14" aria-labelledby="about-medical-title">
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
            {t('about.medical.title')}
          </Heading>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-secondary-text md:text-base">
            {t('about.medical.subtitle')}
          </p>

          <ul className="about-medical-list">
            {ABOUT_MEDICAL_IDS.map((id) => {
              const Icon = aboutMedicalIcons[id]
              return (
                <li key={id} className="about-medical-item">
                  <div className="about-medical-item__icon" aria-hidden>
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="about-medical-item__title">{t(`about.medical.items.${id}.title`)}</h3>
                    <p className="about-medical-item__description">
                      {t(`about.medical.items.${id}.description`)}
                    </p>
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
