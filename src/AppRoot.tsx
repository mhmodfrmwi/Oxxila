import { BrowserRouter } from 'react-router-dom'
import { OAuthCallbackHandler } from './components/auth/OAuthCallbackHandler'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { LandingCatalogProvider } from './context/LandingCatalogContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { WishlistProvider } from './context/WishlistContext'
import App from './App.tsx'
import './index.css'

export function AppRoot() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <LandingCatalogProvider>
                  <OAuthCallbackHandler />
                  <App />
                </LandingCatalogProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
