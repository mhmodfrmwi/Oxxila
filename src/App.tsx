// src/App.tsx
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import {
  ACCOUNT_CHANGE_PASSWORD_PATH,
  ACCOUNT_ORDERS_PATH,
  ADD_ADDRESS_PATH,
  ADDRESSES_PATH,
  CART_PATH,
  CATEGORIES_PATH,
  CHANGE_PASSWORD_PATH,
  CHECKOUT_PATH,
  DOCS_PATH,
  FORGOT_PASSWORD_PATH,
  HOME_PATH,
  LOGIN_PATH,
  MY_ACCOUNT_PATH,
  ORDER_CONFIRMATION_PATH,
  PAYMENT_PATH,
  PAYMENT_CALLBACK_PATH,
  PAYMENT_CALLBACK_PREVIEW_PATH,
  PRODUCTS_PATH,
  REGISTER_PATH,
  RESET_PASSWORD_PATH,
  COLLECTIONS_PATH,
  SEARCH_PATH,
  SHOP_PATH,
  TRACK_ORDER_PATH,
  VERIFY_OTP_PATH,
  RETURNS_PATH,
  RETURNS_HISTORY_PATH,
  WISHLIST_PATH,
  ADMIN_PATH,
} from './config/routes'
import { RouteFallback } from './components/ui/RouteFallback'
import { RequireAdmin } from './components/admin/RequireAdmin'
import { AdminLayout } from './components/admin/layout/AdminLayout'

