// src/context/FooterSettingsContext.tsx
import { createContext, useContext, type ReactNode } from 'react'
import {
  useFooterSettings,
  type FooterInstagramTile,
  type FooterSocialLink,
} from '../hooks/useFooterSettings'

interface FooterSettingsContextValue {
  instagramTiles: FooterInstagramTile[]
  socialLinks: FooterSocialLink[]
  loading: boolean
}

const FooterSettingsContext = createContext<FooterSettingsContextValue | null>(null)

export function FooterSettingsProvider({ children }: { children: ReactNode }) {
  const value = useFooterSettings()
  return (
    <FooterSettingsContext.Provider value={value}>{children}</FooterSettingsContext.Provider>
  )
}

export function useFooterSettingsContext() {
  const context = useContext(FooterSettingsContext)
  if (!context) {
    throw new Error('useFooterSettingsContext must be used within FooterSettingsProvider')
  }
  return context
}
