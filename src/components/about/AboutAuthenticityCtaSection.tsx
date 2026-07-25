import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import oxxilaLogo from '../../assets/Oxxila.svg'
import { DOCS_PATH } from '../../config/routes'
import { Button } from '../ui/Button'

export function AboutAuthenticityCtaSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section className="container-content pb-10 sm:pb-12 lg:pb-16" aria-labelledby="about-cta-title">
      <div className="about-cta-panel">
        <img
          src={oxxilaLogo}
          alt=""
          aria-hidden
          className="about-cta-panel__watermark"
        />

        <div className="about-cta-panel__content">
          <h2 id="about-cta-title" className="about-cta-panel__title">
            {t('about.cta.title')}
          </h2>
          <p className="about-cta-panel__description">{t('about.cta.description')}</p>
          <div className="about-cta-panel__button">
            <Button
              type="button"
              variant="primary"
              pill
              className="min-w-[12rem] px-8"
              onClick={() => {
                const target = document.getElementById('about-quality-title')
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  return
                }
                navigate(`${DOCS_PATH}#about-quality-title`)
              }}
            >
              {t('about.cta.button')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
