import { supabase } from '../lib/supabase'
import type { Order, OrderStatus } from '../admin/types/admin'

/**
 * 주문 서비스
 * DB 행(snake_case) ↔ Order(camelCase) 변환 및 CRUD 제공
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

/** DB 행(snake_case) → Order(camelCase) 변환 */
export function toOrder(row: DbRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    user: row.user ?? { id: '', name: '', email: '', tier: 'guest' },
    items: row.items ?? [],
    subtotal: row.subtotal ?? 0,
    shippingFee: row.shipping_fee ?? 0,
    totalAmount: row.total_amount ?? 0,
    status: row.status ?? 'pending',
    paymentStatus: row.payment_status ?? 'pending',
    paymentMethod: row.payment_method ?? '',
    shippingAddress: row.shipping_address ?? {
      recipient: '',
      phone: '',
      postalCode: '',
      address1: '',
    },
    trackingNumber: row.tracking_number,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/** 전체 주문 목록 조회 (생성일 내림차순) */
export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toOrder)
}

/** 주문 상태 업데이트 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return toOrder(data)
}
