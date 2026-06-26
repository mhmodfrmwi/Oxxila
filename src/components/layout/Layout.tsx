import { type ReactNode } from 'react'
import { Navbar } from './Navbar'
import { UtilityBar, type UtilityPromo } from './UtilityBar'

interface LayoutProps {
  children: ReactNode
  utilityPromo?: UtilityPromo
}

export function Layout({ children, utilityPromo }: LayoutProps) {
  return (
    <div className="min-h-dvh overflow-x-clip bg-background text-primary-text">
      <Navbar />
      <UtilityBar promo={utilityPromo} />
      <main className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6 max-lg:px-0">
        {children}
      </main>
    </div>
  )
}
