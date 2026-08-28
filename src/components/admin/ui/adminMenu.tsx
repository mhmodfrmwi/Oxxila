// src/components/admin/ui/adminMenu.tsx
import { MoreHorizontal } from 'lucide-react'
import {
  useEffect,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type RefObject,
} from 'react'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

/** Shared admin dropdown / context-menu panel (orders row menu reference). */
export const adminMenuPanelClass = cn(
  'overflow-hidden rounded-2xl border border-white/15 bg-[#151221] p-1.5',
  'shadow-[0_20px_48px_rgba(0,0,0,0.65)]',
)

export const adminMenuPanelAnchorClass = cn(
  adminMenuPanelClass,
  'absolute end-0 top-full z-30 mt-2 min-w-[15rem]',
)

export type AdminMenuItemVariant = 'default' | 'danger'

export function adminMenuItemClass(variant: AdminMenuItemVariant = 'default') {
  return cn(
    'flex w-full items-center gap-3 rounded-xl px-3.5 py-3',
    'text-start text-sm font-medium leading-5 transition-colors',
    focusRingClasses,
    variant === 'danger'
      ? 'text-[#ff8a8d] hover:bg-[rgba(255,100,103,0.12)] hover:text-[#ff6467]'
      : 'text-white/85 hover:bg-white/10 hover:text-white',
  )
}

export function adminMenuOptionClass({
  selected = false,
  highlighted = false,
  disabled = false,
}: {
  selected?: boolean
  highlighted?: boolean
  disabled?: boolean
}) {
  return cn(
    'mx-1.5 cursor-pointer rounded-xl px-3.5 py-3 text-sm font-medium leading-5 transition-colors',
    disabled && 'cursor-not-allowed opacity-40',
    selected && 'bg-[var(--admin-nav-active-bg)] text-accent',
    !selected && highlighted && 'bg-white/10 text-white',
    !selected &&
      !highlighted &&
      !disabled &&
      'text-white/70 hover:bg-white/10 hover:text-white',
  )
}

export const adminMenuItemIconClass =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-current opacity-80'

export function AdminMenuItemIcon({ children }: { children: ReactNode }) {
  return <span className={adminMenuItemIconClass}>{children}</span>
}

type AdminMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode
  variant?: AdminMenuItemVariant
}

export function AdminMenuItem({
  icon,
  variant = 'default',
  className,
  children,
  type = 'button',
  ...props
}: AdminMenuItemProps) {
  return (
    <button type={type} className={cn(adminMenuItemClass(variant), className)} {...props}>
      {icon ? <AdminMenuItemIcon>{icon}</AdminMenuItemIcon> : null}
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  )
}

type AdminMenuLinkItemProps = ComponentPropsWithoutRef<'a'> & {
  icon?: ReactNode
  variant?: AdminMenuItemVariant
}

export function AdminMenuLinkItem({
  icon,
  variant = 'default',
  className,
  children,
  ...props
}: AdminMenuLinkItemProps) {
  return (
    <a className={cn(adminMenuItemClass(variant), className)} {...props}>
      {icon ? <AdminMenuItemIcon>{icon}</AdminMenuItemIcon> : null}
      <span className="min-w-0 flex-1">{children}</span>
    </a>
  )
}

type AdminMenuTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  open?: boolean
}

export function AdminMenuTrigger({
  open = false,
  className,
  children,
  type = 'button',
  ...props
}: AdminMenuTriggerProps) {
  return (
    <button
      type={type}
      aria-haspopup="menu"
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-xl text-white/70',
        'border border-transparent transition-colors hover:bg-white/10 hover:text-white',
        open && 'border-[rgba(163,148,255,0.55)] bg-white/10 text-white',
        focusRingClasses,
        className,
      )}
      {...props}
    >
      {children ?? <MoreHorizontal size={20} aria-hidden />}
    </button>
  )
}

/** Close on outside click + Escape. */
export function useAdminMenuDismiss(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  rootRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onOpenChange, open, rootRef])
}
