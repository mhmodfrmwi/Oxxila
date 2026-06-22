import { type ReactNode } from 'react'

interface AuthSimpleCardProps {
  children: ReactNode
  className?: string
}

export function AuthSimpleCard({ children, className = '' }: AuthSimpleCardProps) {
  return (
    <article
      className={[
        'mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-card p-6 shadow-xl sm:p-10 lg:p-12',
        className,
      ].join(' ')}
    >
      {children}
    </article>
  )
}
