import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRoot } from './AppRoot.tsx'
import { bootstrapOAuthFromUrl } from './utils/oauthBootstrap.ts'

bootstrapOAuthFromUrl()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)
