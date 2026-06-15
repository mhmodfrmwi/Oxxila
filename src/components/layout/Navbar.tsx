import { ChevronDown, ShoppingBag, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { Logo } from '../ui/Logo'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Categories', to: '/categories', hasChevron: true },
  { label: 'Docs', to: '/docs' },
]

function BurgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 18H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Navbar() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'inline-flex items-center gap-1 text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxxila-purple rounded',
      isActive
        ? 'text-oxxila-purple underline decoration-oxxila-purple underline-offset-4'
        : isDark
          ? 'text-text-secondary-dark hover:text-text-primary-dark'
          : 'text-text-secondary-light hover:text-text-primary-light',
    ].join(' ')

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'block rounded-xl px-4 py-3 text-base font-medium transition-colors',
      isActive
        ? 'bg-oxxila-accent/10 text-oxxila-accent'
        : isDark
          ? 'text-text-primary-dark hover:bg-input-dark'
          : 'text-text-primary-light hover:bg-input-light',
    ].join(' ')

  return (
    <header
      className={[
        'relative z-40 border-b',
        isDark ? 'border-border-dark bg-page-dark' : 'border-border-light bg-card-light',
      ].join(' ')}
    >
      <nav
        className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4 lg:px-6"
        aria-label="Main navigation"
      >
        <button
          type="button"
          className={[
            'rounded-lg p-2 md:hidden',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxxila-purple',
            isDark
              ? 'text-text-primary-dark hover:bg-input-dark'
              : 'text-text-primary-light hover:bg-input-light',
          ].join(' ')}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <BurgerIcon />}
        </button>

        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClass}>
                {link.label}
                {link.hasChevron && <ChevronDown size={14} aria-hidden />}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex flex-1 justify-center md:flex-none">
          <Logo />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            className={[
              'rounded-full p-2 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxxila-purple',
              isDark
                ? 'text-text-primary-dark hover:bg-input-dark'
                : 'text-text-primary-light hover:bg-input-light',
            ].join(' ')}
            aria-label="Shopping bag"
          >
            <ShoppingBag size={20} aria-hidden />
          </button>
          <NavLink
            to="/login"
            className={[
              'inline-flex items-center gap-2 text-sm font-medium',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxxila-purple rounded',
              isDark
                ? 'text-text-secondary-dark hover:text-text-primary-dark'
                : 'text-text-secondary-light hover:text-text-primary-light',
            ].join(' ')}
          >
            <User size={18} aria-hidden />
            <span className="hidden leading-tight sm:inline">
              Sign in / Register
              <span className="hidden lg:block"> Account</span>
            </span>
          </NavLink>
        </div>
      </nav>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-label="Close menu overlay"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className={[
              'fixed inset-y-0 left-0 z-50 w-[min(320px,85vw)] border-r p-5 shadow-xl md:hidden',
              isDark
                ? 'border-border-dark bg-card-dark'
                : 'border-border-light bg-card-light',
            ].join(' ')}
          >
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                className="rounded-lg p-2"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X size={22} />
              </button>
            </div>
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={mobileLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {link.label}
                      {link.hasChevron && <ChevronDown size={14} aria-hidden />}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </header>
  )
}
