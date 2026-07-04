import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRoot } from './AppRoot.tsx'
import { bootstrapOAuthFromUrl } from './utils/oauthBootstrap.ts'
import './i18n'

bootstrapOAuthFromUrl()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)
