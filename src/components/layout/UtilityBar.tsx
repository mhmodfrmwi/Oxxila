import { useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Package, Search } from 'lucide-react'
import langIcon from '../../assets/Lang-image.png'
import { useTheme } from '../../context/ThemeContext'
import { typeSmallClasses } from '../ui/typography'

export interface UtilityPromo {
  title: string
  subtitle: string
}

const defaultPromo: UtilityPromo = {
  title: 'Free shipping over $50 orders',
  subtitle: 'Limited-time offer',
}

interface UtilityBarProps {
  promo?: UtilityPromo
}

export function UtilityBar({ promo = defaultPromo }: UtilityBarProps) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')

  function submitSearch() {
    const keyword = searchValue.trim()
    if (!keyword) return
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`)
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      submitSearch()
    }
  }

  return (
    <section className="border-b border-border-subtle bg-background">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-3 py-2.5 sm:px-4 sm:py-3 min-[769px]:flex-row min-[769px]:items-center min-[769px]:justify-between min-[769px]:gap-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input text-icon-secondary">
            <Package size={18} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className={['truncate text-primary-text', typeSmallClasses, 'text-left'].join(' ')}>
              {promo.title}
            </p>
            <p className="truncate text-[length:var(--font-size-small)] leading-[var(--line-height-small)] text-secondary-text">
              {promo.subtitle}
            </p>
          </div>
        </div>

        <div className="relative w-full min-[769px]:max-w-sm min-[769px]:flex-1">
          <label htmlFor="site-search" className="sr-only">
            Search
          </label>
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
            aria-hidden
          />
          <input
            id="site-search"
            type="search"
            placeholder="Search for..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="h-11 w-full rounded-full bg-input py-2.5 pl-10 pr-4 text-[length:var(--font-size-small)] leading-[var(--line-height-small)] text-primary-text placeholder:text-placeholder-text focus:outline-none focus:ring-2 focus:ring-button-primary/50"
          />
        </div>

        <div className="flex w-full items-center justify-between gap-3 min-[769px]:w-auto min-[769px]:min-w-[280px] min-[769px]:justify-end min-[1025px]:min-w-[300px]">
          <button
            type="button"
            className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 text-left min-[769px]:flex-initial"
          >
            <img
              src={langIcon}
              alt=""
              className="h-7 w-9 shrink-0 rounded-full object-cover"
              aria-hidden
            />
            <span className="flex flex-col items-start">
              <span className={typeSmallClasses}>Language</span>
              <strong className="text-[length:var(--font-size-small)] leading-[var(--line-height-small)] font-normal text-secondary-text">
                English
              </strong>
            </span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 text-left min-[769px]:flex-initial"
          >
            <Moon size={30} strokeWidth={1.75} className="text-secondary-text" aria-hidden />
            <span className="flex flex-col items-start">
              <span className={typeSmallClasses}>Change Theme</span>
              <strong className="capitalize text-[length:var(--font-size-small)] leading-[var(--line-height-small)] font-normal text-secondary-text">
                {theme}
              </strong>
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
