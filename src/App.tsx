import { Navigate, Route, Routes } from 'react-router-dom'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyOtpPage } from './pages/VerifyOtpPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/forgot-password/verify" element={<VerifyOtpPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
    </Routes>
  )
}
