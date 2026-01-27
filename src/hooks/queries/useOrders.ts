import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchOrders, updateOrderStatus } from '../../services/orders'
import type { OrderStatus } from '../../admin/types/admin'

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: fetchOrders })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}
