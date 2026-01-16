export type UserTier = 'guest' | 'member' | 'premium' | 'vip'

export interface User {
  id: string
  name: string
  email: string
  tier: UserTier
  company?: string
  businessNumber?: string
}

export interface Category {
  id: number
  name: string
  icon?: string
  image?: string
  subcategories: string[]
}

export interface Product {
  id: string
  sku: string
  name: string
  brand: string
  categoryId: number
  images: string[]
  prices: {
    retail: number    // 비회원가
    member: number    // 일반회원가
    premium: number   // 우수회원가
    vip: number       // VIP회원가
  }
  minQuantity: number
  maxQuantity?: number
  stock: number
  stockStatus: 'available' | 'low' | 'out_of_stock'
  options?: ProductOption[]
}

export interface ProductOption {
  id: string
  name: string
  values: string[]
}

export interface CartItem {
  product: Product
  quantity: number
  selectedOptions?: Record<string, string>
}

export interface QuoteItem {
  product: Product
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Quote {
  id: string
  items: QuoteItem[]
  totalAmount: number
  createdAt: Date
  expectedDelivery: Date
  memo?: string
  status: 'draft' | 'confirmed' | 'converted'
}

export interface Promotion {
  id: string
  title: string
  description: string
  image: string
  discount: number
  startDate: Date
  endDate: Date
  targetTiers: UserTier[]
  type: 'all' | 'timesale' | 'exclusive'
  isActive: boolean
}

export interface OrderSummary {
  totalOrders: number
  totalAmount: number
  averageOrderValue: number
  period: string
}

export interface SalesData {
  date: string
  amount: number
  orders: number
}

export interface Notice {
  id: string
  title: string
  content: string
  category: 'notice' | 'event' | 'update' | 'important'
  isImportant: boolean
  createdAt: Date
  viewCount: number
}

export interface Review {
  id: string
  productId: string
  author: string
  rating: number
  title: string
  content: string
  images?: string[]
  createdAt: Date
  helpful: number
  verified: boolean
}

export interface Coupon {
  id: string
  code: string
  name: string
  description: string
  discountType: 'percent' | 'fixed'  // 퍼센트 할인 or 정액 할인
  discountValue: number              // 할인 값 (5 = 5% 또는 5000원)
  minOrderAmount?: number            // 최소 주문 금액
  maxDiscountAmount?: number         // 최대 할인 금액 (퍼센트 할인 시)
  validFrom: Date
  validUntil: Date
  isUsed: boolean
  usedAt?: Date
}
