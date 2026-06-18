import { useContext } from 'react'
import { LandingCatalogContext } from '../context/LandingCatalogContext'

export function useLandingCatalogContext() {
  const context = useContext(LandingCatalogContext)
  if (!context) {
    throw new Error('useLandingCatalogContext must be used within LandingCatalogProvider')
  }
  return context
}
