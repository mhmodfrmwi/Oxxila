import { type ReactNode } from 'react'

interface AuthSimpleCardProps {
  children: ReactNode
  className?: string
}

export function AuthSimpleCard({ children, className = '' }: AuthSimpleCardProps) {
  return (
    <article
      className={[
        'mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-card-light p-6 shadow-xl dark:bg-card-dark sm:p-10 lg:p-12',
        className,
      ].join(' ')}
    >
      {children}
    </article>
  )
}
