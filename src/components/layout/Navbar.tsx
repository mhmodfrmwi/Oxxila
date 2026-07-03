import { ChevronDown, LogOut, ShoppingBag, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { HOME_PATH, SHOP_PATH, CATEGORIES_PATH } from '../../config/routes'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { Logo } from '../ui/Logo'
import { typeSmallClasses } from '../ui/typography'

const navLinks = [
  { label: 'Home', to: HOME_PATH },
  { label: 'Shop', to: SHOP_PATH },
  { label: 'Categories', to: CATEGORIES_PATH, hasChevron: true },
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
  const { isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
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
    'inline-flex min-h-11 items-center gap-2 rounded px-2 sm:px-3',
    'text-secondary-text hover:text-primary-text',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
    authLoading ? 'pointer-events-none opacity-60' : '',
  ].join(' ')

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'relative inline-flex items-center justify-center gap-1 pb-2 transition-colors',
      typeSmallClasses,
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded',
      isActive
        ? 'text-primary-text'
        : 'text-secondary-text hover:text-primary-text',
    ].join(' ')

  function NavLinkContent({
    label,
    hasChevron,
    isActive,
  }: {
    label: string
    hasChevron?: boolean
    isActive: boolean
  }) {
    return (
      <>
        {label}
        {hasChevron && <ChevronDown size={14} aria-hidden />}
        {isActive && (
          <span
            className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent"
            aria-hidden
          />
        )}
      </>
    )
  }

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'block rounded-xl px-4 py-3 transition-colors',
      typeSmallClasses,
      'text-left',
      isActive
        ? 'bg-accent/10 text-accent'
        : 'text-primary-text hover:bg-input',
    ].join(' ')

  return (
    <header className="relative z-40 border-b border-border-subtle bg-card">
      <nav
        className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:px-6 lg:py-4"
        aria-label="Main navigation"
      >
        <button
          type="button"
          className={[
            'flex min-h-11 min-w-11 items-center justify-center rounded-lg md:hidden',
            'text-primary-text hover:bg-input',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
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
                {({ isActive }) => (
                  <NavLinkContent
                    label={link.label}
                    hasChevron={link.hasChevron}
                    isActive={isActive}
                  />
                )}
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
              'relative flex min-h-11 min-w-11 items-center justify-center rounded-full transition-colors',
              'text-primary-text hover:bg-input',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            ].join(' ')}
            aria-label={itemCount > 0 ? `Shopping bag, ${itemCount} items` : 'Shopping bag'}
          >
            <ShoppingBag size={20} aria-hidden />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-button-primary px-1 text-[10px] font-semibold text-on-emphasis">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
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
              <span className={['hidden flex-col items-start leading-tight sm:inline-flex', typeSmallClasses, 'text-left'].join(' ')}>
                <span>Sign in / Register</span>
                <span className="text-secondary-text">Account</span>
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
          <div className="fixed inset-y-0 left-0 z-50 w-[min(320px,85vw)] border-r border-border-subtle bg-card p-5 shadow-xl md:hidden">
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
                      'flex w-full items-center gap-2 rounded-xl px-4 py-3 transition-colors',
                      typeSmallClasses,
                      'justify-start text-left',
                      'text-primary-text hover:bg-input',
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
