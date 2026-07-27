// src/components/admin/ui/Select.tsx
import { ChevronDown } from 'lucide-react'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  options: readonly SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  /** `field` matches admin form inputs; `toolbar` matches catalog filter controls. */
  size?: 'field' | 'toolbar'
  /** Extra classes on the trigger button (e.g. mt-2, error border). */
  triggerClassName?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

const sizeClasses = {
  field: 'rounded-[var(--admin-radius-md)] px-[17px] py-[13px]',
  toolbar: 'h-[43.2px] rounded-2xl px-5 py-0',
} as const

interface MenuPosition {
  top: number
  left: number
  width: number
  maxHeight: number
  openUp: boolean
}

function findEnabledIndex(
  options: readonly SelectOption[],
  start: number,
  direction: 1 | -1,
): number {
  let index = start
  while (index >= 0 && index < options.length) {
    if (!options[index]?.disabled) return index
    index += direction
  }
  return -1
}

/** Keep token scope (`.admin-shell`) so glass styles resolve; fall back to body. */
function getSelectPortalRoot(): HTMLElement {
  return (
    document.querySelector<HTMLElement>('.admin-shell') ?? document.body
  )
}

function getMenuOptions(
  options: readonly SelectOption[],
  placeholder: string | undefined,
): SelectOption[] {
  return options.filter(
    (option) =>
      !(
        option.value === '' &&
        placeholder != null &&
        option.label === placeholder
      ),
  )
}

/**
 * Admin design-system select — custom listbox (no native &lt;select&gt; popup).
 * Portals into `.admin-shell` so glass tokens apply and the menu floats above drawers/dialogs.
 */
