import { useState, useEffect } from 'react'
import { Search, Eye, ChevronDown } from 'lucide-react'
import { useAdminStore } from '../store/adminStore'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import { formatPrice, cn } from '../../lib/utils'
import { Order, OrderStatus } from '../types/admin'

const mockOrders: Order[] = [
  {
    id: 'ord-1', orderNumber: 'ORD-2024-001', userId: 'user-1',
    user: { id: 'user-1', name: '김철수', email: 'kim@example.com', company: '(주)테스트', tier: 'vip' },
    items: [{ id: 'item-1', productId: 'p1', productName: '프리미엄 홍삼정과 선물세트', productSku: 'GF-001', quantity: 2, unitPrice: 89000, subtotal: 178000 }],
    subtotal: 178000, shippingFee: 0, totalAmount: 178000, status: 'pending', paymentStatus: 'paid', paymentMethod: '카드결제',
    shippingAddress: { recipient: '김철수', phone: '010-1234-5678', postalCode: '12345', address1: '서울시 강남구 테헤란로 123' },
    createdAt: new Date('2024-01-15'), updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'ord-2', orderNumber: 'ORD-2024-002', userId: 'user-2',
    user: { id: 'user-2', name: '이영희', email: 'lee@example.com', tier: 'member' },
    items: [{ id: 'item-2', productId: 'p2', productName: '유기농 과일청 3종 세트', productSku: 'HF-001', quantity: 1, unitPrice: 45000, subtotal: 45000 }],
    subtotal: 45000, shippingFee: 3000, totalAmount: 48000, status: 'confirmed', paymentStatus: 'paid', paymentMethod: '무통장입금',
    shippingAddress: { recipient: '이영희', phone: '010-2345-6789', postalCode: '54321', address1: '부산시 해운대구 해운대로 456' },
    createdAt: new Date('2024-01-14'), updatedAt: new Date('2024-01-14'),
  },
  {
    id: 'ord-3', orderNumber: 'ORD-2024-003', userId: 'user-3',
    user: { id: 'user-3', name: '박지민', email: 'park@example.com', company: '지민상사', tier: 'premium' },
    items: [{ id: 'item-3', productId: 'p3', productName: '프리미엄 견과류 선물세트', productSku: 'NT-001', quantity: 10, unitPrice: 35000, subtotal: 350000 }],
    subtotal: 350000, shippingFee: 0, totalAmount: 350000, status: 'shipped', paymentStatus: 'paid', paymentMethod: '카드결제',
    shippingAddress: { recipient: '박지민', phone: '010-3456-7890', postalCode: '67890', address1: '대구시 수성구 범어로 789' },
    trackingNumber: '1234567890', createdAt: new Date('2024-01-13'), updatedAt: new Date('2024-01-14'),
  },
  {
    id: 'ord-4', orderNumber: 'ORD-2024-004', userId: 'user-4',
    user: { id: 'user-4', name: '최수진', email: 'choi@example.com', tier: 'member' },
    items: [{ id: 'item-4', productId: 'p4', productName: '수제 잼 & 스프레드 세트', productSku: 'JS-001', quantity: 3, unitPrice: 28000, subtotal: 84000 }],
    subtotal: 84000, shippingFee: 3000, totalAmount: 87000, status: 'delivered', paymentStatus: 'paid', paymentMethod: '카드결제',
    shippingAddress: { recipient: '최수진', phone: '010-4567-8901', postalCode: '11111', address1: '인천시 연수구 센트럴로 111' },
    createdAt: new Date('2024-01-10'), updatedAt: new Date('2024-01-12'),
  },
]

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'warning' | 'primary' | 'secondary' | 'success' | 'error' }> = {
  pending: { label: '대기', variant: 'warning' },
  confirmed: { label: '확인', variant: 'primary' },
  preparing: { label: '준비', variant: 'secondary' },
  shipped: { label: '배송', variant: 'secondary' },
  delivered: { label: '완료', variant: 'success' },
  cancelled: { label: '취소', variant: 'error' },
  refunded: { label: '환불', variant: 'error' },
}

export function OrderManagementPage() {
  const { orders, setOrders, updateOrderStatus } = useAdminStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => { setOrders(mockOrders) }, [setOrders])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus)
  }

  return (
    <div className="space-y-4">
      {/* Header - 한 줄 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-neutral-900">주문 관리</h1>
          <span className="text-sm text-neutral-500">{filteredOrders.length}건</span>
        </div>
      </div>

      {/* Filters - 한 줄 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2 py-2 text-sm border border-neutral-200 rounded-lg"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          className="px-2 py-2 text-sm border border-neutral-200 rounded-lg"
        >
          <option value="all">전체</option>
          {Object.entries(statusConfig).map(([status, config]) => (
            <option key={status} value={status}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {filteredOrders.map((order) => {
          const config = statusConfig[order.status]
          return (
            <Card key={order.id}>
              <CardContent className="p-3 overflow-hidden">
                {/* 첫째 줄: 주문번호 + 날짜 + 상태 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary-600">{order.orderNumber}</span>
                    <span className="text-xs text-neutral-400">{new Date(order.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <Badge variant={config.variant} size="sm">{config.label}</Badge>
                </div>
                {/* 둘째 줄: 고객명 + 금액 + 상세버튼 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-neutral-900 truncate">{order.user.name}</span>
                    {order.user.company && <span className="text-xs text-neutral-400 truncate">{order.user.company}</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-neutral-900">{formatPrice(order.totalAmount)}</span>
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-neutral-500">검색 결과가 없습니다.</div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold">주문 상세</span>
                <span className="text-sm text-neutral-500">{selectedOrder.orderNumber}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-neutral-600 text-2xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              {/* 고객 정보 */}
              <div>
                <span className="text-sm font-medium text-neutral-900 block mb-2">고객 정보</span>
                <div className="bg-neutral-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-neutral-500">이름</span><span>{selectedOrder.user.name}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">이메일</span><span>{selectedOrder.user.email}</span></div>
                  {selectedOrder.user.company && <div className="flex justify-between"><span className="text-neutral-500">회사</span><span>{selectedOrder.user.company}</span></div>}
                </div>
              </div>
              {/* 배송 정보 */}
              <div>
                <span className="text-sm font-medium text-neutral-900 block mb-2">배송 정보</span>
                <div className="bg-neutral-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-neutral-500">수령인</span><span>{selectedOrder.shippingAddress.recipient}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">연락처</span><span>{selectedOrder.shippingAddress.phone}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">주소</span><span className="text-right">({selectedOrder.shippingAddress.postalCode}) {selectedOrder.shippingAddress.address1}</span></div>
                </div>
              </div>
              {/* 주문 상품 */}
              <div>
                <span className="text-sm font-medium text-neutral-900 block mb-2">주문 상품</span>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{item.productName}</span>
                        <span className="text-xs text-neutral-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 결제 정보 */}
              <div>
                <span className="text-sm font-medium text-neutral-900 block mb-2">결제 정보</span>
                <div className="bg-neutral-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-neutral-500">상품금액</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">배송비</span><span>{selectedOrder.shippingFee === 0 ? '무료' : formatPrice(selectedOrder.shippingFee)}</span></div>
                  <div className="flex justify-between pt-2 border-t font-medium"><span>총 결제금액</span><span className="text-primary-600">{formatPrice(selectedOrder.totalAmount)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