const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })),
)
const DocsPage = lazy(() =>
  import('./pages/DocsPage').then((module) => ({ default: module.DocsPage })),
)
const ShopPage = lazy(() =>
  import('./pages/ShopPage').then((module) => ({ default: module.ShopPage })),
)
const CartPage = lazy(() =>
  import('./pages/CartPage').then((module) => ({ default: module.CartPage })),
)
const AccountPage = lazy(() =>
  import('./pages/AccountPage').then((module) => ({ default: module.AccountPage })),
)
const AccountOrdersPage = lazy(() =>
  import('./pages/AccountOrdersPage').then((module) => ({
    default: module.AccountOrdersPage,
  })),
)
const AccountChangePasswordPage = lazy(() =>
  import('./pages/AccountChangePasswordPage').then((module) => ({
    default: module.AccountChangePasswordPage,
  })),
)
const AddressesPage = lazy(() =>
  import('./pages/AddressesPage').then((module) => ({ default: module.AddressesPage })),
)
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })),
)
const PaymentPage = lazy(() =>
  import('./pages/PaymentPage').then((module) => ({ default: module.PaymentPage })),
)
const PaymentCallbackPage = lazy(() =>
  import('./pages/PaymentCallbackPage').then((module) => ({
    default: module.PaymentCallbackPage,
  })),
)
const PaymentCallbackPreviewPage = lazy(() =>
  import('./pages/PaymentCallbackPreviewPage').then((module) => ({
    default: module.PaymentCallbackPreviewPage,
  })),
)
const OrderConfirmationPage = lazy(() =>
  import('./pages/OrderConfirmationPage').then((module) => ({
    default: module.OrderConfirmationPage,
  })),
)
const TrackOrderPage = lazy(() =>
  import('./pages/TrackOrderPage').then((module) => ({ default: module.TrackOrderPage })),
)
const AddAddressPage = lazy(() =>
  import('./pages/AddAddressPage').then((module) => ({ default: module.AddAddressPage })),
)
const SearchPage = lazy(() =>
  import('./pages/SearchPage').then((module) => ({ default: module.SearchPage })),
)
const CategoriesPage = lazy(() =>
  import('./pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })),
)
const CategoryPage = lazy(() =>
  import('./pages/CategoryPage').then((module) => ({ default: module.CategoryPage })),
)
const CollectionPage = lazy(() =>
  import('./pages/CollectionPage').then((module) => ({ default: module.CollectionPage })),
)
const ProductPage = lazy(() =>
  import('./pages/ProductPage').then((module) => ({ default: module.ProductPage })),
)
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('./pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })),
)
const VerifyOtpPage = lazy(() =>
  import('./pages/VerifyOtpPage').then((module) => ({ default: module.VerifyOtpPage })),
)
const ChangePasswordPage = lazy(() =>
  import('./pages/ChangePasswordPage').then((module) => ({ default: module.ChangePasswordPage })),
)
const ReturnsPage = lazy(() =>
  import('./pages/ReturnsPage').then((module) => ({ default: module.ReturnsPage })),
)
const ReturnsHistoryPage = lazy(() =>
  import('./pages/ReturnsHistoryPage').then((module) => ({
    default: module.ReturnsHistoryPage,
  })),
)
const WishlistPage = lazy(() =>
  import('./pages/WishlistPage').then((module) => ({
    default: module.WishlistPage,
  })),
)
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
)
const AdminProductsPage = lazy(() =>
  import('./pages/admin/AdminProductsPage').then((module) => ({
    default: module.AdminProductsPage,
  })),
)
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminOrdersPage').then((module) => ({
    default: module.AdminOrdersPage,
  })),
)
const AdminCustomersPage = lazy(() =>
  import('./pages/admin/AdminCustomersPage').then((module) => ({
    default: module.AdminCustomersPage,
  })),
)
const AdminReviewsPage = lazy(() =>
  import('./pages/admin/AdminReviewsPage').then((module) => ({
    default: module.AdminReviewsPage,
  })),
)
const AdminShippingPage = lazy(() =>
  import('./pages/admin/AdminShippingPage').then((module) => ({
    default: module.AdminShippingPage,
  })),
)
const AdminSettingsPage = lazy(() =>
  import('./pages/admin/AdminSettingsPage').then((module) => ({
    default: module.AdminSettingsPage,
  })),
)

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path={HOME_PATH} element={<LandingPage />} />
        <Route path={DOCS_PATH} element={<DocsPage />} />
        <Route path={SHOP_PATH} element={<ShopPage />} />
        <Route path={CART_PATH} element={<CartPage />} />
        <Route path={MY_ACCOUNT_PATH} element={<AccountPage />} />
        <Route path={ACCOUNT_ORDERS_PATH} element={<AccountOrdersPage />} />
        <Route path={ADDRESSES_PATH} element={<AddressesPage />} />
        <Route
          path={ACCOUNT_CHANGE_PASSWORD_PATH}
          element={<AccountChangePasswordPage />}
        />
        <Route path={CHECKOUT_PATH} element={<CheckoutPage />} />
        <Route path={PAYMENT_PATH} element={<PaymentPage />} />
        <Route path={PAYMENT_CALLBACK_PREVIEW_PATH} element={<PaymentCallbackPreviewPage />} />
        <Route path={PAYMENT_CALLBACK_PATH} element={<PaymentCallbackPage />} />
        <Route path={`${ORDER_CONFIRMATION_PATH}/:orderId`} element={<OrderConfirmationPage />} />
        <Route path={`${TRACK_ORDER_PATH}/:orderId`} element={<TrackOrderPage />} />
        <Route path={ADD_ADDRESS_PATH} element={<AddAddressPage />} />
        <Route path={SEARCH_PATH} element={<SearchPage />} />
        <Route path={CATEGORIES_PATH} element={<CategoriesPage />} />
        <Route path={`${CATEGORIES_PATH}/:slug`} element={<CategoryPage />} />
        <Route path={`${COLLECTIONS_PATH}/:slug`} element={<CollectionPage />} />
        <Route path={`${PRODUCTS_PATH}/:slug`} element={<ProductPage />} />
        <Route path="/" element={<Navigate to={HOME_PATH} replace />} />
        <Route path={LOGIN_PATH} element={<LoginPage />} />
        <Route path={REGISTER_PATH} element={<RegisterPage />} />
        <Route path={FORGOT_PASSWORD_PATH} element={<ForgotPasswordPage />} />
        <Route path={VERIFY_OTP_PATH} element={<VerifyOtpPage />} />
        <Route path={`${RESET_PASSWORD_PATH}/:token`} element={<ChangePasswordPage />} />
        <Route path={CHANGE_PASSWORD_PATH} element={<ChangePasswordPage />} />
        <Route path={RETURNS_PATH} element={<ReturnsPage />} />
        <Route path={RETURNS_HISTORY_PATH} element={<ReturnsHistoryPage />} />
        <Route path={WISHLIST_PATH} element={<WishlistPage />} />

        <Route
          path={ADMIN_PATH}
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="shipping" element={<AdminShippingPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