export function Select({
  id: externalId,
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
  className,
  size = 'field',
  triggerClassName,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: SelectProps) {
  const generatedId = useId()
  const listboxId = useId()
  const id = externalId ?? generatedId
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [position, setPosition] = useState<MenuPosition | null>(null)

  // Empty option that only mirrors `placeholder` is a sentinel — show once on the trigger, not in the list.
  const menuOptions = getMenuOptions(options, placeholder)

  const selected = options.find((option) => option.value === value)
  const isPlaceholderSelection =
    value === '' &&
    (selected == null ||
      (placeholder != null && selected.label === placeholder))
  const displayLabel = isPlaceholderSelection
    ? (placeholder ?? '')
    : (selected?.label ?? '')

  const updatePosition = () => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const viewportPadding = 8
    const gap = 6
    const preferredMax = 240
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding - gap
    const spaceAbove = rect.top - viewportPadding - gap
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow
    const available = openUp ? spaceAbove : spaceBelow
    const maxHeight = Math.min(preferredMax, Math.max(available, 96))

    setPosition({
      top: openUp ? rect.top - gap : rect.bottom + gap,
      left: rect.left,
      width: rect.width,
      maxHeight,
      openUp,
    })
  }

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }
    updatePosition()
  }, [open])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      setOpen(false)
    }

    function handleReposition() {
      updatePosition()
    }

    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('resize', handleReposition)
    // Capture scroll from nested drawers / dialog panels.
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const visibleOptions = getMenuOptions(options, placeholder)
    const selectedIndex = visibleOptions.findIndex((option) => option.value === value)
    const initial =
      selectedIndex >= 0 && !visibleOptions[selectedIndex]?.disabled
        ? selectedIndex
        : findEnabledIndex(visibleOptions, 0, 1)
    setHighlightIndex(initial)

    const frame = window.requestAnimationFrame(() => {
      listRef.current?.focus()
      const optionEl = listRef.current?.querySelector<HTMLElement>(
        `[data-index="${initial}"]`,
      )
      optionEl?.scrollIntoView({ block: 'nearest' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open, options, placeholder, value])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const selectIndex = (index: number) => {
    const option = menuOptions[index]
    if (!option || option.disabled) return
    onValueChange(option.value)
    close()
  }

  const moveHighlight = (direction: 1 | -1) => {
    if (menuOptions.length === 0) return
    const from =
      highlightIndex >= 0
        ? highlightIndex + direction
        : direction === 1
          ? 0
          : menuOptions.length - 1
    const next = findEnabledIndex(
      menuOptions,
      Math.min(Math.max(from, 0), menuOptions.length - 1),
      direction,
    )
    if (next < 0) return
    setHighlightIndex(next)
    const optionEl = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${next}"]`,
    )
    optionEl?.scrollIntoView({ block: 'nearest' })
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault()
      setOpen(true)
    }
  }

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'ArrowDown':
        event.preventDefault()
        moveHighlight(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveHighlight(-1)
        break
      case 'Home': {
        event.preventDefault()
        const first = findEnabledIndex(menuOptions, 0, 1)
        if (first >= 0) setHighlightIndex(first)
        break
      }
      case 'End': {
        event.preventDefault()
        const last = findEnabledIndex(menuOptions, menuOptions.length - 1, -1)
        if (last >= 0) setHighlightIndex(last)
        break
      }
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (highlightIndex >= 0) selectIndex(highlightIndex)
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        break
    }
  }

  const menuStyle: CSSProperties | undefined = position
    ? {
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: position.width,
        maxWidth: position.width,
        maxHeight: position.maxHeight,
        transform: position.openUp ? 'translateY(-100%)' : undefined,
        zIndex: 200,
        boxSizing: 'border-box',
      }
    : undefined

  const menu =
    open && position
      ? createPortal(
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={ariaLabelledBy}
            aria-label={ariaLabel}
            aria-activedescendant={
              highlightIndex >= 0
                ? `${listboxId}-option-${highlightIndex}`
                : undefined
            }
            onKeyDown={onListKeyDown}
            style={menuStyle}
            className={cn(
              'overflow-x-hidden overflow-y-auto outline-none',
              'admin-glass-strong rounded-[var(--admin-radius-lg)] py-1',
              'shadow-[0_16px_40px_rgba(0,0,0,0.45)]',
              'text-sm text-primary-text',
            )}
          >
            {menuOptions.length === 0 ? (
              <li className="px-3 py-2.5 text-secondary-text" aria-disabled>
                {placeholder ?? '—'}
              </li>
            ) : (
              menuOptions.map((option, index) => {
                const isSelected = option.value === value
                const isHighlighted = index === highlightIndex
                return (
                  <li
                    key={`${option.value}-${index}`}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    data-index={index}
                    className={cn(
                      'cursor-pointer truncate px-3 py-2.5 transition-colors',
                      option.disabled && 'cursor-not-allowed opacity-40',
                      !option.disabled &&
                        isSelected &&
                        'bg-[var(--admin-nav-active-bg)] font-medium text-accent',
                      !option.disabled &&
                        !isSelected &&
                        isHighlighted &&
                        'bg-white/10 text-primary-text',
                      !option.disabled &&
                        !isSelected &&
                        !isHighlighted &&
                        'text-secondary-text hover:bg-white/5 hover:text-primary-text',
                    )}
                    onMouseEnter={() => {
                      if (!option.disabled) setHighlightIndex(index)
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault()
                    }}
                    onClick={() => selectIndex(index)}
                  >
                    {option.label}
                  </li>
                )
              })
            )}
          </ul>,
          getSelectPortalRoot(),
        )
      : null

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={ariaInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        onClick={() => {
          if (disabled) return
          setOpen((current) => !current)
        }}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-2',
          'border border-[var(--admin-glass-border)] bg-[var(--admin-glass-bg)]',
          'text-start text-sm text-primary-text',
          'transition-colors hover:bg-white/[0.07]',
          'disabled:cursor-not-allowed disabled:opacity-60',
          sizeClasses[size],
          focusRingClasses,
          open && 'ring-2 ring-accent/40',
          ariaInvalid && 'border-support-error',
          triggerClassName,
        )}
      >
        <span
          className={cn(
            'min-w-0 flex-1 truncate',
            isPlaceholderSelection || !displayLabel
              ? 'text-placeholder-text'
              : 'text-primary-text',
          )}
        >
          {displayLabel || '—'}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 text-secondary-text transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {menu}
    </div>
  )
}
