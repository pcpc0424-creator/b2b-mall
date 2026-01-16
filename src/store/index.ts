import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, CartItem, QuoteItem, Product, UserTier, Coupon } from '../types'
import { mockUser } from '../data'

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

  // Coupons
  myCoupons: Coupon[]
  appliedCoupon: Coupon | null
  addCoupon: (coupon: Coupon) => void
  removeCoupon: (couponId: string) => void
  applyCoupon: (coupon: Coupon | null) => void
  useCoupon: (couponId: string) => void
  getCouponDiscount: (orderAmount: number) => number
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  // User
  user: null,
  isLoggedIn: false,

  login: (user) => set({ user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
  setUserTier: (tier) => set((state) => ({
    user: state.user ? { ...state.user, tier } : null
  })),

  // Cart
  cart: [],
  addToCart: (product, quantity, selectedOptions) => set((state) => {
    // 옵션이 있는 경우 옵션 조합으로 구분, 없는 경우 productId로만 구분
    const optionKey = selectedOptions ? JSON.stringify(selectedOptions) : ''
    const existing = state.cart.find(item => {
      const itemOptionKey = item.selectedOptions ? JSON.stringify(item.selectedOptions) : ''
      return item.product.id === product.id && itemOptionKey === optionKey
    })

    if (existing) {
      return {
        cart: state.cart.map(item => {
          const itemOptionKey = item.selectedOptions ? JSON.stringify(item.selectedOptions) : ''
          return item.product.id === product.id && itemOptionKey === optionKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        })
      }
    }
    return { cart: [...state.cart, { product, quantity, selectedOptions }] }
  }),
  removeFromCart: (productId, selectedOptions) => set((state) => {
    const optionKey = selectedOptions ? JSON.stringify(selectedOptions) : ''
    return {
      cart: state.cart.filter(item => {
        const itemOptionKey = item.selectedOptions ? JSON.stringify(item.selectedOptions) : ''
        return !(item.product.id === productId && itemOptionKey === optionKey)
      })
    }
  }),
  updateCartQuantity: (productId, quantity, selectedOptions) => set((state) => {
    const optionKey = selectedOptions ? JSON.stringify(selectedOptions) : ''
    return {
      cart: state.cart.map(item => {
        const itemOptionKey = item.selectedOptions ? JSON.stringify(item.selectedOptions) : ''
        return item.product.id === productId && itemOptionKey === optionKey
          ? { ...item, quantity }
          : item
      })
    }
  }),
  clearCart: () => set({ cart: [] }),
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
  myCoupons: [],
  appliedCoupon: null,

  addCoupon: (coupon) => set((state) => {
    // 이미 있는 쿠폰인지 확인
    if (state.myCoupons.some(c => c.id === coupon.id)) {
      return state
    }
    return { myCoupons: [...state.myCoupons, coupon] }
  }),

  removeCoupon: (couponId) => set((state) => ({
    myCoupons: state.myCoupons.filter(c => c.id !== couponId),
    appliedCoupon: state.appliedCoupon?.id === couponId ? null : state.appliedCoupon
  })),

  applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

  useCoupon: (couponId) => set((state) => ({
    myCoupons: state.myCoupons.map(c =>
      c.id === couponId ? { ...c, isUsed: true, usedAt: new Date() } : c
    ),
    appliedCoupon: null
  })),

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
        myCoupons: state.myCoupons,
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
