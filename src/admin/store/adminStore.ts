import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'
import {
  AdminUser,
  AdminProduct,
  Order,
  OrderStatus,
  MemberListItem,
  MemberStatus,
  ShippingSettings,
  AdminDashboardStats,
  ProductFilters,
  OrderFilters,
  MemberFilters,
  PaginationParams
} from '../types/admin'
import { UserTier } from '../../types'
import { products as mockProducts } from '../../data'

// mockProducts를 AdminProduct로 변환
const initialProducts: AdminProduct[] = mockProducts.map(p => ({
  ...p,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}))

// 커스텀 스토리지 - adminOptions가 제대로 저장/로드되도록 보장
const customStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const str = localStorage.getItem(name)
    if (!str) return null
    console.log('[customStorage] getItem 호출:', name)
    return str
  },
  setItem: (name: string, value: string): void => {
    console.log('[customStorage] setItem 호출:', name)
    localStorage.setItem(name, value)
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name)
  },
}

interface AdminState {
  // Auth
  adminUser: AdminUser | null
  isAdminAuthenticated: boolean
  adminLogin: (user: AdminUser) => void
  adminLogout: () => void

  // Products
  products: AdminProduct[]
  productFilters: ProductFilters
  productPagination: PaginationParams
  selectedProductIds: string[]
  setProducts: (products: AdminProduct[]) => void
  setProductFilters: (filters: ProductFilters) => void
  setProductPagination: (pagination: PaginationParams) => void
  setSelectedProductIds: (ids: string[]) => void
  addProduct: (product: AdminProduct) => void
  updateProduct: (id: string, updates: Partial<AdminProduct>) => void
  deleteProduct: (id: string) => void
  bulkDeleteProducts: (ids: string[]) => void

  // Orders
  orders: Order[]
  orderFilters: OrderFilters
  orderPagination: PaginationParams
  setOrders: (orders: Order[]) => void
  setOrderFilters: (filters: OrderFilters) => void
  setOrderPagination: (pagination: PaginationParams) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void

  // Members
  members: MemberListItem[]
  memberFilters: MemberFilters
  memberPagination: PaginationParams
  setMembers: (members: MemberListItem[]) => void
  setMemberFilters: (filters: MemberFilters) => void
  setMemberPagination: (pagination: PaginationParams) => void
  updateMemberTier: (memberId: string, tier: UserTier) => void
  updateMemberStatus: (memberId: string, status: MemberStatus) => void

  // Shipping Settings
  shippingSettings: ShippingSettings | null
  setShippingSettings: (settings: ShippingSettings) => void
  updateShippingSettings: (updates: Partial<ShippingSettings>) => void

  // Dashboard
  dashboardStats: AdminDashboardStats | null
  setDashboardStats: (stats: AdminDashboardStats) => void

  // UI State
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  isMobileSidebarOpen: boolean
  setMobileSidebarOpen: (open: boolean) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      // Auth
      adminUser: null,
      isAdminAuthenticated: false,
      adminLogin: (user) => set({ adminUser: user, isAdminAuthenticated: true }),
      adminLogout: () => set({ adminUser: null, isAdminAuthenticated: false }),

      // Products - 초기값은 mockProducts 기반
      products: initialProducts,
      productFilters: {},
      productPagination: { page: 1, limit: 20 },
      selectedProductIds: [],
      setProducts: (products) => set({ products }),
      setProductFilters: (filters) => set({ productFilters: filters }),
      setProductPagination: (pagination) => set({ productPagination: pagination }),
      setSelectedProductIds: (ids) => set({ selectedProductIds: ids }),
      addProduct: (product) => {
        console.log('[adminStore] addProduct:', product)
        console.log('[adminStore] addProduct adminOptions:', product.adminOptions)
        return set((state) => ({
          products: [...state.products, product]
        }))
      },
      updateProduct: (id, updates) => {
        console.log('[adminStore] updateProduct id:', id)
        console.log('[adminStore] updateProduct updates:', updates)
        console.log('[adminStore] updateProduct adminOptions:', updates.adminOptions)
        return set((state) => {
          const newProducts = state.products.map(p => p.id === id ? { ...p, ...updates } : p)
          console.log('[adminStore] 업데이트된 상품:', newProducts.find(p => p.id === id))
          return { products: newProducts }
        })
      },
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      bulkDeleteProducts: (ids) => set((state) => ({
        products: state.products.filter(p => !ids.includes(p.id))
      })),

