import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { migrateLocalStorageToSupabase } from './services/migration'
import { Layout } from './components/layout'
import { AuthGuard } from './components/auth'
import {
  HomePage,
  ProductListPage,
  ProductDetailPage,
  QuotePage,
  CartPage,
  DashboardPage,
  AnalyticsPage,
  CategoriesPage,
  LoginPage,
  RegisterPage,
  PromotionsPage,
  PromotionDetailPage,
  NoticePage,
  FAQPage,
  QnAPage,
  ExclusivePage,
  OrdersPage,
  ForgotPasswordPage,
  PaymentSuccessPage,
  PaymentFailPage,
  MyCouponsPage,
} from './pages'

// Admin imports
import { AdminLayout } from './admin/components/layout'
import { AdminAuthGuard } from './admin/components/AdminAuthGuard'
import {
  AdminLoginPage,
  AdminDashboard,
  ProductManagementPage,
  ProductEditPage,
  PromotionManagementPage,
  ShippingSettingsPage,
  OrderManagementPage,
  MemberManagementPage,
  TierSettingsPage,
  ModalManagementPage,
  BannerSettingsPage,
} from './admin/pages'

// 페이지 전환 시 스크롤을 상단으로 이동
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  const migrationRan = useRef(false)
  useEffect(() => {
    if (!migrationRan.current) {
      migrationRan.current = true
      migrateLocalStorageToSupabase().catch(console.error)
    }
  }, [])

  return (
    <BrowserRouter basename="">
      <ScrollToTop />
      <Routes>
        {/* Public Routes - 비로그인 접근 가능 */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:categoryId" element={<ProductListPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/promotion/:promoId" element={<PromotionDetailPage />} />
          <Route path="/community/notice" element={<NoticePage />} />
          <Route path="/community/faq" element={<FAQPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes - 회원 전용 (로그인 필수) */}
          <Route path="/quote" element={<AuthGuard><QuotePage /></AuthGuard>} />
          <Route path="/cart" element={<AuthGuard><CartPage /></AuthGuard>} />
          <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
          <Route path="/analytics" element={<AuthGuard><AnalyticsPage /></AuthGuard>} />
          <Route path="/community/qna" element={<AuthGuard><QnAPage /></AuthGuard>} />
          <Route path="/exclusive" element={<AuthGuard><ExclusivePage /></AuthGuard>} />
          <Route path="/orders" element={<AuthGuard><OrdersPage /></AuthGuard>} />
          <Route path="/payment/success" element={<AuthGuard><PaymentSuccessPage /></AuthGuard>} />
          <Route path="/payment/fail" element={<AuthGuard><PaymentFailPage /></AuthGuard>} />
          <Route path="/my/coupons" element={<AuthGuard><MyCouponsPage /></AuthGuard>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminAuthGuard>
              <AdminLayout />
            </AdminAuthGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagementPage />} />
          <Route path="products/new" element={<ProductEditPage />} />
          <Route path="products/:id/edit" element={<ProductEditPage />} />
          <Route path="promotions" element={<PromotionManagementPage />} />
          <Route path="orders" element={<OrderManagementPage />} />
          <Route path="members" element={<MemberManagementPage />} />
          <Route path="settings/shipping" element={<ShippingSettingsPage />} />
          <Route path="settings/tiers" element={<TierSettingsPage />} />
          <Route path="settings/modals" element={<ModalManagementPage />} />
          <Route path="settings/banner" element={<BannerSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
