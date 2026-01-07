export type UserTier = 'guest' | 'member' | 'vip' | 'wholesale' | 'partner'

export interface User {
  id: string
  name: string
  email: string
  tier: UserTier
  company?: string
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
    retail: number
    member: number
    vip: number
    wholesale: number
    partner: number
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
