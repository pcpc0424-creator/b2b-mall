import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
import {
  HomePage,
  ProductListPage,
  ProductDetailPage,
  QuickOrderPage,
  QuotePage,
  CartPage,
  DashboardPage,
  AnalyticsPage,
} from './pages'

function App() {
  return (
    <BrowserRouter basename="/b2b-mall">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/category/:categoryId" element={<ProductListPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/quick-order" element={<QuickOrderPage />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
