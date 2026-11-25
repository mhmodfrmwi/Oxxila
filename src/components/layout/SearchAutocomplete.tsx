// src/components/layout/SearchAutocomplete.tsx
import { ArrowUpRight, Clock, Search as SearchIcon, ShoppingBag, X } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProducts, getSearchSuggestions, type SearchSuggestions } from '../../api/catalog'
import type { ApiProduct } from '../../types/catalog'
import { catalogDisplayName } from '../../utils/catalogDisplayName'
import { PRODUCTS_PATH, SEARCH_PATH, SHOP_PATH } from '../../config/routes'
import { categoryBrowsePath } from '../../utils/categoryBrowseParams'
import { cn } from '../../lib/cn'
import { formatProductPrice } from '../../utils/formatProductPrice'
import { PRODUCT_IMAGE_PLACEHOLDER } from '../../utils/productImage'

const RECENT_KEY = 'oxxila_recent_searches'
const MAX_RECENT = 5
const DEBOUNCE_MS = 200

/** Best sellers are the same for everyone — fetch once per page load. */
let popularCache: ApiProduct[] | null = null

type Row =
  | { kind: 'product'; key: string; href: string }
  | { kind: 'brand'; key: string; href: string }
  | { kind: 'category'; key: string; href: string }
  | { kind: 'recent'; key: string; term: string }
  | { kind: 'all'; key: string; href: string }

function readRecent(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

function rememberSearch(term: string) {
  try {
    const next = [term, ...readRecent().filter((t) => t !== term)].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable
  }
}

/** Bold the part of `text` that matches `query` (case-insensitive, Arabic-safe, no regex). */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim().toLowerCase()
  const at = needle ? text.toLowerCase().indexOf(needle) : -1
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent font-semibold text-button-primary">
        {text.slice(at, at + needle.length)}
      </mark>
      {text.slice(at + needle.length)}
    </>
  )
}

