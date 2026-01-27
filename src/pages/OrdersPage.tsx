import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, XCircle, Search, RefreshCw, Loader2 } from 'lucide-react'
import { Card, Button } from '../components/ui'
import { Animated } from '../hooks'
import { cn } from '../lib/utils'
import { formatPrice } from '../lib/utils'
import { useStore } from '../store'
import { useUserOrders } from '../hooks/queries'
import type { Order, OrderStatus } from '../admin/types/admin'

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending:    { label: '결제대기', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed:  { label: '결제완료', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  preparing:  { label: '상품준비중', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  shipped:    { label: '배송중', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered:  { label: '배송완료', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled:  { label: '주문취소', color: 'bg-red-100 text-red-700', icon: XCircle },
  refunded:   { label: '환불완료', color: 'bg-neutral-100 text-neutral-700', icon: RefreshCw },
}

const statusFilters = [
  { id: 'all', label: '전체' },
  { id: 'pending', label: '결제대기' },
  { id: 'confirmed', label: '결제완료' },
  { id: 'preparing', label: '상품준비중' },
  { id: 'shipped', label: '배송중' },
  { id: 'delivered', label: '배송완료' },
  { id: 'cancelled', label: '취소' },
]

export function OrdersPage() {
  const { user } = useStore()
  const { data: orders = [], isLoading, error } = useUserOrders(user?.id)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrders = orders.filter((order: Order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesSearch = searchTerm === '' ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center">
          <Link to="/" className="hover:text-primary-600">홈</Link>
          <span className="mx-2">/</span>
          <Link to="/dashboard" className="hover:text-primary-600">마이페이지</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-medium">주문내역</span>
        </nav>
      </Animated>

      {/* Header */}
      <Animated animation="fade-up" delay={100}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">주문내역</h1>
          <p className="text-neutral-500">주문하신 상품의 배송 현황을 확인하세요</p>
        </div>
      </Animated>

      {/* Search & Filter */}
      <Animated animation="fade-up" delay={150}>
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="주문번호 또는 상품명 검색"
              className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  statusFilter === filter.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </Animated>

      {/* Loading */}
      {isLoading && (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-500">주문내역을 불러오는 중...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="p-8 text-center">
          <XCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <p className="text-red-600 mb-2">주문내역을 불러오지 못했습니다.</p>
          <p className="text-neutral-500 text-sm">잠시 후 다시 시도해주세요.</p>
        </Card>
      )}

      {/* Order List */}
      {!isLoading && !error && (
        <Animated animation="fade-up" delay={200}>
          <div className="space-y-4">
            {filteredOrders.map((order: Order) => {
              const isExpanded = expandedId === order.id
              const config = statusConfig[order.status] || statusConfig.pending
              const StatusIcon = config.icon

              return (
                <Card key={order.id} className="overflow-hidden">
                  {/* Order Header */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 flex items-center justify-center">
                        <Package className="w-8 h-8 text-neutral-400" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                            config.color
                          )}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-neutral-900">
                          {order.items[0]?.productName || '주문 상품'}
                          {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {order.orderNumber} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <p className="text-lg font-bold text-neutral-900">
                        {formatPrice(order.totalAmount)}
                      </p>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                  </button>

                  {/* Order Details */}
                  {isExpanded && (
                    <div className="border-t border-neutral-100">
                      {/* Items */}
                      <div className="p-4 space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                            <div className="w-12 h-12 rounded bg-neutral-200 flex items-center justify-center flex-shrink-0">
                              <Package className="w-6 h-6 text-neutral-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 truncate">
                                {item.productName}
                              </p>
                              {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                <p className="text-xs text-neutral-500">
                                  {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                                </p>
                              )}
                              <p className="text-xs text-neutral-500">
                                {formatPrice(item.unitPrice)} × {item.quantity}개
                              </p>
                            </div>
                            <p className="text-sm font-medium text-neutral-900">
                              {formatPrice(item.subtotal)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="p-4 border-t border-neutral-100 bg-neutral-50">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">상품 금액</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">배송비</span>
                            <span>{order.shippingFee === 0 ? '무료' : formatPrice(order.shippingFee)}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t border-neutral-200 pt-2">
                            <span>총 결제금액</span>
                            <span className="text-primary-600">{formatPrice(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Info */}
                      {order.shippingAddress && order.shippingAddress.address1 && (
                        <div className="p-4 border-t border-neutral-100">
                          <div className="flex items-start gap-2 mb-2">
                            <Truck className="w-4 h-4 text-neutral-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-neutral-700">배송지</p>
                              <p className="text-sm text-neutral-600">
                                {order.shippingAddress.address1}
                                {order.shippingAddress.address2 && ` ${order.shippingAddress.address2}`}
                              </p>
                              {order.shippingAddress.recipient && (
                                <p className="text-xs text-neutral-500 mt-1">
                                  {order.shippingAddress.recipient} / {order.shippingAddress.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          {order.trackingNumber && (
                            <div className="flex items-center gap-2 mt-3">
                              <p className="text-xs text-neutral-500">
                                운송장번호: <span className="font-mono">{order.trackingNumber}</span>
                              </p>
                              <Button variant="outline" size="sm" className="text-xs h-7">
                                배송조회
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="p-4 border-t border-neutral-100 flex flex-wrap gap-2">
                        {order.status === 'delivered' && (
                          <>
                            <Button variant="outline" size="sm">재주문</Button>
                            <Button variant="outline" size="sm">리뷰작성</Button>
                          </>
                        )}
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                            주문취소
                          </Button>
                        )}
                        <Button variant="outline" size="sm">세금계산서</Button>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}

            {filteredOrders.length === 0 && (
              <Card className="p-12 text-center">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">
                  {orders.length === 0 ? '주문내역이 없습니다.' : '검색 결과가 없습니다.'}
                </p>
                {orders.length === 0 && (
                  <Link to="/products">
                    <Button className="mt-4">쇼핑하러 가기</Button>
                  </Link>
                )}
              </Card>
            )}
          </div>
        </Animated>
      )}
    </div>
  )
}
