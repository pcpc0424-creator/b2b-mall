import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  AdminUser,
  AdminDashboardStats,
  ProductFilters,
  OrderFilters,
  MemberFilters,
  PromotionFilters,
  PaginationParams,
} from '../types/admin'

interface AdminState {
  // Auth
  adminUser: AdminUser | null
  isAdminAuthenticated: boolean
  adminLogin: (user: AdminUser) => void
  adminLogout: () => void

  // Dashboard (mock data)
  dashboardStats: AdminDashboardStats | null
  setDashboardStats: (stats: AdminDashboardStats) => void

  // UI: Filters & Pagination
  productFilters: ProductFilters
  productPagination: PaginationParams
  selectedProductIds: string[]
  setProductFilters: (filters: ProductFilters) => void
  setProductPagination: (pagination: PaginationParams) => void
  setSelectedProductIds: (ids: string[]) => void

  orderFilters: OrderFilters
  orderPagination: PaginationParams
  setOrderFilters: (filters: OrderFilters) => void
  setOrderPagination: (pagination: PaginationParams) => void

  memberFilters: MemberFilters
  memberPagination: PaginationParams
  setMemberFilters: (filters: MemberFilters) => void
  setMemberPagination: (pagination: PaginationParams) => void

  promotionFilters: PromotionFilters
  setPromotionFilters: (filters: PromotionFilters) => void

  // UI: Sidebar
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

      // Dashboard
      dashboardStats: null,
      setDashboardStats: (stats) => set({ dashboardStats: stats }),

      // UI: Filters & Pagination
      productFilters: {},
      productPagination: { page: 1, limit: 20 },
      selectedProductIds: [],
      setProductFilters: (filters) => set({ productFilters: filters }),
      setProductPagination: (pagination) => set({ productPagination: pagination }),
      setSelectedProductIds: (ids) => set({ selectedProductIds: ids }),

      orderFilters: {},
      orderPagination: { page: 1, limit: 20 },
      setOrderFilters: (filters) => set({ orderFilters: filters }),
      setOrderPagination: (pagination) => set({ orderPagination: pagination }),

      memberFilters: {},
      memberPagination: { page: 1, limit: 20 },
      setMemberFilters: (filters) => set({ memberFilters: filters }),
      setMemberPagination: (pagination) => set({ memberPagination: pagination }),

      promotionFilters: {},
      setPromotionFilters: (filters) => set({ promotionFilters: filters }),

      // UI: Sidebar
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({
        isSidebarCollapsed: !state.isSidebarCollapsed
      })),
      isMobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        adminUser: state.adminUser,
        isAdminAuthenticated: state.isAdminAuthenticated,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
)
