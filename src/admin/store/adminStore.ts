import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'
import {
  AdminUser,
  AdminProduct,
  AdminPromotion,
  Order,
  OrderStatus,
  MemberListItem,
  MemberStatus,
  ShippingSettings,
  AdminDashboardStats,
  ProductFilters,
  OrderFilters,
  MemberFilters,
  PromotionFilters,
  PaginationParams,
  TierSettings,
  PopupModal,
  SiteSettings
} from '../types/admin'
import { UserTier } from '../../types'
import { products as mockProducts, promotions as mockPromotions } from '../../data'

// mockProducts를 AdminProduct로 변환
const initialProducts: AdminProduct[] = mockProducts.map((p, index) => ({
  ...p,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  // 첫 번째 상품에 수량별 할인 테스트 데이터 추가
  ...(index === 0 ? {
    showOptionImages: true,
    quantityDiscounts: [
      { id: 'qd_1', quantity: 1, discountPercent: 0 },
      { id: 'qd_2', quantity: 2, discountPercent: 5, label: '인기' },
      { id: 'qd_3', quantity: 4, discountPercent: 10, label: '최저가' },
      { id: 'qd_4', quantity: 8, discountPercent: 15 },
    ]
  } : {})
}))

// mockPromotions를 AdminPromotion으로 변환
const initialPromotions: AdminPromotion[] = mockPromotions.map(p => ({
  ...p,
  createdAt: new Date(),
  updatedAt: new Date(),
}))

// 커스텀 스토리지 - adminOptions가 제대로 저장/로드되도록 보장
const customStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return localStorage.getItem(name)
  },
  setItem: (name: string, value: string): void => {
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

  // Promotions
  promotions: AdminPromotion[]
  promotionFilters: PromotionFilters
  setPromotions: (promotions: AdminPromotion[]) => void
  setPromotionFilters: (filters: PromotionFilters) => void
  addPromotion: (promotion: AdminPromotion) => void
  updatePromotion: (id: string, updates: Partial<AdminPromotion>) => void
  deletePromotion: (id: string) => void
  togglePromotionActive: (id: string) => void

  // Shipping Settings
  shippingSettings: ShippingSettings | null
  setShippingSettings: (settings: ShippingSettings) => void
  updateShippingSettings: (updates: Partial<ShippingSettings>) => void

  // Dashboard
  dashboardStats: AdminDashboardStats | null
  setDashboardStats: (stats: AdminDashboardStats) => void

  // Tier Settings
  tierSettings: TierSettings
  setTierSettings: (settings: TierSettings) => void
  updateTierSettings: (updates: Partial<TierSettings>) => void
  updateTierThreshold: (tier: UserTier, updates: Partial<TierSettings['thresholds'][0]>) => void

  // Popup Modals
  popupModals: PopupModal[]
  setPopupModals: (modals: PopupModal[]) => void
  addPopupModal: (modal: PopupModal) => void
  updatePopupModal: (id: string, updates: Partial<PopupModal>) => void
  deletePopupModal: (id: string) => void
  togglePopupModalActive: (id: string) => void

  // Site Settings
  siteSettings: SiteSettings
  updateSiteSettings: (updates: Partial<SiteSettings>) => void
  updateTopBanner: (updates: Partial<SiteSettings['topBanner']>) => void

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
        return set((state) => ({
          products: [...state.products, product]
        }))
      },
      updateProduct: (id, updates) => {
        return set((state) => ({
          products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
        }))
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

      // Promotions
      promotions: initialPromotions,
      promotionFilters: {},
      setPromotions: (promotions) => set({ promotions }),
      setPromotionFilters: (filters) => set({ promotionFilters: filters }),
      addPromotion: (promotion) => set((state) => ({
        promotions: [...state.promotions, promotion]
      })),
      updatePromotion: (id, updates) => set((state) => ({
        promotions: state.promotions.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)
      })),
      deletePromotion: (id) => set((state) => ({
        promotions: state.promotions.filter(p => p.id !== id)
      })),
      togglePromotionActive: (id) => set((state) => ({
        promotions: state.promotions.map(p => p.id === id ? { ...p, isActive: !p.isActive, updatedAt: new Date() } : p)
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

      // Tier Settings - 기본값
      tierSettings: {
        isEnabled: true,
        autoUpgrade: true,
        autoDowngrade: false,
        evaluationPeriod: 'cumulative',
        thresholds: [
          { tier: 'member', minPurchaseAmount: 0, discountRate: 3, pointRate: 1, freeShipping: false },
          { tier: 'premium', minPurchaseAmount: 300000, discountRate: 7, pointRate: 2, freeShipping: true },
          { tier: 'vip', minPurchaseAmount: 1000000, discountRate: 15, pointRate: 3, freeShipping: true },
        ],
        updatedAt: new Date(),
      },
      setTierSettings: (settings) => set({ tierSettings: settings }),
      updateTierSettings: (updates) => set((state) => ({
        tierSettings: { ...state.tierSettings, ...updates, updatedAt: new Date() }
      })),
      updateTierThreshold: (tier, updates) => set((state) => ({
        tierSettings: {
          ...state.tierSettings,
          thresholds: state.tierSettings.thresholds.map(t =>
            t.tier === tier ? { ...t, ...updates } : t
          ),
          updatedAt: new Date()
        }
      })),

      // Popup Modals - 기본 샘플 모달
      popupModals: [
        {
          id: 'modal-1',
          title: '환영합니다!',
          content: '<p>가성비연구소에 오신 것을 환영합니다.</p><p>회원가입 시 <strong>10% 할인 쿠폰</strong>을 드립니다!</p>',
          isActive: false,
          targetPages: ['home'],
          showOnce: true,
          showToLoggedInOnly: false,
          buttonText: '회원가입하기',
          buttonLink: '/register',
          priority: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      setPopupModals: (modals) => set({ popupModals: modals }),
      addPopupModal: (modal) => set((state) => ({
        popupModals: [...state.popupModals, modal]
      })),
      updatePopupModal: (id, updates) => set((state) => ({
        popupModals: state.popupModals.map(m =>
          m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
        )
      })),
      deletePopupModal: (id) => set((state) => ({
        popupModals: state.popupModals.filter(m => m.id !== id)
      })),
      togglePopupModalActive: (id) => set((state) => ({
        popupModals: state.popupModals.map(m =>
          m.id === id ? { ...m, isActive: !m.isActive, updatedAt: new Date() } : m
        )
      })),

      // Site Settings - 기본값 (기본 배너 이미지 사용)
      siteSettings: {
        topBanner: {
          image: '', // 빈 값이면 기본 이미지 사용
          alt: '가성비연구소 PRICE LAB',
          link: '',
          isActive: true,
        },
        updatedAt: new Date(),
      },
      updateSiteSettings: (updates) => set((state) => ({
        siteSettings: { ...state.siteSettings, ...updates, updatedAt: new Date() }
      })),
      updateTopBanner: (updates) => set((state) => ({
        siteSettings: {
          ...state.siteSettings,
          topBanner: { ...state.siteSettings.topBanner, ...updates },
          updatedAt: new Date()
        }
      })),

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
        tierSettings: state.tierSettings,
        products: state.products,
        promotions: state.promotions,
        popupModals: state.popupModals,
        siteSettings: state.siteSettings,
      }),
    }
  )
)
