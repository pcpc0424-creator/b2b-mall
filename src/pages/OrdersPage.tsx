import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, XCircle, Search, Calendar } from 'lucide-react'
import { Badge, Card, Button } from '../components/ui'
import { Animated } from '../hooks'
import { cn } from '../lib/utils'
import { formatPrice } from '../lib/utils'

interface OrderItem {
  id: string
  productName: string
  productImage: string
  quantity: number
  price: number
  options?: string
}

interface Order {
  id: string
  orderNumber: string
  orderDate: Date
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  items: OrderItem[]
  totalAmount: number
  shippingAddress: string
  trackingNumber?: string
}

const orders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2024011501',
    orderDate: new Date('2024-01-15'),
    status: 'delivered',
    items: [
      {
        id: 'item-1',
        productName: '프리미엄 홍삼정과 선물세트',
        productImage: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=100&h=100&fit=crop',
        quantity: 10,
        price: 79000,
        options: '기본구성 / 박스(10개입)'
      },
      {
        id: 'item-2',
        productName: '6년근 홍삼 농축액 세트',
        productImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&h=100&fit=crop',
        quantity: 5,
        price: 135000
      }
    ],
    totalAmount: 1465000,
    shippingAddress: '서울시 강남구 테헤란로 123 ABC빌딩 5층',
    trackingNumber: '1234567890'
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2024011401',
    orderDate: new Date('2024-01-14'),
    status: 'shipping',
    items: [
      {
        id: 'item-3',
        productName: '명품 견과류 선물세트',
        productImage: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=100&h=100&fit=crop',
        quantity: 20,
        price: 40000
      }
    ],
    totalAmount: 800000,
    shippingAddress: '서울시 강남구 테헤란로 123 ABC빌딩 5층',
    trackingNumber: '0987654321'
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-2024011301',
    orderDate: new Date('2024-01-13'),
    status: 'confirmed',
    items: [
      {
        id: 'item-4',
        productName: '프리미엄 스킨케어 4종 세트',
        productImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop',
        quantity: 15,
        price: 115000,
        options: '건성 / 대용량'
      }
    ],
    totalAmount: 1725000,
    shippingAddress: '서울시 강남구 테헤란로 123 ABC빌딩 5층'
  },
  {
    id: 'order-4',
    orderNumber: 'ORD-2024011001',
    orderDate: new Date('2024-01-10'),
    status: 'cancelled',
    items: [
      {
        id: 'item-5',
        productName: '제주 감귤 선물세트 5kg',
        productImage: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=100&h=100&fit=crop',
        quantity: 30,
        price: 49500
      }
    ],
    totalAmount: 1485000,
    shippingAddress: '서울시 강남구 테헤란로 123 ABC빌딩 5층'
  }
]

const statusConfig = {
  pending: { label: '결제대기', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: '결제완료', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  shipping: { label: '배송중', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: '배송완료', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: '주문취소', color: 'bg-red-100 text-red-700', icon: XCircle }
}

export function OrdersPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const statusFilters = [
    { id: 'all', label: '전체' },
    { id: 'pending', label: '결제대기' },
    { id: 'confirmed', label: '결제완료' },
    { id: 'shipping', label: '배송중' },
    { id: 'delivered', label: '배송완료' },
    { id: 'cancelled', label: '취소' }
  ]

  const filteredOrders = orders.filter(order => {
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

      {/* Order List */}
      <Animated animation="fade-up" delay={200}>
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id
            const StatusIcon = statusConfig[order.status].icon

            return (
              <Card key={order.id} className="overflow-hidden">
                {/* Order Header */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={order.items[0].productImage}
                        alt={order.items[0].productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                          statusConfig[order.status].color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-neutral-900">
                        {order.items[0].productName}
                        {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {order.orderNumber} · {formatDate(order.orderDate)}
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
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                              {item.productName}
                            </p>
                            {item.options && (
                              <p className="text-xs text-neutral-500">{item.options}</p>
                            )}
                            <p className="text-xs text-neutral-500">
                              {formatPrice(item.price)} × {item.quantity}개
                            </p>
                          </div>
                          <p className="text-sm font-medium text-neutral-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Info */}
                    <div className="p-4 border-t border-neutral-100 bg-neutral-50">
                      <div className="flex items-start gap-2 mb-2">
                        <Truck className="w-4 h-4 text-neutral-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700">배송지</p>
                          <p className="text-sm text-neutral-600">{order.shippingAddress}</p>
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
              <p className="text-neutral-500">주문내역이 없습니다.</p>
              <Link to="/products">
                <Button className="mt-4">쇼핑하러 가기</Button>
              </Link>
            </Card>
          )}
        </div>
      </Animated>
    </div>
  )
}
