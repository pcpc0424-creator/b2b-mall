import { supabase } from '../lib/supabase'
import type { Order, OrderStatus, OrderItem, OrderUser, ShippingAddress } from '../admin/types/admin'

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

/** 주문 생성 입력 데이터 */
export interface CreateOrderInput {
  orderNumber: string
  userId: string
  user: OrderUser
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  totalAmount: number
  paymentMethod: string
  paymentKey?: string
  shippingAddress?: ShippingAddress
  notes?: string
}

/** 주문 생성 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('orders')
    .insert({
      id: crypto.randomUUID(),
      order_number: input.orderNumber,
      user_id: input.userId,
      user: input.user,
      items: input.items,
      subtotal: input.subtotal,
      shipping_fee: input.shippingFee,
      total_amount: input.totalAmount,
      status: 'confirmed' as OrderStatus,
      payment_status: 'paid',
      payment_method: input.paymentMethod,
      shipping_address: input.shippingAddress ?? {
        recipient: input.user.name,
        phone: '',
        postalCode: '',
        address1: '',
      },
      notes: input.notes ?? null,
      tracking_number: null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) throw error
  return toOrder(data)
}

/** 전체 주문 목록 조회 (생성일 내림차순) — 관리자용 */
export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toOrder)
}

/** 특정 사용자의 주문 목록 조회 (생성일 내림차순) */
export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toOrder)
}

/** 주문 상태 업데이트 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) throw new Error(`주문 상태 변경 실패: ${error.message}`)
}