export function SearchAutocomplete({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isAr = i18n.language.startsWith('ar')

  const urlKeyword = useMemo(
    () => new URLSearchParams(location.search).get('keyword') ?? '',
    [location.search],
  )
  const [value, setValue] = useState(urlKeyword)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SearchSuggestions | null>(null)
  const [recent, setRecent] = useState<string[]>([])
  const [popular, setPopular] = useState<ApiProduct[]>(popularCache ?? [])
  const [activeIndex, setActiveIndex] = useState(-1)

  // Keep the field in sync with the results page keyword (back/forward, deep links).
  useEffect(() => {
    if (location.pathname === SEARCH_PATH) setValue(urlKeyword)
  }, [location.pathname, urlKeyword])

  const query = value.trim()

  // Debounced fetch; stale requests are aborted so slow responses never overwrite fresh ones.
  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    const timer = window.setTimeout(
      async () => {
        setLoading(true)
        try {
          const response = await getSearchSuggestions(query, { signal: controller.signal })
          setData(response.data ?? null)
        } catch {
          if (controller.signal.aborted) return
          // Suggest endpoint unavailable (older API): fall back to the plain products search so
          // results still appear while typing.
          try {
            const fallback = await getProducts({ keyword: query, limit: 6 })
            if (controller.signal.aborted) return
            setData({
              brands: [],
              categories: [],
              products: (fallback.data ?? []).map((p) => ({
                id: p._id,
                slug: p.slug,
                nameEn: p.nameEn || p.name,
                nameAr: p.nameAr || '',
                image: p.images?.[0] ?? null,
                price: p.price,
                priceAfterDiscount: p.priceAfterDiscount ?? null,
                brand: p.brand
                  ? { nameEn: p.brand.nameEn || p.brand.name, nameAr: p.brand.nameAr || '' }
                  : null,
              })),
            })
          } catch {
            if (!controller.signal.aborted) setData(null)
          }
        } finally {
          if (!controller.signal.aborted) setLoading(false)
        }
      },
      query ? DEBOUNCE_MS : 0,
    )
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [open, query])

  // Empty box → show best sellers as a slider (uses the plain products API, always available).
  useEffect(() => {
    if (!open || query || popularCache) return
    let cancelled = false
    getProducts({ isBestSeller: true, limit: 8, sort: '-soldCount' })
      .then((response) => {
        popularCache = response.data ?? []
        if (!cancelled) setPopular(popularCache)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [open, query])

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const name = useCallback(
    (entity: { nameEn: string; nameAr: string }) => (isAr ? entity.nameAr || entity.nameEn : entity.nameEn || entity.nameAr),
    [isAr],
  )

  const rows: Row[] = useMemo(() => {
    const list: Row[] = []
    if (!query) {
      for (const term of recent) list.push({ kind: 'recent', key: `r-${term}`, term })
    } else {
      for (const b of data?.brands ?? [])
        list.push({ kind: 'brand', key: `b-${b.id}`, href: `${SEARCH_PATH}?brand=${encodeURIComponent(b.id)}` })
      for (const c of data?.categories ?? [])
        list.push({
          kind: 'category',
          key: `c-${c.id}`,
          href: c.slug ? categoryBrowsePath(c.slug) : SHOP_PATH,
        })
    }
    // Empty query shows the best-seller slider instead of a plain list.
    if (query) {
      for (const p of data?.products ?? [])
        list.push({ kind: 'product', key: `p-${p.id}`, href: `${PRODUCTS_PATH}/${p.slug}` })
    }
    // Always the last option: nothing found / want everything → browse the whole catalog.
    list.push({
      kind: 'all',
      key: 'all',
      href: query ? `${SEARCH_PATH}?keyword=${encodeURIComponent(query)}` : SHOP_PATH,
    })
    return list
  }, [data, query, recent])

  function go(href: string, remember?: string) {
    if (remember) rememberSearch(remember)
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.blur()
    navigate(href)
  }

  function activate(row: Row) {
    if (row.kind === 'recent') {
      setValue(row.term)
      go(`${SEARCH_PATH}?keyword=${encodeURIComponent(row.term)}`, row.term)
    } else if (row.kind === 'all') {
      go(row.href, query || undefined)
    } else {
      go(row.href, row.kind === 'product' ? query || undefined : undefined)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((current) => (current + step + rows.length) % rows.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const row = rows[activeIndex]
      if (row) activate(row)
      else if (query) go(`${SEARCH_PATH}?keyword=${encodeURIComponent(query)}`, query)
    } else if (event.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const noMatches = Boolean(query) && !loading && data != null && data.products.length === 0
  const heading = !query ? t('search.popular') : null

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <label htmlFor="site-search" className="sr-only">
        {t('search.label')}
      </label>
      <SearchIcon
        size={18}
        aria-hidden
        className="pointer-events-none absolute start-medium top-1/2 -translate-y-1/2 text-placeholder-text"
      />
      <input
        ref={inputRef}
        id="site-search"
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        placeholder={t('search.placeholder')}
        value={value}
        onFocus={() => {
          setRecent(readRecent())
          setOpen(true)
        }}
        onChange={(event) => {
          setValue(event.target.value)
          setActiveIndex(-1)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
        className="site-header__text-xs h-11 w-full rounded-large bg-card ps-[calc(var(--gap-medium)+18px+var(--gap-extra-small))] pe-12 text-primary-text placeholder:text-placeholder-text focus:outline-none focus:ring-2 focus:ring-button-primary/50 md:h-[60px] [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label={t('search.clear')}
          onClick={() => {
            setValue('')
            inputRef.current?.focus()
          }}
          className="absolute end-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-secondary-text hover:bg-surface-muted"
        >
          <X size={16} aria-hidden />
        </button>
      )}

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={t('search.suggestions')}
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-3xl border border-border-subtle bg-card p-2 shadow-xl dark:shadow-black/40"
        >
          {!query && recent.length > 0 && (
            <p className="px-3 pb-1 pt-2 text-xs text-secondary-text">{t('search.recent')}</p>
          )}
          {noMatches && (
            <p className="px-3 py-3 text-sm text-secondary-text" role="status">
              {t('search.noMatches', { query })}
            </p>
          )}
          {loading && !data && (
            <div className="space-y-2 p-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-2xl bg-surface-muted" />
              ))}
            </div>
          )}
          {!query && popular.length > 0 && (
            <div className="px-1 pb-2 pt-1">
              <p className="px-2 pb-2 text-xs text-secondary-text">{heading}</p>
              <ul
                className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label={t('search.popular')}
              >
                {popular.map((p) => {
                  const price = p.priceAfterDiscount ?? p.price
                  return (
                    <li key={p._id} className="w-[132px] shrink-0 snap-start">
                      <button
                        type="button"
                        onClick={() => go(`${PRODUCTS_PATH}/${p.slug}`)}
                        className="flex w-full flex-col gap-2 rounded-2xl p-2 text-start transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary"
                      >
                        <img
                          src={p.images?.[0] || PRODUCT_IMAGE_PLACEHOLDER}
                          alt=""
                          loading="lazy"
                          className="aspect-square w-full rounded-xl bg-white object-cover"
                          onError={(e) => {
                            e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER
                          }}
                        />
                        <span className="line-clamp-2 min-h-[2.4em] text-xs leading-[1.2] text-primary-text">
                          {catalogDisplayName(p, i18n.language, 'product')}
                        </span>
                        <span className="text-xs font-medium text-button-primary">
                          {formatProductPrice(price, i18n.language)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {rows.map((row, index) => {
            const active = index === activeIndex
            const common = {
              id: `${listId}-${index}`,
              role: 'option' as const,
              'aria-selected': active,
              onMouseEnter: () => setActiveIndex(index),
              onClick: () => activate(row),
            }
            const base = cn(
              'flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-start transition-colors',
              active ? 'bg-button-primary/10' : 'hover:bg-surface-muted',
            )
            if (row.kind === 'product') {
              const p = data?.products.find((x) => `p-${x.id}` === row.key)
              if (!p) return null
              const price = p.priceAfterDiscount ?? p.price
              return (
                <button type="button" key={row.key} {...common} className={base}>
                  <img
                    src={p.image || PRODUCT_IMAGE_PLACEHOLDER}
                    alt=""
                    loading="lazy"
                    className="size-12 shrink-0 rounded-xl bg-white object-cover"
                    onError={(e) => {
                      e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-primary-text">
                      <Highlight text={name(p)} query={query} />
                    </span>
                    {p.brand && (
                      <span className="block truncate text-xs text-secondary-text">{name(p.brand)}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-sm text-primary-text">
                    {formatProductPrice(price, i18n.language)}
                  </span>
                </button>
              )
            }
            if (row.kind === 'brand' || row.kind === 'category') {
              const list = row.kind === 'brand' ? data?.brands : data?.categories
              const entity = list?.find((x) => `${row.kind === 'brand' ? 'b' : 'c'}-${x.id}` === row.key)
              if (!entity) return null
              return (
                <button type="button" key={row.key} {...common} className={base}>
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-button-primary/10 text-button-primary">
                    <ShoppingBag size={18} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-primary-text">{name(entity)}</span>
                  <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-secondary-text">
                    {t(row.kind === 'brand' ? 'search.brand' : 'search.category')}
                  </span>
                </button>
              )
            }
            if (row.kind === 'recent') {
              return (
                <button type="button" key={row.key} {...common} className={base}>
                  <Clock size={18} aria-hidden className="shrink-0 text-secondary-text" />
                  <span className="min-w-0 flex-1 truncate text-sm text-primary-text">{row.term}</span>
                </button>
              )
            }
            return (
              <button
                type="button"
                key={row.key}
                {...common}
                className={cn(base, 'mt-1 border-t border-border-subtle pt-3 text-button-primary')}
              >
                <ArrowUpRight size={18} aria-hidden className="shrink-0 rtl:-scale-x-100" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {query ? t('search.seeAll', { query }) : t('search.browseAll')}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
