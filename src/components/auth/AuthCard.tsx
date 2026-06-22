import { type ReactNode } from 'react'
import { AuthVisual } from './AuthVisual'

interface AuthCardProps {
  activeTab: 'login' | 'signup'
  children: ReactNode
  imagePosition: 'left' | 'right'
}

export function AuthCard({ activeTab, children, imagePosition }: AuthCardProps) {
  const formOrder =
    imagePosition === 'left' ? 'order-1 lg:order-2' : 'order-1'
  const visualOrder =
    imagePosition === 'left' ? 'order-2 lg:order-1' : 'order-2'
  const flipImage = activeTab === 'login'

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-3xl bg-card shadow-xl max-lg:rounded-none lg:min-h-[780px] lg:flex-row">
      {imagePosition === 'left' && (
        <AuthVisual activeTab={activeTab} className={visualOrder} flipImage={flipImage} />
      )}

      <section
        className={[
          formOrder,
          'flex flex-1 flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:flex-[0.85] lg:px-10 lg:py-12 xl:px-14',
        ].join(' ')}
        aria-label={activeTab === 'login' ? 'Login form' : 'Registration form'}
      >
        {children}
      </section>

      {imagePosition === 'right' && (
        <AuthVisual activeTab={activeTab} className={visualOrder} flipImage={flipImage} />
      )}
    </article>
  )
}
