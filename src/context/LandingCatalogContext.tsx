import { createContext, type ReactNode } from 'react'
import { useLandingCatalog } from '../hooks/useLandingCatalog'
import type { LandingCatalogState } from '../hooks/useLandingCatalog'

export const LandingCatalogContext = createContext<LandingCatalogState | null>(null)

export function LandingCatalogProvider({ children }: { children: ReactNode }) {
  const catalog = useLandingCatalog()

  return (
    <LandingCatalogContext.Provider value={catalog}>{children}</LandingCatalogContext.Provider>
  )
}
