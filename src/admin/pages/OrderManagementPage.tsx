import { useState } from 'react'
import { Search, Eye, ChevronDown, Loader2, Truck } from 'lucide-react'
import { useOrders, useUpdateOrderStatus, useUpdateTrackingInfo } from '../../hooks/queries'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import { formatPrice, cn } from '../../lib/utils'
import { Order, OrderStatus } from '../types/admin'
import { cancelPayment } from '../../services/payment'

// 택배사 목록
const carrierOptions = [
  { value: 'cj', label: 'CJ대한통운', url: 'https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo=' },
  { value: 'hanjin', label: '한진택배', url: 'https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mession=&wblNum=' },
  { value: 'lotte', label: '롯데택배', url: 'https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo=' },
  { value: 'logen', label: '로젠택배', url: 'https://www.ilogen.com/web/personal/trace/' },
  { value: 'epost', label: '우체국택배', url: 'https://service.epost.go.kr/trace.RetrieveDomRi498.postal?sid1=' },
  { value: 'cu', label: 'CU편의점택배', url: 'https://www.cupost.co.kr/postbox/delivery/localResult.cupost?invoice_no=' },
  { value: 'gspost', label: 'GS편의점택배', url: 'https://www.cvsnet.co.kr/invoice/tracking.do?invoice_no=' },
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
  const { data: orders = [], isLoading, refetch } = useOrders()
  const updateStatusMutation = useUpdateOrderStatus()
  const updateTrackingMutation = useUpdateTrackingInfo()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isRefunding, setIsRefunding] = useState(false)
  const [refundError, setRefundError] = useState<string | null>(null)

  // 운송장 입력 상태
  const [trackingCarrier, setTrackingCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus })
  }

  const handleTrackingSubmit = async () => {
    if (!selectedOrder || !trackingCarrier || !trackingNumber.trim()) {
      alert('택배사와 운송장번호를 입력해주세요.')
      return
    }

    try {
      await updateTrackingMutation.mutateAsync({
        orderId: selectedOrder.id,
        carrier: trackingCarrier,
        trackingNumber: trackingNumber.trim(),
      })
      alert('운송장이 등록되었습니다.')
      setTrackingCarrier('')
      setTrackingNumber('')
      refetch()
    } catch (err: any) {
      alert(err.message || '운송장 등록에 실패했습니다.')
    }
  }

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setTrackingCarrier(order.carrier || '')
    setTrackingNumber(order.trackingNumber || '')
    setRefundError(null)
  }

  const handleRefund = async (order: Order) => {
    if (!order.paymentKey) {
      setRefundError('결제 키가 없어 환불할 수 없습니다.')
      return
    }

    if (!confirm(`정말 이 주문을 환불하시겠습니까?\n주문번호: ${order.orderNumber}\n금액: ${formatPrice(order.totalAmount)}`)) {
      return
    }

    setIsRefunding(true)
    setRefundError(null)

    try {
      await cancelPayment({
        paymentKey: order.paymentKey,
        cancelReason: '관리자에 의한 환불',
      })

      // 주문 상태를 환불로 변경
      await updateStatusMutation.mutateAsync({ orderId: order.id, status: 'refunded' })

      alert('환불이 완료되었습니다.')
      setSelectedOrder(null)
      refetch()
    } catch (err: any) {
      console.error('환불 실패:', err)
      setRefundError(err.message || '환불 처리에 실패했습니다.')
    } finally {
      setIsRefunding(false)
    }
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
                    <Button variant="outline" size="sm" onClick={() => openOrderDetail(order)}>
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
              {/* 주문 상태 변경 */}
              <div>
                <span className="text-sm font-medium text-neutral-900 block mb-2">주문 상태</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                  disabled={updateStatusMutation.isPending}
                >
                  <option value="pending">결제대기</option>
                  <option value="confirmed">결제완료</option>
                  <option value="preparing">상품준비중</option>
                  <option value="shipped">배송중</option>
                  <option value="delivered">배송완료</option>
                  <option value="cancelled">주문취소</option>
                  <option value="refunded">환불완료</option>
                </select>
              </div>

              {/* 운송장 입력 */}
              <div>
                <span className="text-sm font-medium text-neutral-900 block mb-2 flex items-center gap-1">
                  <Truck className="w-4 h-4" /> 운송장 정보
                </span>
                <div className="space-y-2">
                  <select
                    value={trackingCarrier}
                    onChange={(e) => setTrackingCarrier(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                  >
                    <option value="">택배사 선택</option>
                    {carrierOptions.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="운송장번호 입력"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleTrackingSubmit}
                    disabled={updateTrackingMutation.isPending || !trackingCarrier || !trackingNumber.trim()}
                  >
                    {updateTrackingMutation.isPending ? '등록 중...' : '운송장 등록'}
                  </Button>
                </div>
              </div>

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
                  <div className="flex justify-between"><span className="text-neutral-500">수령인</span><span>{selectedOrder.shippingAddress.recipient || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">연락처</span><span>{selectedOrder.shippingAddress.phone || '-'}</span></div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">주소</span>
                    <span className="text-right max-w-[200px]">
                      {selectedOrder.shippingAddress.postalCode && `(${selectedOrder.shippingAddress.postalCode}) `}
                      {selectedOrder.shippingAddress.address1 || '-'}
                      {selectedOrder.shippingAddress.address2 && ` ${selectedOrder.shippingAddress.address2}`}
                    </span>
                  </div>
                  {selectedOrder.shippingAddress.notes && (
                    <div className="flex justify-between pt-2 border-t border-neutral-200">
                      <span className="text-neutral-500">배송메모</span>
                      <span className="text-right max-w-[200px]">{selectedOrder.shippingAddress.notes}</span>
                    </div>
                  )}
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

              {/* 환불 버튼 */}
              {selectedOrder.paymentStatus === 'paid' && selectedOrder.status !== 'refunded' && selectedOrder.status !== 'cancelled' && (
                <div className="pt-2">
                  {refundError && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {refundError}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handleRefund(selectedOrder)}
                    disabled={isRefunding}
                  >
                    {isRefunding ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        환불 처리 중...
                      </>
                    ) : (
                      '환불 처리'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
