import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { migrateLocalStorageToSupabase } from './services/migration'
import { getCurrentUser, migrateLocalMembers } from './services/auth'
import { supabase } from './lib/supabase'
import { useStore } from './store'
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
  HomeSectionManagementPage,
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
  const { login, logout } = useStore()
  const migrationRan = useRef(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // 마이그레이션 (상품 + 회원)
  useEffect(() => {
    if (!migrationRan.current) {
      migrationRan.current = true
      migrateLocalStorageToSupabase().catch(console.error)
      migrateLocalMembers().catch(console.error)
    }
  }, [])

  // Supabase Auth 세션 복원 + 상태 리스너
  useEffect(() => {
    // 1. 현재 세션 확인 (새로고침 시 자동 로그인)
    const initSession = async () => {
      const result = await getCurrentUser()
      if (result.user) {
        login(result.user)
      } else {
        // 탈퇴/승인대기 회원인 경우 메시지 표시
        if (result.error) {
          setAuthError(result.error)
        }
        // Supabase 세션 없으면 store도 정리
        const storeState = useStore.getState()
        if (storeState.isLoggedIn) {
          logout()
        }
      }
    }
    initSession()

    // 2. Auth 상태 변경 리스너 (로그인/로그아웃/토큰 갱신)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        const result = await getCurrentUser()
        if (result.user) {
          login(result.user)
        } else if (result.error) {
          // 탈퇴/승인대기 회원인 경우 메시지 표시
          setAuthError(result.error)
        }
      } else if (event === 'SIGNED_OUT') {
        const storeState = useStore.getState()
        if (storeState.isLoggedIn) {
          // store만 정리 (supabase.auth.signOut는 이미 호출됨)
          useStore.setState({ user: null, isLoggedIn: false })
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <BrowserRouter basename="">
      <ScrollToTop />

      {/* 인증 오류 메시지 (탈퇴/승인대기 회원) */}
      {authError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 text-red-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-800">{authError}</p>
              </div>
              <button
                onClick={() => setAuthError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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
          <Route path="home-sections" element={<HomeSectionManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
