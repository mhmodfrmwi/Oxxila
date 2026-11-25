// src/components/ui/Dropdown.tsx
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

interface DropdownProps {
  options: readonly DropdownOption[]
  value: string
  onChange: (value: string) => void
  /** Shown while no option matches `value` (e.g. a disabled "Choose…" entry). */
  placeholder?: string
  id?: string
  name?: string
  disabled?: boolean
  invalid?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  className?: string
  /** Extra classes for the trigger button (replaces the default field look when `unstyled`). */
  triggerClassName?: string
  /** Skip the default field styling on the trigger so callers can supply their own. */
  unstyled?: boolean
  /** Align the panel to the end edge and let it grow past the trigger width (toolbar sorts). */
  panelMinWidth?: boolean
}

/**
 * Themed replacement for the native <select> popup: same value/onChange contract, but the open list
 * follows the site's cards, radii and RTL layout. Keyboard: arrows, Home/End, Enter/Space, Esc, type-ahead.
 */
export function Dropdown({
  options,
  value,
  onChange,
  placeholder,
  id: externalId,
  name,
  disabled,
  invalid,
  ariaLabel,
  ariaDescribedBy,
  className,
  triggerClassName,
  unstyled,
  panelMinWidth,
}: DropdownProps) {
  const generatedId = useId()
  const id = externalId ?? generatedId
  const listId = `${id}-list`
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeahead = useRef({ text: '', timer: 0 })
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Placeholder-style entries (empty value, disabled) are hints, not choices.
  const choices = useMemo(
    () => options.filter((option) => !(option.value === '' && option.disabled)),
    [options],
  )
  const selected = choices.find((option) => option.value === value)

  const close = useCallback(() => {
    setOpen(false)
    setActiveIndex(-1)
  }, [])

  const openList = useCallback(() => {
    if (disabled || choices.length === 0) return
    const index = choices.findIndex((option) => option.value === value && !option.disabled)
    setActiveIndex(index >= 0 ? index : choices.findIndex((option) => !option.disabled))
    setOpen(true)
  }, [choices, disabled, value])

  const commit = useCallback(
    (option: DropdownOption | undefined) => {
      if (!option || option.disabled) return
      onChange(option.value)
      close()
    },
    [close, onChange],
  )

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [close, open])

  // Keep the highlighted row in view while arrowing through long lists.
  useEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  function move(step: 1 | -1) {
    if (choices.length === 0) return
    let next = activeIndex
    for (let i = 0; i < choices.length; i += 1) {
      next = (next + step + choices.length) % choices.length
      if (!choices[next]?.disabled) break
    }
    setActiveIndex(next)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault()
        if (!open) openList()
        else move(event.key === 'ArrowDown' ? 1 : -1)
        break
      case 'Home':
      case 'End':
        if (!open) return
        event.preventDefault()
        setActiveIndex(event.key === 'Home' ? 0 : choices.length - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!open) openList()
        else commit(choices[activeIndex])
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          close()
        }
        break
      case 'Tab':
        if (open) close()
        break
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          window.clearTimeout(typeahead.current.timer)
          typeahead.current.text += event.key.toLowerCase()
          typeahead.current.timer = window.setTimeout(() => {
            typeahead.current.text = ''
          }, 600)
          const match = choices.findIndex(
            (option) => !option.disabled && option.label.toLowerCase().startsWith(typeahead.current.text),
          )
          if (match >= 0) {
            if (!open) setOpen(true)
            setActiveIndex(match)
          }
        }
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={ariaDescribedBy}
        aria-activedescendant={open && activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-3 text-start',
          !unstyled &&
            cn(
              'rounded-xl border bg-card px-4 py-3.5 text-base text-primary-text',
              'transition-[border-color,box-shadow] duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-button-primary/50',
              invalid
                ? 'border-support-error focus-visible:ring-support-error/40'
                : open
                  ? 'border-button-primary ring-2 ring-button-primary/30'
                  : 'border-border-subtle',
              'disabled:cursor-not-allowed disabled:opacity-55',
            ),
          triggerClassName,
        )}
      >
        <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-secondary-text')}>
          {selected?.label ?? placeholder ?? ''}
        </span>
        <ChevronDown
          size={18}
          aria-hidden
          className={cn(
            'shrink-0 text-secondary-text transition-transform duration-200',
            open && 'rotate-180 text-button-primary',
          )}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className={cn(
              'absolute inset-x-0 top-full z-50 mt-2 max-h-64 origin-top overflow-y-auto',
              'rounded-2xl border border-border-subtle bg-card p-1.5',
              'shadow-[0_16px_40px_rgb(93_90_136/0.18)] dark:shadow-[0_16px_40px_rgb(0_0_0/0.45)]',
              panelMinWidth && 'min-w-full w-max max-w-[min(20rem,90vw)] end-0 start-auto',
            )}
          >
            {choices.map((option, index) => {
              const isSelected = option.value === value
              const isActive = index === activeIndex
              return (
                <li
                  key={option.value || `empty-${index}`}
                  id={`${id}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  onPointerMove={() => !option.disabled && setActiveIndex(index)}
                  onClick={() => commit(option)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm',
                    'transition-colors',
                    isActive && 'bg-button-primary/10',
                    isSelected ? 'font-semibold text-button-primary' : 'text-primary-text',
                    option.disabled && 'cursor-not-allowed opacity-45',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {isSelected ? <Check size={16} strokeWidth={2.5} aria-hidden className="shrink-0" /> : null}
                </li>
              )
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
