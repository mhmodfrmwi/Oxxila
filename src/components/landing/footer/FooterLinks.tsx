import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

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
      <h3 className="font-serif text-lg font-medium text-[#1A1A1A] dark:text-[#F5F5F5]">
        {title}
      </h3>
      <ul className="mt-4 space-y-3 sm:space-y-3.5">
        {links.map((link) => (
          <li key={link.label}>
            <motion.div whileHover={variant === 'slide' ? { x: 4 } : undefined}>
              <Link
                to={link.to}
                className={[
                  'inline-block text-sm text-[#6B7280] transition-colors duration-300 dark:text-[#A1A1AA]',
                  variant === 'underline'
                    ? 'hover:text-[#8B7CF8] hover:underline hover:underline-offset-4 dark:hover:text-[#A78BFA]'
                    : 'hover:text-[#8B7CF8] dark:hover:text-[#A78BFA]',
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
