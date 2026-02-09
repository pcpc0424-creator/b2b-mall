import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, CartItem, QuoteItem, Product, UserTier, Coupon } from '../types'
// 쿠폰 목록(myCoupons)은 Supabase에서 관리 → useUserCoupons 훅 사용
// store에는 현재 적용 중인 쿠폰(appliedCoupon)만 유지
import { supabase } from '../lib/supabase'
import { upsertCartItem, removeCartItem as removeServerCartItem, clearServerCart } from '../services/cart'

interface AppState {
  // User
  user: User | null
  isLoggedIn: boolean
  login: (user: User) => void
  logout: () => void
  setUserTier: (tier: UserTier) => void

  // Cart
  cart: CartItem[]
  addToCart: (product: Product, quantity: number, selectedOptions?: Record<string, string>) => void
  removeFromCart: (productId: string, selectedOptions?: Record<string, string>) => void
  updateCartQuantity: (productId: string, quantity: number, selectedOptions?: Record<string, string>) => void
  clearCart: () => void
  getCartTotal: () => number
  setCart: (cart: CartItem[]) => void  // 서버에서 로드한 장바구니 설정

  // Quote
  quoteItems: QuoteItem[]
  addToQuote: (product: Product, quantity: number) => void
  removeFromQuote: (productId: string) => void
  updateQuoteQuantity: (productId: string, quantity: number) => void
  clearQuote: () => void
  getQuoteTotal: () => number

  // UI
  isMegaMenuOpen: boolean
  setMegaMenuOpen: (open: boolean) => void
  viewMode: 'normal' | 'bulk'
  setViewMode: (mode: 'normal' | 'bulk') => void

  // Coupons (목록은 Supabase → useUserCoupons 훅에서 관리)
  appliedCoupon: Coupon | null
  applyCoupon: (coupon: Coupon | null) => void
  getCouponDiscount: (orderAmount: number) => number
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  // User
  user: null,
  isLoggedIn: false,

  login: (user) => set({ user, isLoggedIn: true }),
  logout: () => {
    supabase.auth.signOut()
    // 로그아웃 시 장바구니도 초기화 (중복 방지)
    set({ user: null, isLoggedIn: false, cart: [], appliedCoupon: null })
  },
  setUserTier: (tier) => set((state) => ({
    user: state.user ? { ...state.user, tier } : null
  })),

  // Cart
  cart: [],
  addToCart: (product, quantity, selectedOptions) => {
    const state = get()
    // 옵션이 있는 경우 옵션 조합으로 구분, 없는 경우 productId로만 구분
    const optionKey = selectedOptions ? JSON.stringify(selectedOptions) : ''
    const existing = state.cart.find(item => {
      const itemOptionKey = item.selectedOptions ? JSON.stringify(item.selectedOptions) : ''
      return item.product.id === product.id && itemOptionKey === optionKey
    })

    let newQuantity = quantity
    if (existing) {
      newQuantity = existing.quantity + quantity
      set({
        cart: state.cart.map(item => {
          const itemOptionKey = item.selectedOptions ? JSON.stringify(item.selectedOptions) : ''
          return item.product.id === product.id && itemOptionKey === optionKey
            ? { ...item, quantity: newQuantity }
            : item
        })
      })
    } else {
      set({ cart: [...state.cart, { product, quantity, selectedOptions }] })
    }

    // 로그인된 경우 서버에도 동기화 (비동기)
    if (state.isLoggedIn) {
      upsertCartItem(product.id, newQuantity, selectedOptions).catch(console.error)
    }
  },
  removeFromCart: (productId, selectedOptions) => {
    const state = get()
    const optionKey = selectedOptions ? JSON.stringify(selectedOptions) : ''
    set({
      cart: state.cart.filter(item => {
        const itemOptionKey = item.selectedOptions ? JSON.stringify(item.selectedOptions) : ''
        return !(item.product.id === productId && itemOptionKey === optionKey)
      })
    })

    // 로그인된 경우 서버에서도 삭제 (비동기)
    if (state.isLoggedIn) {
      removeServerCartItem(productId, selectedOptions).catch(console.error)
    }
  },
  updateCartQuantity: (productId, quantity, selectedOptions) => {
    const state = get()
    const optionKey = selectedOptions ? JSON.stringify(selectedOptions) : ''
    set({
      cart: state.cart.map(item => {
        const itemOptionKey = item.selectedOptions ? JSON.stringify(item.selectedOptions) : ''
        return item.product.id === productId && itemOptionKey === optionKey
          ? { ...item, quantity }
          : item
      })
    })

    // 로그인된 경우 서버에도 동기화 (비동기)
    if (state.isLoggedIn) {
      upsertCartItem(productId, quantity, selectedOptions).catch(console.error)
    }
  },
  clearCart: () => {
    const state = get()
    set({ cart: [] })

    // 로그인된 경우 서버 장바구니도 비우기 (비동기)
    if (state.isLoggedIn) {
      clearServerCart().catch(console.error)
    }
  },
  setCart: (cart) => set({ cart }),
  getCartTotal: () => {
    const state = get()
    const tier = state.user?.tier || 'guest'
    return state.cart.reduce((total, item) => {
      const price = getPriceByTier(item.product, tier)
      return total + (price * item.quantity)
    }, 0)
  },

