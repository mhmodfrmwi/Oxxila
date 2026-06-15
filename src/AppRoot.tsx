import { BrowserRouter } from 'react-router-dom'
import { OAuthCallbackHandler } from './components/auth/OAuthCallbackHandler'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import App from './App.tsx'
import './index.css'

export function AppRoot() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <OAuthCallbackHandler />
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
