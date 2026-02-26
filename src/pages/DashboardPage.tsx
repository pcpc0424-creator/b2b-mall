import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, FileText, DollarSign, Package,
  ArrowRight, Loader2, AlertTriangle, MapPin
} from 'lucide-react'
import { useStore, getTierLabel, getTierColor } from '../store'
import { Button, Card, CardContent, Badge } from '../components/ui'
import { formatPrice, formatNumber, cn } from '../lib/utils'
import { Animated } from '../hooks'
import { useUserOrders, useProducts } from '../hooks/queries'
import { withdrawAccount } from '../services/auth'

export function DashboardPage() {
  const { user, logout } = useStore()
  const navigate = useNavigate()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const { data: orders = [] } = useUserOrders(user?.id)
  const { data: allProducts = [] } = useProducts()

  const handleWithdraw = async () => {
    if (!user) return
    setIsWithdrawing(true)
    const result = await withdrawAccount(user.id)
    if (result.success) {
      logout()
      navigate('/')
      alert('회원 탈퇴가 완료되었습니다.')
    } else {
      alert(result.error || '탈퇴 처리 중 오류가 발생했습니다.')
    }
    setIsWithdrawing(false)
    setShowWithdrawModal(false)
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">로그인이 필요합니다</h1>
        <Button>로그인</Button>
      </div>
    )
  }

  const tier = user.tier

  // 주문 데이터에서 통계 계산
  const totalOrders = orders.length
  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const avgOrderValue = totalOrders > 0 ? Math.round(totalAmount / totalOrders) : 0
  const shippingCount = orders.filter(o => o.status === 'shipped').length

  // 실제 구매한 상품 목록 (주문 내역에서 추출)
  const topProducts = (() => {
    const productCounts: Record<string, { product: typeof allProducts[0] | null, count: number }> = {}

    // 주문 내역에서 상품별 구매 횟수 집계
    orders.forEach(order => {
      if (order.status === 'cancelled' || order.status === 'refunded') return
      order.items.forEach(item => {
        if (!productCounts[item.productId]) {
          const product = allProducts.find(p => p.id === item.productId)
          productCounts[item.productId] = { product: product || null, count: 0 }
        }
        productCounts[item.productId].count += item.quantity
      })
    })

    // 구매 횟수 기준 정렬 후 상위 5개 반환
    return Object.values(productCounts)
      .filter(item => item.product !== null)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.product!)
  })()

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

      {/* Stats Cards */}
      <Animated animation="fade-up" delay={100}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-600" />
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
            <p className="text-2xl font-bold text-neutral-900">{shippingCount}건</p>
          </CardContent>
        </Card>
      </div>
      </Animated>

      <Animated animation="fade-up" delay={200}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-neutral-900 mb-4">빠른 메뉴</h2>
              <div className="space-y-2">
                <Link to="/orders" className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <span className="text-sm font-medium">주문 내역</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </Link>
                <Link to="/my/shipping-addresses" className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm font-medium">배송지 관리</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </Link>
              </div>
            </CardContent>
          </Card>
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
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
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
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">아직 구매한 상품이 없습니다.</p>
                  <Link to="/products">
                    <Button variant="outline" size="sm" className="mt-3">
                      쇼핑하러 가기
                    </Button>
                  </Link>
                </div>
              )}
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
              {orders.slice(0, 4).map((order) => {
                const statusLabel: Record<string, string> = {
                  pending: '주문접수', confirmed: '주문확인', preparing: '상품준비중',
                  shipped: '배송중', delivered: '배송완료', cancelled: '취소', refunded: '환불',
                }
                const isDelivered = order.status === 'delivered'
                // 주문 상품 이미지 가져오기
                const orderImages = order.items.slice(0, 3).map(item => {
                  const product = allProducts.find(p => p.id === item.productId)
                  return product?.images[0] || ''
                }).filter(Boolean)
                const moreCount = order.items.length - 3
                return (
                <Link key={order.id} to="/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="flex -space-x-2">
                    {orderImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt=""
                        className="w-10 h-10 rounded object-cover border-2 border-white"
                      />
                    ))}
                    {moreCount > 0 && (
                      <div className="w-10 h-10 rounded bg-neutral-100 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-neutral-500">+{moreCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString('ko-KR')} · {order.items.length}개 품목
                    </p>
                    <p className="text-sm font-bold text-neutral-900">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <Badge
                    variant={isDelivered ? 'success' : 'primary'}
                    size="sm"
                  >
                    {statusLabel[order.status] || order.status}
                  </Badge>
                </Link>
                )
              })}{orders.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-4">주문 내역이 없습니다.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </Animated>

      {/* 회원 탈퇴 */}
      <div className="mt-16 pt-8 border-t border-neutral-200">
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="text-sm text-neutral-400 hover:text-red-500 transition-colors"
        >
          회원 탈퇴
        </button>
      </div>

      {/* 탈퇴 확인 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">회원 탈퇴</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              정말 탈퇴하시겠습니까?
            </p>
            <ul className="text-xs text-neutral-500 space-y-1 mb-6 bg-neutral-50 rounded-lg p-3">
              <li>• 탈퇴 후 계정 복구가 불가능합니다.</li>
              <li>• 주문 내역, 쿠폰, 적립금이 모두 삭제됩니다.</li>
              <li>• 개인정보는 즉시 익명 처리됩니다.</li>
            </ul>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowWithdrawModal(false)}
                disabled={isWithdrawing}
              >
                취소
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-1" />처리 중</>
                ) : '탈퇴하기'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
