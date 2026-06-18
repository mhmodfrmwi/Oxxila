import { AnimatePresence, motion } from 'framer-motion'
import { Play, X } from 'lucide-react'
import { useState } from 'react'
import { FadeUp } from '../../ui/FadeUp'
import { howItWorksThumb } from '../landingData'
import { HowItWorksAccordion } from './HowItWorksAccordion'

export function HowItWorksSection() {
  const [openStepId, setOpenStepId] = useState('concern')
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <>
      <section className="bg-[#F7F7FB] py-10 sm:py-14 lg:py-20 dark:bg-page-dark">
        <div className="mx-auto max-w-[1340px] px-4 sm:px-5 lg:px-6">
          <FadeUp className="text-center">
            <h2 className="font-serif text-3xl font-medium text-[#1A1A1A] md:text-4xl lg:text-5xl dark:text-[#F5F5F5]">
              How it works
            </h2>
          </FadeUp>

          <div className="mt-8 grid items-start gap-8 min-[769px]:mt-12 min-[769px]:grid-cols-2 min-[769px]:items-center min-[769px]:gap-10 lg:mt-14 lg:gap-14">
            <FadeUp delay={0.1}>
              <button
                type="button"
                className="group relative block w-full overflow-hidden rounded-3xl text-left"
                onClick={() => setIsVideoOpen(true)}
                aria-label="Play how it works video"
              >
                <img
                  src={howItWorksThumb}
                  alt="Hands applying skincare cream"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 sm:aspect-[16/11]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/15 dark:bg-black/25 dark:group-hover:bg-black/35" />

                <span
                  className={[
                    'absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full',
                    'border border-white/30 bg-white/25 text-white backdrop-blur-md',
                    'transition-transform duration-300 ease-out group-hover:scale-110',
                    'dark:border-white/20 dark:bg-white/10',
                  ].join(' ')}
                  aria-hidden
                >
                  <Play size={28} className="ml-1 fill-white" />
                </span>
              </button>
            </FadeUp>

            <FadeUp delay={0.2}>
              <HowItWorksAccordion openId={openStepId} onOpenChange={setOpenStepId} />
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
            aria-label="Product video"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close video"
              onClick={() => setIsVideoOpen(false)}
            />

            <motion.div
              className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-[#171B2E] shadow-2xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Close"
                onClick={() => setIsVideoOpen(false)}
              >
                <X size={20} />
              </button>

              <div className="flex aspect-video items-center justify-center bg-black/40 p-8 text-center">
                <p className="text-sm text-white/80 sm:text-base">
                  Video player placeholder — embed your product walkthrough here.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
