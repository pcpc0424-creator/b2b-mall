import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
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
} from './pages'

// Admin imports
import { AdminLayout } from './admin/components/layout'
import { AdminAuthGuard } from './admin/components/AdminAuthGuard'
import {
  AdminLoginPage,
  AdminDashboard,
  ProductManagementPage,
  ProductEditPage,
  ShippingSettingsPage,
  OrderManagementPage,
  MemberManagementPage,
} from './admin/pages'

function App() {
  return (
    <BrowserRouter basename="/b2b-mall">
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:categoryId" element={<ProductListPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/promotion/:promoId" element={<PromotionDetailPage />} />
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
          <Route path="orders" element={<OrderManagementPage />} />
          <Route path="members" element={<MemberManagementPage />} />
          <Route path="settings/shipping" element={<ShippingSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
