// src/components/layout/Navbar.tsx
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { ChevronDown, Heart, LogOut, ShoppingBag, User, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ACCOUNT_NAV_ICONS, ACCOUNT_SIDEBAR_NAV } from '../../config/accountNav'
import {
  CART_PATH,
  WISHLIST_PATH,
  CATEGORIES_PATH,
  DOCS_PATH,
  HOME_PATH,
  LOGIN_PATH,
  SHOP_PATH,
} from '../../config/routes'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { useGiftCards } from '../../hooks/useGiftCards'
import { useUserAvatar } from '../../hooks/useUserAvatar'
import chevronDownIcon from '../../assets/header/chevron-down.svg'
import basketIcon from '../../assets/header/shopping-basket-01.svg'
import userIcon from '../../assets/header/user.svg'
import { UserAvatar } from '../account/UserAvatar'
import { Logo } from '../ui/Logo'
import { MaskIcon } from '../ui/MaskIcon'
import { typeSmallClasses } from '../ui/typography'
import { AccountDropdown } from './AccountDropdown'

const drawerListVariants: Variants = {
  closed: {},
  open: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } },
}

const drawerItemVariants: Variants = {
  closed: { opacity: 0, y: 10 },
  open: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

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
  const { t, i18n } = useTranslation()
  const drawerOffset = i18n.dir() === 'rtl' ? '100%' : '-100%'
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const { name, src, loading: avatarLoading } = useUserAvatar()
  const { balance: giftCardBalance, loading: giftCardsLoading, refresh: refreshGiftCards } =
    useGiftCards()
  const { itemCount } = useCart()
  const { itemCount: wishlistCount } = useWishlist()
  const toast = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const accountMenuId = useId()

  const navLinks = useMemo<Array<{ labelKey: string; to: string; hasChevron?: boolean }>>(
    () => [
      { labelKey: 'nav.home', to: HOME_PATH },
      { labelKey: 'nav.shop', to: SHOP_PATH },
      { labelKey: 'nav.categories', to: CATEGORIES_PATH },
      { labelKey: 'nav.docs', to: DOCS_PATH },
    ],
    [],
  )

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  function closeAccountMenu() {
    setAccountOpen(false)
  }

  async function handleLogout() {
    if (authLoading) return

    setAuthLoading(true)
    setAccountOpen(false)

    try {
      await logout()
      toast.success(t('nav.logOut'))
      setMenuOpen(false)
      navigate(HOME_PATH, { replace: true })
    } catch {
      toast.error(t('nav.logOut'))
    } finally {
      setAuthLoading(false)
    }
  }

  const authActionClass = [
    'inline-flex min-h-11 items-center gap-2 rounded',
    'text-secondary-text hover:text-primary-text',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
    authLoading ? 'pointer-events-none opacity-60' : '',
  ].join(' ')

  const signInClass = [
    'inline-flex min-h-9 min-w-9 shrink-0 items-center justify-end gap-1 rounded text-start sm:min-h-11 sm:min-w-11 md:min-h-0',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
  ].join(' ')

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'site-header__text-small relative inline-flex items-center justify-center gap-2.5 transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded',
      isActive ? 'text-primary-text' : 'text-secondary-text hover:text-primary-text',
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
        {hasChevron && <MaskIcon src={chevronDownIcon} width={13.0667} height={7.23333} />}
        {isActive && (
          <span
            className="absolute top-full left-1/2 h-[3px] w-[9px] -translate-x-1/2 rounded-medium bg-primary-text"
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
      'text-start',
      isActive ? 'bg-accent/10 text-accent' : 'text-primary-text hover:bg-input',
    ].join(' ')

  return (
    <header className="site-header relative z-50 bg-background">
      <nav
        className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-[var(--page-gutter)] py-2.5 sm:gap-3 sm:py-3 md:gap-small lg:pt-extra-large lg:pb-medium"
        aria-label={t('nav.mainNavigation')}
      >
        <button
          type="button"
          className={[
            'flex min-h-11 min-w-11 items-center justify-start rounded-lg md:hidden',
            'text-primary-text hover:bg-input',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          ].join(' ')}
          aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          aria-expanded={menuOpen}
          onClick={() => {
            setAccountOpen(false)
            setMenuOpen((open) => !open)
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={menuOpen ? 'close' : 'open'}
              className="flex"
              initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
              transition={{ duration: 0.18 }}
            >
              {menuOpen ? <X size={22} /> : <BurgerIcon />}
            </motion.span>
          </AnimatePresence>
        </button>

        <ul className="hidden min-w-0 items-center gap-6 md:flex lg:gap-[33px]">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClass}>
                {({ isActive }) => (
                  <NavLinkContent
                    label={t(link.labelKey)}
                    hasChevron={link.hasChevron}
                    isActive={isActive}
                  />
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex min-w-0 items-center justify-center">
          <Logo size="header" />
        </div>

        <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-3 md:gap-medium">
          <Link
            to={WISHLIST_PATH}
            className={[
              // Phones: the wishlist lives in the menu (header only has room for account + cart).
              'relative hidden size-11 shrink-0 items-center justify-center rounded-full transition-colors sm:flex',
              'text-icon-primary hover:bg-input',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            ].join(' ')}
            aria-label={t('wishlist.title', { defaultValue: 'Wishlist' })}
          >
            <Heart size={22} strokeWidth={1.6} aria-hidden />
            {wishlistCount > 0 && (
              <span className="absolute end-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-button-primary px-1 text-[11px] font-bold leading-none text-on-emphasis ring-2 ring-background">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to={CART_PATH}
            className={[
              'relative flex size-9 shrink-0 items-center justify-center rounded-full transition-colors sm:size-11',
              'text-icon-primary hover:bg-input',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            ].join(' ')}
            aria-label={
              itemCount > 0
                ? t('nav.shoppingBagWithCount', { count: itemCount })
                : t('nav.shoppingBag')
            }
          >
            <MaskIcon src={basketIcon} width={20.5} height={21.5} frame={24} />
            {itemCount > 0 && (
              // key remounts the badge on every count change so the bump replays.
              // The ring matches the header background so the badge reads cleanly over the bag.
              <span
                key={itemCount}
                className="absolute end-0 top-0 flex h-[18px] min-w-[18px] animate-[cart-badge-bump_0.4s_ease-out] items-center justify-center rounded-full bg-button-primary px-1 text-[11px] font-bold leading-none text-on-emphasis ring-2 ring-background motion-reduce:animate-none"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <div ref={accountMenuRef} className="relative min-w-0">
                <button
                  type="button"
                  // Phones: a plain 36px avatar target, same size as the cart icon next to it.
                  className={`${authActionClass} max-w-full max-sm:min-h-9 max-sm:min-w-9 max-sm:justify-center`}
                  aria-label={t('nav.openAccountMenu')}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-controls={accountMenuId}
                  onClick={() => {
                    setMenuOpen(false)
                    setAccountOpen((open) => !open)
                  }}
                >
                  <UserAvatar
                    name={name}
                    src={src}
                    size="sm"
                    className="max-sm:h-9 max-sm:w-9 max-sm:text-xs"
                    alt={name}
                    loading={avatarLoading}
                  />
                  <span className="site-header__text-xs hidden min-w-0 max-w-[8rem] truncate sm:inline">
                    {name}
                  </span>
                </button>
                <AccountDropdown
                  id={accountMenuId}
                  open={accountOpen}
                  onClose={closeAccountMenu}
                  rootRef={accountMenuRef}
                  storeCreditBalance={giftCardBalance}
                  giftCardsLoading={giftCardsLoading}
                  onRefreshGiftCards={() => void refreshGiftCards()}
                />
              </div>
              {/* Phones: logout lives in the menu; the header keeps just account + cart. */}
              <button
                type="button"
                className={`${authActionClass} max-sm:hidden`}
                onClick={() => void handleLogout()}
                disabled={authLoading}
                aria-busy={authLoading}
                aria-label={authLoading ? t('nav.loggingOut') : t('nav.logOut')}
              >
                <LogOut size={18} aria-hidden />
                <span className="site-header__text-xs hidden sm:inline">
                  {authLoading ? t('nav.loggingOut') : t('nav.logOut')}
                </span>
              </button>
            </>
          ) : (
            <NavLink to={LOGIN_PATH} className={signInClass}>
              <MaskIcon
                src={userIcon}
                width={19.5004}
                height={21.5}
                frame={24}
                className="text-icon-primary"
              />
              <span className="site-header__text-xs hidden flex-col items-start sm:inline-flex">
                <span className="text-primary-text">{t('nav.signInRegister')}</span>
                <span className="text-secondary-text">{t('nav.account')}</span>
              </span>
            </NavLink>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.button
            key="menu-overlay"
            type="button"
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] md:hidden"
            aria-label={t('nav.closeMenuOverlay')}
            onClick={() => setMenuOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
        {menuOpen && (
          <motion.div
            key="menu-drawer"
            className="fixed inset-y-0 start-0 z-[70] w-[min(320px,85vw)] overflow-y-auto border-e border-border-subtle bg-card p-5 shadow-xl md:hidden"
            initial={{ x: drawerOffset }}
            animate={{ x: 0 }}
            exit={{ x: drawerOffset }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                className="rounded-lg p-2 transition-transform duration-200 hover:rotate-90 motion-reduce:transition-none"
                aria-label={t('nav.closeMenu')}
                onClick={() => setMenuOpen(false)}
              >
                <X size={22} />
              </button>
            </div>
            <motion.ul
              className="space-y-1"
              variants={drawerListVariants}
              initial="closed"
              animate="open"
            >
              {navLinks.map((link) => (
                <motion.li key={link.to} variants={drawerItemVariants}>
                  <NavLink
                    to={link.to}
                    className={mobileLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {t(link.labelKey)}
                      {link.hasChevron && <ChevronDown size={14} aria-hidden />}
                    </span>
                  </NavLink>
                </motion.li>
              ))}
              <motion.li variants={drawerItemVariants}>
                <NavLink
                  to={WISHLIST_PATH}
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="inline-flex items-center gap-2">
                    <Heart size={16} aria-hidden />
                    {t('wishlist.title', { defaultValue: 'Wishlist' })}
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-button-primary px-2 py-0.5 text-[11px] font-bold leading-none text-on-emphasis">
                        {wishlistCount}
                      </span>
                    )}
                  </span>
                </NavLink>
              </motion.li>
              <motion.li variants={drawerItemVariants}>
                <NavLink
                  to={CART_PATH}
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="inline-flex items-center gap-2">
                    <ShoppingBag size={16} aria-hidden />
                    {t('nav.cart')}
                    {itemCount > 0 && (
                      <span className="rounded-full bg-button-primary px-2 py-0.5 text-[11px] font-bold leading-none text-on-emphasis">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </span>
                </NavLink>
              </motion.li>
              <motion.li className="pt-2" variants={drawerItemVariants}>
                {isAuthenticated ? (
                  <div className="space-y-1">
                    {ACCOUNT_SIDEBAR_NAV.map((item) => {
                      const Icon = ACCOUNT_NAV_ICONS[item.id]
                      return (
                        <NavLink
                          key={item.id}
                          to={item.to}
                          end={'end' in item ? item.end : undefined}
                          className={mobileLinkClass}
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="inline-flex items-center gap-2">
                            {item.id === 'profile' ? (
                              <UserAvatar
                                name={name}
                                src={src}
                                size="sm"
                                alt={name}
                                loading={avatarLoading}
                              />
                            ) : (
                              <Icon size={18} strokeWidth={1.5} aria-hidden />
                            )}
                            {item.id === 'profile'
                              ? name || t(item.labelKey)
                              : t(item.labelKey)}
                          </span>
                        </NavLink>
                      )
                    })}
                    <button
                      type="button"
                      className={[
                        'flex w-full items-center gap-2 rounded-xl px-4 py-3 transition-colors',
                        typeSmallClasses,
                        'justify-start text-start',
                        'text-primary-text hover:bg-input',
                        authLoading ? 'pointer-events-none opacity-60' : '',
                      ].join(' ')}
                      onClick={() => void handleLogout()}
                      disabled={authLoading}
                      aria-busy={authLoading}
                    >
                      <LogOut size={18} aria-hidden />
                      {authLoading ? t('nav.loggingOut') : t('nav.logOut')}
                    </button>
                  </div>
                ) : (
                  <NavLink
                    to={LOGIN_PATH}
                    className={mobileLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <User size={18} aria-hidden />
                      {t('nav.signInRegister')}
                    </span>
                  </NavLink>
                )}
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
