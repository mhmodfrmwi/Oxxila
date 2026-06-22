import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface ContactInfoCardProps {
  icon: LucideIcon
  label: string
  value: string
  href?: string
  delay?: number
}

export function ContactInfoCard({ icon: Icon, label, value, href, delay = 0 }: ContactInfoCardProps) {
  const content = (
    <>
      <span
        className={[
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border',
          'border-accent-soft/30 text-accent-soft',
          'transition-colors duration-300 group-hover:border-accent-soft group-hover:bg-accent-soft/10',
        ].join(' ')}
        aria-hidden
      >
        <Icon size={20} strokeWidth={1.5} />
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-sm font-medium text-accent-soft">{label}</span>
        <span className="mt-0.5 block text-sm text-primary-text sm:text-base">{value}</span>
      </span>
    </>
  )

  const className = [
    'group flex items-center gap-4 rounded-2xl p-3 transition-all duration-300',
    'hover:-translate-y-0.5 hover:bg-card/60',
  ].join(' ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay }}
    >
      {href ? (
        <a href={href} className={className}>
          {content}
        </a>
      ) : (
        <div className={className}>{content}</div>
      )}
    </motion.div>
  )
}
