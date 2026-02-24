import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchOrders, fetchUserOrders, createOrder, updateOrderStatus, updateTrackingInfo } from '../../services/orders'
import type { OrderStatus } from '../../admin/types/admin'
import type { CreateOrderInput } from '../../services/orders'

/** 전체 주문 목록 (관리자용) */
export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: fetchOrders })
}

/** 특정 사용자의 주문 목록 */
export function useUserOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ['orders', 'user', userId],
    queryFn: () => fetchUserOrders(userId!),
    enabled: !!userId,
  })
}

/** 주문 생성 */
export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (err) => console.error('주문 생성 실패:', err),
  })
}

/** 주문 상태 변경 */
export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
    onError: (err) => console.error('주문 상태 변경 실패:', err),
  })
}

/** 운송장 정보 업데이트 */
export function useUpdateTrackingInfo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, carrier, trackingNumber }: { orderId: string; carrier: string; trackingNumber: string }) =>
      updateTrackingInfo(orderId, carrier, trackingNumber),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
    onError: (err) => console.error('운송장 정보 업데이트 실패:', err),
  })
}
