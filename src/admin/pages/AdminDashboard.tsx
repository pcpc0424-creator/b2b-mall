import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { useOrders, useProducts } from '../../hooks/queries'
import { Card, CardContent, Badge } from '../../components/ui'
import { formatPrice } from '../../lib/utils'

export function AdminDashboard() {
  const { data: orders = [] } = useOrders()
  const { data: products = [] } = useProducts()

  const dashboardStats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today)
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const lowStockProducts = products.filter(p => p.stockStatus === 'low' || p.stockStatus === 'out_of_stock').length

    return { todayOrders: todayOrders.length, todayRevenue, pendingOrders, lowStockProducts }
  }, [orders, products])

  const stats = [
    { label: '오늘 주문', value: dashboardStats.todayOrders, suffix: '건', icon: ShoppingCart, color: 'bg-primary-500', link: '/admin/orders' },
    { label: '오늘 매출', value: formatPrice(dashboardStats.todayRevenue), suffix: '', icon: TrendingUp, color: 'bg-green-500', link: '/admin/orders' },
    { label: '대기 주문', value: dashboardStats.pendingOrders, suffix: '건', icon: AlertCircle, color: 'bg-amber-500', link: '/admin/orders?status=pending' },
    { label: '재고부족', value: dashboardStats.lowStockProducts, suffix: '개', icon: Package, color: 'bg-red-500', link: '/admin/products?stock=low' },
  ]

  return (
    <div className="space-y-4">
      {/* Header - 한 줄 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">대시보드</h1>
        <span className="text-sm text-neutral-500">오늘의 현황</span>
      </div>

      {/* Stats - 모바일 2열, PC 4열 */}
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
            {orders.slice(0, 3).map((order) => {
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

      {/* 빠른 작업 - 한 줄씩 */}
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
                <Badge variant="warning" size="sm">{dashboardStats.pendingOrders}건</Badge>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>
            <Link to="/admin/members" className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg hover:bg-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded"><Users className="w-4 h-4 text-green-600" /></div>
                <span className="text-sm font-medium">회원 관리</span>
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
