import { ChevronDown, LogOut, ShoppingBag, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { HOME_PATH } from '../../config/routes'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Logo } from '../ui/Logo'

const navLinks = [
  { label: 'Home', to: HOME_PATH },
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
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { isAuthenticated, logout } = useAuth()
  const isDark = theme === 'dark'
  const [menuOpen, setMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  async function handleLogout() {
    if (authLoading) return

    setAuthLoading(true)

    try {
      await logout()
      setMenuOpen(false)
      navigate(HOME_PATH, { replace: true })
    } finally {
      setAuthLoading(false)
    }
  }

  const authActionClass = [
    'inline-flex min-h-11 items-center gap-2 rounded px-2 text-sm font-medium sm:px-3',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxxila-purple',
    isDark
      ? 'text-text-secondary-dark hover:text-text-primary-dark'
      : 'text-text-secondary-light hover:text-text-primary-light',
    authLoading ? 'pointer-events-none opacity-60' : '',
  ].join(' ')

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
        className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:px-6 lg:py-4"
        aria-label="Main navigation"
      >
        <button
          type="button"
          className={[
            'flex min-h-11 min-w-11 items-center justify-center rounded-lg md:hidden',
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

        <div className="flex min-w-0 flex-1 items-center justify-center md:flex-none">
          <Logo />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <button
            type="button"
            className={[
              'flex min-h-11 min-w-11 items-center justify-center rounded-full transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxxila-purple',
              isDark
                ? 'text-text-primary-dark hover:bg-input-dark'
                : 'text-text-primary-light hover:bg-input-light',
            ].join(' ')}
            aria-label="Shopping bag"
          >
            <ShoppingBag size={20} aria-hidden />
          </button>
          {isAuthenticated ? (
            <button
              type="button"
              className={authActionClass}
              onClick={() => void handleLogout()}
              disabled={authLoading}
              aria-busy={authLoading}
            >
              <LogOut size={18} aria-hidden />
              <span className="hidden leading-tight sm:inline">
                {authLoading ? 'Logging out...' : 'Log out'}
              </span>
            </button>
          ) : (
            <NavLink to="/login" className={authActionClass}>
              <User size={18} aria-hidden />
              <span className="hidden leading-tight sm:inline">
                Sign in / Register
                <span className="hidden xl:inline"> Account</span>
              </span>
            </NavLink>
          )}
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
              <li className="pt-2">
                {isAuthenticated ? (
                  <button
                    type="button"
                    className={[
                      'flex w-full items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors',
                      isDark
                        ? 'text-text-primary-dark hover:bg-input-dark'
                        : 'text-text-primary-light hover:bg-input-light',
                      authLoading ? 'pointer-events-none opacity-60' : '',
                    ].join(' ')}
                    onClick={() => void handleLogout()}
                    disabled={authLoading}
                    aria-busy={authLoading}
                  >
                    <LogOut size={18} aria-hidden />
                    {authLoading ? 'Logging out...' : 'Log out'}
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    className={mobileLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <User size={18} aria-hidden />
                      Sign in / Register
                    </span>
                  </NavLink>
                )}
              </li>
            </ul>
          </div>
        </>
      )}
    </header>
  )
}
