import { Navigate, Route, Routes } from 'react-router-dom'
import { HOME_PATH, SHOP_PATH } from './config/routes'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ShopPage } from './pages/ShopPage'
import { VerifyOtpPage } from './pages/VerifyOtpPage'

export default function App() {
  return (
    <Routes>
      <Route path={HOME_PATH} element={<LandingPage />} />
      <Route path={SHOP_PATH} element={<ShopPage />} />
      <Route path="/" element={<Navigate to={HOME_PATH} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/forgot-password/verify" element={<VerifyOtpPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
    </Routes>
  )
}