  // Quote
  quoteItems: [],
  addToQuote: (product, quantity) => set((state) => {
    const tier = state.user?.tier || 'guest'
    const unitPrice = getPriceByTier(product, tier)
    const existing = state.quoteItems.find(item => item.product.id === product.id)
    if (existing) {
      return {
        quoteItems: state.quoteItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * unitPrice }
            : item
        )
      }
    }
    return {
      quoteItems: [...state.quoteItems, { product, quantity, unitPrice, subtotal: quantity * unitPrice }]
    }
  }),
  removeFromQuote: (productId) => set((state) => ({
    quoteItems: state.quoteItems.filter(item => item.product.id !== productId)
  })),
  updateQuoteQuantity: (productId, quantity) => set((state) => {
    const tier = state.user?.tier || 'guest'
    return {
      quoteItems: state.quoteItems.map(item => {
        if (item.product.id === productId) {
          const unitPrice = getPriceByTier(item.product, tier)
          return { ...item, quantity, subtotal: quantity * unitPrice }
        }
        return item
      })
    }
  }),
  clearQuote: () => set({ quoteItems: [] }),
  getQuoteTotal: () => {
    const state = get()
    return state.quoteItems.reduce((total, item) => total + item.subtotal, 0)
  },

  // UI
  isMegaMenuOpen: false,
  setMegaMenuOpen: (open) => set({ isMegaMenuOpen: open }),
  viewMode: 'normal',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Coupons
  appliedCoupon: null,

  applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

  getCouponDiscount: (orderAmount) => {
    const state = get()
    const coupon = state.appliedCoupon

    if (!coupon) return 0

    // 유효기간 체크
    const now = new Date()
    if (now < new Date(coupon.validFrom) || now > new Date(coupon.validUntil)) {
      return 0
    }

    // 최소 주문 금액 체크
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return 0
    }

    // 할인 계산
    let discount = 0
    if (coupon.discountType === 'percent') {
      discount = Math.round(orderAmount * (coupon.discountValue / 100))
      // 최대 할인 금액 적용
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount
      }
    } else {
      discount = coupon.discountValue
    }

    return discount
  },
    }),
    {
      name: 'b2b-mall-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        cart: state.cart,
        quoteItems: state.quoteItems,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
)

export function getPriceByTier(product: Product, tier: UserTier): number {
  switch (tier) {
    case 'vip': return product.prices.vip
    case 'premium': return product.prices.premium
    case 'member': return product.prices.member
    default: return product.prices.retail
  }
}

export function getTierLabel(tier: UserTier): string {
  switch (tier) {
    case 'vip': return 'VIP회원'
    case 'premium': return '우수회원'
    case 'member': return '일반회원'
    default: return '비회원'
  }
}

export function getTierColor(tier: UserTier): string {
  switch (tier) {
    case 'vip': return 'bg-amber-100 text-amber-800'
    case 'premium': return 'bg-blue-100 text-blue-800'
    case 'member': return 'bg-green-100 text-green-800'
    default: return 'bg-neutral-100 text-neutral-600'
  }
}
