import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heading } from '../../ui/Heading'

interface FooterLinkItem {
  label: string
  to: string
}

interface FooterLinksProps {
  title: string
  links: readonly FooterLinkItem[]
  variant?: 'slide' | 'underline'
}

export function FooterLinks({ title, links, variant = 'slide' }: FooterLinksProps) {
  return (
    <div>
      <Heading variant="card">{title}</Heading>
      <ul className="mt-4 space-y-3 sm:space-y-3.5">
        {links.map((link) => (
          <li key={link.label}>
            <motion.div whileHover={variant === 'slide' ? { x: 4 } : undefined}>
              <Link
                to={link.to}
                className={[
                  'inline-block text-sm text-secondary-text transition-colors duration-300',
                  variant === 'underline'
                    ? 'hover:text-accent-soft hover:underline hover:underline-offset-4'
                    : 'hover:text-accent-soft',
                ].join(' ')}
              >
                {link.label}
              </Link>
            </motion.div>
          </li>
        ))}
      </ul>
    </div>
  )
}
