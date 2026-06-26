import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { RatingDistribution } from './types'

interface RatingBarProps {
  item: RatingDistribution
}

export function RatingBar({ item }: RatingBarProps) {
  return (
    <div className="reviews-rating-bar">
      <span className="reviews-rating-bar-label">
        {item.stars}
        <Star size={12} className="fill-support-warning text-support-warning" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="reviews-rating-bar-track" aria-hidden>
        <motion.div
          className="reviews-rating-bar-fill"
          initial={{ width: 0 }}
          whileInView={{ width: `${item.percentage}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: (5 - item.stars) * 0.05 }}
        />
      </div>
      <span className="reviews-rating-bar-percent">{item.percentage}%</span>
    </div>
  )
}
