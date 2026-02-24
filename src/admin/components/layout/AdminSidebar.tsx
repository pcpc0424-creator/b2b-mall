import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Crown,
  MessageSquare,
  MessageCircle,
  Image,
  LayoutGrid,
  Bell,
  HelpCircle,
} from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { cn } from '../../../lib/utils'

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: '대시보드', end: true },
  { path: '/admin/products', icon: Package, label: '상품 관리' },
  { path: '/admin/promotions', icon: Megaphone, label: '프로모션 관리' },
  { path: '/admin/orders', icon: ShoppingCart, label: '주문 관리' },
  { path: '/admin/members', icon: Users, label: '회원 관리' },
  { path: '/admin/notices', icon: Bell, label: '공지사항 관리' },
  { path: '/admin/faqs', icon: HelpCircle, label: 'FAQ 관리' },
  { path: '/admin/qna', icon: MessageCircle, label: 'Q&A 관리' },
  { path: '/admin/home-sections', icon: LayoutGrid, label: '홈 섹션 관리' },
  { path: '/admin/settings/banner', icon: Image, label: '배너 이미지' },
  { path: '/admin/settings/modals', icon: MessageSquare, label: '팝업 모달' },
  { path: '/admin/settings/tiers', icon: Crown, label: '등급 설정' },
  { path: '/admin/settings/shipping', icon: Truck, label: '배송비 설정' },
]

export function AdminSidebar() {
  const location = useLocation()
  const {
    isSidebarCollapsed,
    toggleSidebar,
    adminLogout,
    adminUser,
    isMobileSidebarOpen,
    setMobileSidebarOpen
  } = useAdminStore()

  const handleNavClick = () => {
    // 모바일에서 메뉴 클릭 시 사이드바 닫기
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(false)
    }
  }

  return (
    <aside
      className={cn(
        'fixed top-0 h-screen bg-neutral-900 text-white transition-all duration-300 z-40',
        // Desktop
        'lg:left-0',
        isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64',
        // Mobile
        'w-64',
        isMobileSidebarOpen ? 'left-0' : '-left-64',
        'lg:translate-x-0'
      )}
    >
      {/* Logo */}
      <div className="h-14 lg:h-16 flex items-center justify-between px-4 border-b border-neutral-800">
        {!isSidebarCollapsed && (
          <span className="text-lg font-bold text-primary-400">관리자</span>
        )}
        {/* Desktop toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
        {/* Mobile close */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {(!isSidebarCollapsed || window.innerWidth < 1024) && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800">
        {(!isSidebarCollapsed || window.innerWidth < 1024) && adminUser && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-white truncate">{adminUser.name}</p>
            <p className="text-xs text-neutral-400 truncate">{adminUser.email}</p>
          </div>
        )}
        <button
          onClick={() => {
            adminLogout()
            setMobileSidebarOpen(false)
          }}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors',
            isSidebarCollapsed && 'lg:justify-center'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!isSidebarCollapsed || window.innerWidth < 1024) && (
            <span className="text-sm font-medium">로그아웃</span>
          )}
        </button>
      </div>
    </aside>
  )
}
