import { create } from 'zustand'
import { User, CartItem, QuoteItem, Product, UserTier } from '../types'
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
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
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
}

export const useStore = create<AppState>((set, get) => ({
  // User
  user: mockUser,
  isLoggedIn: true,

  login: (user) => set({ user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
  setUserTier: (tier) => set((state) => ({
    user: state.user ? { ...state.user, tier } : null
  })),

  // Cart
  cart: [],
  addToCart: (product, quantity) => set((state) => {
    const existing = state.cart.find(item => item.product.id === product.id)
    if (existing) {
      return {
        cart: state.cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
    }
    return { cart: [...state.cart, { product, quantity }] }
  }),
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.product.id !== productId)
  })),
  updateCartQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    )
  })),
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
}))

export function getPriceByTier(product: Product, tier: UserTier): number {
  switch (tier) {
    case 'partner': return product.prices.partner
    case 'wholesale': return product.prices.wholesale
    case 'vip': return product.prices.vip
    case 'member': return product.prices.member
    default: return product.prices.retail
  }
}

export function getTierLabel(tier: UserTier): string {
  switch (tier) {
    case 'partner': return '파트너'
    case 'wholesale': return '도매'
    case 'vip': return 'VIP'
    case 'member': return '일반회원'
    default: return '비회원'
  }
}

export function getTierColor(tier: UserTier): string {
  switch (tier) {
    case 'partner': return 'bg-purple-100 text-purple-800'
    case 'wholesale': return 'bg-blue-100 text-blue-800'
    case 'vip': return 'bg-amber-100 text-amber-800'
    case 'member': return 'bg-green-100 text-green-800'
    default: return 'bg-neutral-100 text-neutral-600'
  }
}
