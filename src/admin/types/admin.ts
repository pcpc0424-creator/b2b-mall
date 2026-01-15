import { Product, UserTier } from '../../types'

// 관리자 사용자
export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'manager'
  permissions: AdminPermission[]
  createdAt: Date
  lastLoginAt?: Date
}

export type AdminPermission =
  | 'products:read' | 'products:write' | 'products:delete'
  | 'orders:read' | 'orders:write'
  | 'members:read' | 'members:write'
  | 'settings:read' | 'settings:write'

// 상품 옵션 (스마트스토어 스타일)
export interface ProductOptionAdmin {
  id: string
  name: string              // 옵션명 (사이즈, 색상 등)
  values: OptionValue[]
  required: boolean
  displayOrder: number
}

export interface OptionValue {
  id: string
  value: string             // 옵션값 (S, M, L 또는 빨강, 파랑)
  priceModifier: number     // 추가금액 (+0, +1000, -500)
  stockModifier?: number
  isDefault: boolean
}

// 옵션 조합으로 생성된 변형 상품
export interface ProductVariant {
  id: string
  sku: string                         // 조합 SKU (GF-001-S-RED)
  optionCombination: Record<string, string>  // { "사이즈": "S", "색상": "빨강" }
  price: number
  stock: number
  isActive: boolean
  images?: string[]
}

// 상품별 배송비 설정
export interface ProductShipping {
  type: 'free' | 'paid' | 'conditional'  // 무료배송, 유료배송, 조건부무료
  fee?: number                            // 배송비 (유료일 때)
  freeCondition?: number                  // 조건부무료 기준금액
}

// 관리자용 확장 상품
export interface AdminProduct extends Product {
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  adminOptions?: ProductOptionAdmin[]
  variants?: ProductVariant[]
  shipping?: ProductShipping              // 상품별 배송비 설정
}

// 배송비 설정
export interface ShippingSettings {
  id: string
  name: string
  type: 'free' | 'flat' | 'tiered' | 'regional'
  isDefault: boolean
  baseFee: number
  freeShippingThreshold?: number
  tiers?: ShippingTier[]
  regions?: RegionalShipping[]
  createdAt: Date
  updatedAt: Date
}

export interface ShippingTier {
  id: string
  minAmount: number
  maxAmount: number
  fee: number
}

export interface RegionalShipping {
  id: string
  region: string
  fee: number
}

// 주문 관련
export type OrderStatus =
  | 'pending'           // 주문접수
  | 'confirmed'         // 주문확인
  | 'preparing'         // 상품준비중
  | 'shipped'           // 배송중
  | 'delivered'         // 배송완료
  | 'cancelled'         // 취소
  | 'refunded'          // 환불

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user: OrderUser
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  totalAmount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  shippingAddress: ShippingAddress
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productSku: string
  variantId?: string
  selectedOptions?: Record<string, string>
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface OrderUser {
  id: string
  name: string
  email: string
  company?: string
  tier: UserTier
}

export interface ShippingAddress {
  recipient: string
  phone: string
  postalCode: string
  address1: string
  address2?: string
}

// 회원 관리
export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'pending_approval'

export interface MemberListItem {
  id: string
  name: string
  email: string
  company?: string
  businessNumber?: string
  tier: UserTier
  status: MemberStatus
  totalOrders: number
  totalSpent: number
  createdAt: Date
  lastOrderAt?: Date
}

export interface TierChangeHistory {
  id: string
  userId: string
  previousTier: UserTier
  newTier: UserTier
  reason: string
  changedBy: string
  changedAt: Date
}

// 대시보드 통계
export interface AdminDashboardStats {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  lowStockProducts: number
  newMembers: number
  recentOrders: Order[]
}

// 페이지네이션 & 필터
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ProductFilters {
  search?: string
  categoryId?: number
  stockStatus?: 'available' | 'low' | 'out_of_stock'
  isActive?: boolean
}

export interface OrderFilters {
  search?: string
  status?: OrderStatus
  dateFrom?: Date
  dateTo?: Date
  userId?: string
}

export interface MemberFilters {
  search?: string
  tier?: UserTier
  status?: MemberStatus
  dateFrom?: Date
  dateTo?: Date
}
