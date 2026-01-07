import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, ShoppingBag, FileText, DollarSign, Package,
  Download, Calendar, ArrowRight, Gift, Star, Clock
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useStore, getTierLabel, getTierColor } from '../store'
import { mockSalesData, products, promotions } from '../data'
import { Button, Card, CardContent, Badge, Select, Tabs } from '../components/ui'
import { formatPrice, formatNumber, cn } from '../lib/utils'
import { Animated } from '../hooks'

export function DashboardPage() {
  const { user } = useStore()
  const [period, setPeriod] = useState('month')

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">로그인이 필요합니다</h1>
        <Button>로그인</Button>
      </div>
    )
  }

  const tier = user.tier

  // Summary stats
  const totalOrders = 127
  const totalAmount = mockSalesData.reduce((sum, d) => sum + d.amount, 0)
  const avgOrderValue = Math.round(totalAmount / totalOrders)
  const lastMonthAmount = mockSalesData[mockSalesData.length - 2]?.amount || 0
  const currentMonthAmount = mockSalesData[mockSalesData.length - 1]?.amount || 0
  const growthPercent = lastMonthAmount > 0 ? Math.round(((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100) : 0

  // Top products
  const topProducts = products.slice(0, 5)

  // User tier benefits
  const tierBenefits = {
    vip: ['모든 상품 10% 추가 할인', '무료 배송', '전용 기획전 참여', '우선 배송'],
    wholesale: ['모든 상품 20% 추가 할인', '무료 배송', '전용 단가표', '대량주문 추가할인', '전담 매니저'],
    partner: ['모든 상품 최대 30% 할인', '무료 배송', '파트너 전용 단가', '매출 리포트', '전담 매니저', 'API 연동'],
  }

  const currentBenefits = tierBenefits[tier as keyof typeof tierBenefits] || []

  const exclusivePromotions = promotions.filter(p => p.targetTiers.includes(tier) && p.type === 'exclusive')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <Animated animation="fade-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">마이페이지</h1>
            <p className="text-neutral-500 mt-1">{user.company && `${user.company} · `}{user.name}님</p>
          </div>
          <div className={cn('px-4 py-2 rounded-lg', getTierColor(tier))}>
            <span className="font-bold">{getTierLabel(tier)}</span>
            <span className="ml-2 text-sm">회원</span>
          </div>
        </div>
      </Animated>

      {/* VIP+ Banner */}
      {(tier === 'vip' || tier === 'wholesale' || tier === 'partner') && (
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5" />
                <span className="font-bold">{getTierLabel(tier)} 전용 혜택</span>
              </div>
              <ul className="text-sm space-y-1 opacity-90">
                {currentBenefits.slice(0, 3).map((benefit, i) => (
                  <li key={i}>• {benefit}</li>
                ))}
              </ul>
            </div>
            <Link to="/exclusive">
              <Button className="bg-white text-amber-600 hover:bg-amber-50">
                전용 혜택 보기
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <Animated animation="fade-up" delay={100}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                growthPercent >= 0 ? 'text-success' : 'text-error'
              )}>
                {growthPercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {growthPercent}%
              </div>
            </div>
            <p className="text-sm text-neutral-500">총 주문금액</p>
            <p className="text-2xl font-bold text-neutral-900">{formatPrice(totalAmount)}</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-secondary-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-500">주문 건수</p>
            <p className="text-2xl font-bold text-neutral-900">{formatNumber(totalOrders)}건</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-500">평균 주문금액</p>
            <p className="text-2xl font-bold text-neutral-900">{formatPrice(avgOrderValue)}</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-500">배송 중</p>
            <p className="text-2xl font-bold text-neutral-900">3건</p>
          </CardContent>
        </Card>
      </div>
      </Animated>

      <Animated animation="fade-up" delay={200}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-neutral-900">매출 추이</h2>
                <Select
                  options={[
                    { value: 'week', label: '주간' },
                    { value: 'month', label: '월간' },
                    { value: 'quarter', label: '분기' },
                  ]}
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-24"
                />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockSalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis
                      tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                      tick={{ fontSize: 12 }}
                      stroke="#6B7280"
                    />
                    <Tooltip
                      formatter={(value) => [formatPrice(Number(value)), '매출']}
                      contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={{ fill: '#2563EB', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-neutral-900 mb-4">빠른 메뉴</h2>
              <div className="space-y-2">
                <Link to="/quick-order" className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <span className="text-sm font-medium">빠른 주문</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </Link>
                <Link to="/quote" className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <span className="text-sm font-medium">견적서 관리</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </Link>
                <Link to="/orders" className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <span className="text-sm font-medium">주문 내역</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </Link>
                <Link to="/analytics" className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <span className="text-sm font-medium">매출 분석</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Exclusive Promotions */}
          {exclusivePromotions.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5 text-amber-600" />
                  <h2 className="font-bold text-neutral-900">{getTierLabel(tier)} 전용 기획전</h2>
                </div>
                <div className="space-y-3">
                  {exclusivePromotions.slice(0, 2).map((promo) => (
                    <div key={promo.id} className="p-3 bg-white rounded-lg">
                      <Badge variant="warning" size="sm" className="mb-2">{promo.discount}% OFF</Badge>
                      <p className="font-medium text-sm text-neutral-900">{promo.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </Animated>

      {/* Top Products & Recent Orders */}
      <Animated animation="fade-up" delay={300}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Top Products */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-neutral-900">자주 구매한 상품</h2>
              <Link to="/products" className="text-sm text-primary-600 hover:text-primary-700">
                전체보기
              </Link>
            </div>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-lg font-bold text-neutral-300 w-6">{index + 1}</span>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{product.name}</p>
                    <p className="text-xs text-neutral-500">{product.sku}</p>
                  </div>
                  <Button size="sm" variant="outline">재주문</Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-neutral-900">최근 주문</h2>
              <Link to="/orders" className="text-sm text-primary-600 hover:text-primary-700">
                전체보기
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { id: 'ORD-001', date: '2024-01-20', amount: 1250000, status: '배송완료', items: 5 },
                { id: 'ORD-002', date: '2024-01-18', amount: 890000, status: '배송중', items: 3 },
                { id: 'ORD-003', date: '2024-01-15', amount: 2100000, status: '배송완료', items: 8 },
                { id: 'ORD-004', date: '2024-01-10', amount: 560000, status: '배송완료', items: 2 },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{order.id}</p>
                    <p className="text-xs text-neutral-500">{order.date} · {order.items}개 품목</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900">{formatPrice(order.amount)}</p>
                    <Badge
                      variant={order.status === '배송완료' ? 'success' : 'primary'}
                      size="sm"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </Animated>
    </div>
  )
}