      // Orders
      orders: [],
      orderFilters: {},
      orderPagination: { page: 1, limit: 20 },
      setOrders: (orders) => set({ orders }),
      setOrderFilters: (filters) => set({ orderFilters: filters }),
      setOrderPagination: (pagination) => set({ orderPagination: pagination }),
      updateOrderStatus: (orderId, status) => set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
      })),

      // Members
      members: [],
      memberFilters: {},
      memberPagination: { page: 1, limit: 20 },
      setMembers: (members) => set({ members }),
      setMemberFilters: (filters) => set({ memberFilters: filters }),
      setMemberPagination: (pagination) => set({ memberPagination: pagination }),
      updateMemberTier: (memberId, tier) => set((state) => ({
        members: state.members.map(m => m.id === memberId ? { ...m, tier } : m)
      })),
      updateMemberStatus: (memberId, status) => set((state) => ({
        members: state.members.map(m => m.id === memberId ? { ...m, status } : m)
      })),

      // Shipping Settings
      shippingSettings: {
        id: 'default',
        name: '기본 배송비',
        type: 'flat',
        isDefault: true,
        baseFee: 3000,
        freeShippingThreshold: 50000,
        tiers: [
          { id: '1', minAmount: 0, maxAmount: 29999, fee: 5000 },
          { id: '2', minAmount: 30000, maxAmount: 49999, fee: 3000 },
          { id: '3', minAmount: 50000, maxAmount: 99999, fee: 0 },
        ],
        regions: [
          { id: '1', region: '수도권', fee: 3000 },
          { id: '2', region: '경기/인천', fee: 3500 },
          { id: '3', region: '충청', fee: 4000 },
          { id: '4', region: '경상', fee: 4000 },
          { id: '5', region: '전라', fee: 4000 },
          { id: '6', region: '강원', fee: 5000 },
          { id: '7', region: '제주/도서산간', fee: 8000 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      setShippingSettings: (settings) => set({ shippingSettings: settings }),
      updateShippingSettings: (updates) => set((state) => ({
        shippingSettings: state.shippingSettings
          ? { ...state.shippingSettings, ...updates, updatedAt: new Date() }
          : null
      })),

      // Dashboard
      dashboardStats: null,
      setDashboardStats: (stats) => set({ dashboardStats: stats }),

      // UI State
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({
        isSidebarCollapsed: !state.isSidebarCollapsed
      })),
      isMobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
    }),
    {
      name: 'admin-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        adminUser: state.adminUser,
        isAdminAuthenticated: state.isAdminAuthenticated,
        isSidebarCollapsed: state.isSidebarCollapsed,
        shippingSettings: state.shippingSettings,
        products: state.products,
      }),
      onRehydrateStorage: () => {
        console.log('[adminStore] hydration 시작')
        return (state, error) => {
          if (error) {
            console.error('[adminStore] hydration 에러:', error)
            return
          }
          console.log('[adminStore] hydration 완료')

          // zustand persist가 adminOptions를 제대로 로드하지 못할 수 있으므로 직접 확인
          // setTimeout을 사용하여 hydration이 완전히 끝난 후 실행
          setTimeout(() => {
            try {
              const stored = localStorage.getItem('admin-storage')
              if (stored) {
                const parsed = JSON.parse(stored)
                const storedProducts = parsed.state?.products as AdminProduct[] | undefined

                if (storedProducts && storedProducts.length > 0) {
                  // localStorage에서 adminOptions가 있는 제품 찾기
                  const productsWithOptions = storedProducts.filter(p => p.adminOptions && p.adminOptions.length > 0)
                  console.log('[adminStore] localStorage에서 adminOptions가 있는 제품 수:', productsWithOptions.length)

                  if (productsWithOptions.length > 0) {
                    // 현재 store state 확인
                    const currentState = useAdminStore.getState()
                    const currentProductsWithOptions = currentState.products.filter(p => p.adminOptions && p.adminOptions.length > 0)
                    console.log('[adminStore] 현재 store에서 adminOptions가 있는 제품 수:', currentProductsWithOptions.length)

                    // localStorage에는 있지만 store에는 없으면 직접 로드
                    if (currentProductsWithOptions.length < productsWithOptions.length) {
                      console.log('[adminStore] adminOptions 누락 감지 - 직접 로드')
                      useAdminStore.setState({ products: storedProducts })
                      console.log('[adminStore] products 직접 설정 완료')

                      // 확인
                      const afterState = useAdminStore.getState()
                      const afterProductsWithOptions = afterState.products.filter(p => p.adminOptions && p.adminOptions.length > 0)
                      console.log('[adminStore] 설정 후 adminOptions가 있는 제품 수:', afterProductsWithOptions.length)
                    }
                  }
                }
              }
            } catch (e) {
              console.error('[adminStore] 수동 로드 에러:', e)
            }
          }, 0)
        }
      },
    }
  )
)
