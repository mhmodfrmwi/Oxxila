import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface FadeUpProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
}

export function FadeUp({ children, delay = 0, className = '', ...props }: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
