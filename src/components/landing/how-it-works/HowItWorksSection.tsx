// src/components/landing/how-it-works/HowItWorksSection.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import playIcon from '../../../assets/landing/home/play.svg'
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
      <section className="bg-background py-12 sm:py-16 lg:py-20">
        <div className="container-content flex flex-col gap-6 lg:gap-8">
          <FadeUp>
            <SectionHeader title={data.title} align="center" />
          </FadeUp>

          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,740fr)_minmax(0,524fr)]">
            <FadeUp delay={0.1}>
              {loading ? (
                <div
                  className="aspect-[359/256] w-full animate-pulse rounded-[32px] bg-card lg:aspect-[740/461] lg:rounded-large"
                  aria-hidden
                />
              ) : (
                <button
                  type="button"
                  className="group relative block aspect-[359/256] w-full overflow-hidden rounded-[32px] text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:aspect-[740/461] lg:rounded-large"
                  onClick={() => setIsVideoOpen(true)}
                  aria-label={t('home.howItWorks.playVideo')}
                >
                  <img
                    src={data.thumbnailImage}
                    alt={t('home.howItWorks.thumbAlt')}
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
                    loading="lazy"
                  />
                  <img
                    src={playIcon}
                    alt=""
                    width={100}
                    height={100}
                    className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out group-hover:scale-110 motion-reduce:transition-none sm:size-[100px]"
                    aria-hidden
                  />
                </button>
              )}
            </FadeUp>

            <FadeUp delay={0.2}>
              {loading ? (
                <div className="flex flex-col gap-4" aria-hidden>
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="h-[104px] animate-pulse rounded-[32px] bg-card lg:rounded-large"
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
