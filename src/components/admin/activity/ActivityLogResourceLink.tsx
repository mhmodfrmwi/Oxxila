// src/components/admin/activity/ActivityLogResourceLink.tsx
import { Link } from 'react-router-dom'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

interface ActivityLogResourceLinkProps {
  label: string
  href: string | null
  subtitle?: string
  className?: string
}

export function ActivityLogResourceLink({
  label,
  href,
  subtitle,
  className,
}: ActivityLogResourceLinkProps) {
  const content = (
    <>
      <p className={cn('truncate text-sm', href ? 'text-accent' : 'text-white/80')} title={label}>
        {label}
      </p>
      {subtitle ? (
        <p className="text-[10px] uppercase tracking-wide text-white/35">{subtitle}</p>
      ) : null}
    </>
  )

  if (!href) {
    return <div className={cn('block min-w-[12rem] max-w-[22rem]', className)}>{content}</div>
  }

  return (
    <Link
      to={href}
      className={cn(
        'block min-w-[12rem] max-w-[22rem] rounded-lg transition-colors hover:bg-white/[0.06]',
        focusRingClasses,
        className,
      )}
    >
      {content}
    </Link>
  )
}
