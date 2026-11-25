// src/components/landing/footer/FooterLinks.tsx
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import chevronIcon from '../../../assets/footer/chevron-down.svg'
import { cn } from '../../../lib/cn'
import { MaskIcon } from '../../ui/MaskIcon'

interface FooterLinkItem {
  label: string
  to: string
}

interface FooterLinksProps {
  title: string
  links: readonly FooterLinkItem[]
  className?: string
}

export function FooterLinks({ title, links, className }: FooterLinksProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className={cn('max-md:border-b-[0.5px] max-md:border-border-interactive', className)}>
      <h3>
        <button
          type="button"
          className="landing-text-large flex w-full items-center justify-between p-4 text-start text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-button-primary md:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          {title}
          <MaskIcon
            src={chevronIcon}
            width={7.29289}
            height={13.5}
            frame={24}
            className={cn(
              'text-icon-primary transition-transform duration-300 motion-reduce:transition-none',
              open ? 'rotate-90' : '-rotate-90',
            )}
          />
        </button>
        <span className="landing-text-large hidden text-primary-text md:block">{title}</span>
      </h3>

      <div id={panelId} className="footer-accordion-panel md:block" data-open={open}>
        <div className="min-h-0 overflow-hidden md:overflow-visible">
          <ul
            className={cn(
              'flex flex-col gap-3 px-4 pb-5 transition-[visibility] duration-300 md:visible md:mt-8 md:gap-[17px] md:px-0 md:pb-0',
              !open && 'max-md:invisible',
            )}
          >
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className={cn(
                    'landing-text-small lg:landing-text-xs inline-block text-secondary-text',
                    'transition-[color,translate] duration-300 ease-out hover:text-primary-text',
                    'motion-safe:hover:translate-x-1 motion-safe:rtl:hover:-translate-x-1',
                    'focus-visible:text-primary-text focus-visible:underline focus-visible:outline-none',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
