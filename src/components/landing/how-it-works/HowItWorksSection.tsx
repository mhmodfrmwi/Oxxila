// src/components/landing/how-it-works/HowItWorksSection.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHowItWorksSettings } from '../../../hooks/useHowItWorksSettings'
import { resolveVideoEmbed } from '../../../utils/videoEmbed'
import { FadeUp } from '../../ui/FadeUp'
import { SectionHeader } from '../SectionHeader'
import { HowItWorksAccordion } from './HowItWorksAccordion'

export function HowItWorksSection() {
  const { t } = useTranslation()
  const { data, loading } = useHowItWorksSettings()
  const [openStepId, setOpenStepId] = useState('')
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  useEffect(() => {
    if (data.steps[0]?.id) {
      setOpenStepId((current) =>
        data.steps.some((step) => step.id === current) ? current : data.steps[0].id,
      )
    }
  }, [data.steps])

  const videoEmbed = resolveVideoEmbed(data.videoUrl)

  return (
    <>
      <section className="bg-background py-10 sm:py-14 lg:py-20">
        <div className="container-content">
          <FadeUp>
            <SectionHeader title={data.title} align="center" />
          </FadeUp>

          <div className="mt-8 grid items-start gap-8 min-[769px]:mt-12 min-[769px]:grid-cols-2 min-[769px]:items-center min-[769px]:gap-10 lg:mt-14 lg:gap-14">
            <FadeUp delay={0.1}>
              {loading ? (
                <div
                  className="aspect-[4/3] w-full animate-pulse rounded-3xl bg-surface-muted/70 dark:bg-surface-subtle/40 sm:aspect-[16/11]"
                  aria-hidden
                />
              ) : (
                <button
                  type="button"
                  className="group relative block w-full overflow-hidden rounded-3xl text-start"
                  onClick={() => setIsVideoOpen(true)}
                  aria-label={t('home.howItWorks.playVideo')}
                >
                  <img
                    src={data.thumbnailImage}
                    alt={t('home.howItWorks.thumbAlt')}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 sm:aspect-[16/11]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/15 dark:bg-black/25 dark:group-hover:bg-black/35" />

                  <span
                    className={[
                      'absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full',
                      'border border-white/30 bg-white/25 text-white backdrop-blur-md',
                      'transition-transform duration-300 ease-out group-hover:scale-110',
                      'dark:border-on-emphasis/20 dark:bg-on-emphasis/10',
                    ].join(' ')}
                    aria-hidden
                  >
                    <Play size={28} className="ms-1 fill-white" />
                  </span>
                </button>
              )}
            </FadeUp>

            <FadeUp delay={0.2}>
              {loading ? (
                <div className="space-y-4" aria-hidden>
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="h-[4.5rem] animate-pulse rounded-3xl bg-surface-muted/70 dark:bg-surface-subtle/40"
                    />
                  ))}
                </div>
              ) : (
                <HowItWorksAccordion
                  steps={data.steps}
                  openId={openStepId}
                  onOpenChange={setOpenStepId}
                />
              )}
            </FadeUp>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={t('home.howItWorks.videoDialog')}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label={t('home.howItWorks.closeVideo')}
              onClick={() => setIsVideoOpen(false)}
            />

            <motion.div
              className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-surface-subtle shadow-2xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                className="absolute end-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label={t('home.howItWorks.close')}
                onClick={() => setIsVideoOpen(false)}
              >
                <X size={20} />
              </button>

              {videoEmbed?.kind === 'iframe' ? (
                <div className="aspect-video bg-black">
                  <iframe
                    src={videoEmbed.src}
                    title={t('home.howItWorks.videoDialog')}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : videoEmbed?.kind === 'video' ? (
                <div className="aspect-video bg-black">
                  <video
                    src={videoEmbed.src}
                    className="h-full w-full"
                    controls
                    autoPlay
                    playsInline
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-black/40 p-8 text-center">
                  <p className="text-sm text-white/80 sm:text-base">
                    {t('home.howItWorks.videoPlaceholder')}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
