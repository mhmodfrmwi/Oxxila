import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'
import '../../styles/questions-safety.css'

export interface FAQItem {
  question: string
  answer: string
}

export interface QuestionsSafetySectionProps {
  title?: string
  subtitle?: string
  buttonText?: string
  faqs?: FAQItem[]
  className?: string
  onAskSpecialist?: () => void
}

const DEFAULT_FAQS: FAQItem[] = []

export function QuestionsSafetySection({
  title = 'Questions & Safety',
  subtitle = 'Concerns regarding clinical usage and ingredient interactions.',
  buttonText = 'Ask a specialist',
  faqs = DEFAULT_FAQS,
  className,
  onAskSpecialist,
}: QuestionsSafetySectionProps) {
  const baseId = useId()
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section
      className={cn('questions-safety-section', className)}
      aria-labelledby={`${baseId}-title`}
    >
      <div className="questions-safety-grid">
        <div className="questions-safety-intro">
          <h2 id={`${baseId}-title`} className="questions-safety-title">
            {title}
          </h2>
          <p className="questions-safety-subtitle">{subtitle}</p>
          <Button
            type="button"
            variant="outline"
            pill
            className="questions-safety-cta"
            onClick={onAskSpecialist}
          >
            {buttonText}
          </Button>
        </div>

        <div className="questions-safety-faq" role="region" aria-label="Product safety questions">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            const triggerId = `${baseId}-trigger-${index}`
            const panelId = `${baseId}-panel-${index}`

            return (
              <article
                key={`${faq.question}-${index}`}
                className="questions-safety-item"
                data-open={isOpen}
              >
                <h3 className="m-0">
                  <button
                    id={triggerId}
                    type="button"
                    className="questions-safety-trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span className="questions-safety-question">{faq.question}</span>
                    <span className="questions-safety-chevron" aria-hidden>
                      <ChevronDown size={18} strokeWidth={1.75} className="questions-safety-chevron-icon" />
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="questions-safety-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <p className="questions-safety-answer">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
