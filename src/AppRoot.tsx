import { BrowserRouter } from 'react-router-dom'
import { OAuthCallbackHandler } from './components/auth/OAuthCallbackHandler'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { LandingCatalogProvider } from './context/LandingCatalogContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import App from './App.tsx'
import './index.css'

export function AppRoot() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <LandingCatalogProvider>
                <OAuthCallbackHandler />
                <App />
              </LandingCatalogProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
