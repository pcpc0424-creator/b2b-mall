import { useState } from 'react'
import { Search, Eye, ChevronDown } from 'lucide-react'
import { useOrders, useUpdateOrderStatus } from '../../hooks/queries'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import { formatPrice, cn } from '../../lib/utils'
import { Order, OrderStatus } from '../types/admin'

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
  const { data: orders = [], isLoading } = useOrders()
  const updateStatusMutation = useUpdateOrderStatus()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-neutral-900">주문 관리</h1>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-3"><div className="h-16 bg-neutral-100 animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
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
