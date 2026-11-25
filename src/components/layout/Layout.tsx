// src/components/layout/Layout.tsx
import { type ReactNode } from 'react'
import { Navbar } from './Navbar'
import { UtilityBar } from './UtilityBar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-dvh overflow-x-clip bg-background text-primary-text">
      <Navbar />
      <UtilityBar />
      <main className="w-full py-4 sm:py-5 lg:py-6">
        {children}
      </main>
    </div>
  )
}
