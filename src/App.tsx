import { Navigate, Route, Routes } from 'react-router-dom'
import { CATEGORIES_PATH, HOME_PATH, PRODUCTS_PATH, SHOP_PATH } from './config/routes'
import { CategoryIndexRedirect } from './components/category/CategoryIndexRedirect'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { CategoryPage } from './pages/CategoryPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { ProductPage } from './pages/ProductPage'
import { RegisterPage } from './pages/RegisterPage'
import { SearchPage } from './pages/SearchPage'
import { ShopPage } from './pages/ShopPage'
import { VerifyOtpPage } from './pages/VerifyOtpPage'

export default function App() {
  return (
    <Routes>
      <Route path={HOME_PATH} element={<LandingPage />} />
      <Route path={SHOP_PATH} element={<ShopPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path={CATEGORIES_PATH} element={<CategoryIndexRedirect />} />
      <Route path={`${CATEGORIES_PATH}/:slug`} element={<CategoryPage />} />
      <Route path={`${PRODUCTS_PATH}/:slug`} element={<ProductPage />} />
      <Route path="/" element={<Navigate to={HOME_PATH} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/forgot-password/verify" element={<VerifyOtpPage />} />
      <Route path="/reset-password/:token" element={<ChangePasswordPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
    </Routes>
  )
}
