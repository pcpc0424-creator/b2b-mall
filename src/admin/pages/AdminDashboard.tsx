import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Megaphone,
  BarChart3,
} from 'lucide-react'
import { useOrders, useProducts, useMembers, usePromotions } from '../../hooks/queries'
import { Card, CardContent, Badge } from '../../components/ui'
import { formatPrice } from '../../lib/utils'
import { hasRealError } from '../../lib/errorUtils'

export function AdminDashboard() {
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useOrders()
  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts()
  const { data: members = [], isLoading: membersLoading, error: membersError } = useMembers()
  const { data: promotions = [], isLoading: promotionsLoading, error: promotionsError } = usePromotions()

  const isLoading = ordersLoading || productsLoading || membersLoading || promotionsLoading
  const hasError = hasRealError(ordersError, productsError, membersError, promotionsError)

  const dashboardStats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today)
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const lowStockProducts = products.filter(p => p.stockStatus === 'low' || p.stockStatus === 'out_of_stock').length
    const activePromotions = promotions.filter(p => p.isActive).length
    const nonWithdrawnMembers = members.filter(m => m.status !== 'withdrawn')
    const activeMembers = members.filter(m => m.status === 'active').length

    return {
      todayOrders: todayOrders.length,
      todayRevenue,
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      totalProducts: products.length,
      lowStockProducts,
      totalMembers: nonWithdrawnMembers.length,
      activeMembers,
      activePromotions,
    }
  }, [orders, products, members, promotions])

  const stats = [
    { label: '총 상품', value: dashboardStats.totalProducts, suffix: '개', icon: Package, color: 'bg-primary-500', link: '/admin/products' },
    { label: '총 회원', value: dashboardStats.totalMembers, suffix: '명', icon: Users, color: 'bg-green-500', link: '/admin/members' },
    { label: '총 주문', value: dashboardStats.totalOrders, suffix: '건', icon: ShoppingCart, color: 'bg-blue-500', link: '/admin/orders' },
    { label: '총 매출', value: formatPrice(dashboardStats.totalRevenue), suffix: '', icon: TrendingUp, color: 'bg-purple-500', link: '/admin/orders' },
  ]

  const subStats = [
    { label: '오늘 주문', value: dashboardStats.todayOrders, suffix: '건', icon: ShoppingCart, color: 'bg-sky-500', link: '/admin/orders' },
    { label: '오늘 매출', value: formatPrice(dashboardStats.todayRevenue), suffix: '', icon: BarChart3, color: 'bg-emerald-500', link: '/admin/orders' },
    { label: '대기 주문', value: dashboardStats.pendingOrders, suffix: '건', icon: AlertCircle, color: 'bg-amber-500', link: '/admin/orders' },
    { label: '재고부족', value: dashboardStats.lowStockProducts, suffix: '개', icon: Package, color: 'bg-red-500', link: '/admin/products' },
    { label: '활성 프로모션', value: dashboardStats.activePromotions, suffix: '개', icon: Megaphone, color: 'bg-pink-500', link: '/admin/promotions' },
    { label: '활성 회원', value: dashboardStats.activeMembers, suffix: '명', icon: Users, color: 'bg-teal-500', link: '/admin/members' },
  ]

  if (hasError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-neutral-900">대시보드</h1>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          데이터를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-neutral-900">대시보드</h1>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="p-3"><div className="h-10 bg-neutral-100 animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">대시보드</h1>
        <span className="text-sm text-neutral-500">실시간 현황 (Supabase 연동)</span>
      </div>

      {/* 주요 통계 - 모바일 2열, PC 4열 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.link}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-lg font-bold text-neutral-900">{stat.value}{stat.suffix}</span>
                    <span className="text-xs text-neutral-500 ml-1">{stat.label}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 세부 통계 - 모바일 2열, PC 3열 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {subStats.map((stat) => (
          <Link key={stat.label} to={stat.link}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${stat.color}`}>
                    <stat.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-neutral-900">{stat.value}{stat.suffix}</span>
                    <span className="text-xs text-neutral-500 ml-1">{stat.label}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 최근 주문 */}
      <Card>
        <CardContent className="p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-neutral-900">최근 주문</span>
            <Link to="/admin/orders" className="text-sm text-primary-600 flex items-center gap-1">
              전체 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => {
              const statusLabel: Record<string, string> = { pending: '대기', confirmed: '확인', preparing: '준비', shipped: '배송', delivered: '완료', cancelled: '취소', refunded: '환불' }
              const statusVariant: Record<string, 'warning' | 'primary' | 'secondary' | 'success' | 'error'> = { pending: 'warning', confirmed: 'primary', preparing: 'secondary', shipped: 'secondary', delivered: 'success', cancelled: 'error', refunded: 'error' }
              return (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary-600">{order.orderNumber}</span>
                    <span className="text-sm text-neutral-500">{order.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatPrice(order.totalAmount)}</span>
                    <Badge variant={statusVariant[order.status] || 'secondary'} size="sm">
                      {statusLabel[order.status] || order.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
            {orders.length === 0 && (
              <div className="text-center py-4 text-sm text-neutral-400">주문이 없습니다.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 최근 등록 상품 */}
      <Card>
        <CardContent className="p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-neutral-900">최근 등록 상품</span>
            <Link to="/admin/products" className="text-sm text-primary-600 flex items-center gap-1">
              전체 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div className="flex items-center gap-2">
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-neutral-900 block">{product.name}</span>
                    <span className="text-xs text-neutral-500">{product.sku}</span>
                  </div>
                </div>
                <span className="text-sm font-medium">{formatPrice(product.prices?.retail || 0)}</span>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-4 text-sm text-neutral-400">등록된 상품이 없습니다.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 빠른 작업 */}
      <Card>
        <CardContent className="p-3 overflow-hidden">
          <span className="font-bold text-neutral-900 block mb-3">빠른 작업</span>
          <div className="space-y-2">
            <Link to="/admin/products/new" className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg hover:bg-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary-100 rounded"><Package className="w-4 h-4 text-primary-600" /></div>
                <span className="text-sm font-medium">상품 등록</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>
            <Link to="/admin/orders" className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg hover:bg-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded"><ShoppingCart className="w-4 h-4 text-amber-600" /></div>
                <span className="text-sm font-medium">주문 처리</span>
                {dashboardStats.pendingOrders > 0 && (
                  <Badge variant="warning" size="sm">{dashboardStats.pendingOrders}건</Badge>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>
            <Link to="/admin/members" className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg hover:bg-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded"><Users className="w-4 h-4 text-green-600" /></div>
                <span className="text-sm font-medium">회원 관리</span>
                {dashboardStats.totalMembers > 0 && (
                  <Badge variant="secondary" size="sm">{dashboardStats.totalMembers}명</Badge>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>
            <Link to="/admin/promotions" className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg hover:bg-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-pink-100 rounded"><Megaphone className="w-4 h-4 text-pink-600" /></div>
                <span className="text-sm font-medium">프로모션 관리</span>
                {dashboardStats.activePromotions > 0 && (
                  <Badge variant="primary" size="sm">{dashboardStats.activePromotions}개</Badge>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>
            <Link to="/admin/settings/shipping" className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg hover:bg-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded"><TrendingUp className="w-4 h-4 text-blue-600" /></div>
                <span className="text-sm font-medium">배송 설정</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
