import { useState, useRef, useEffect } from 'react'
import { Bell, Search, Menu, X, Package, ShoppingCart, Users, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../store/adminStore'
import { useProducts, useOrders, useMembers } from '../../../hooks/queries'

interface SearchResult {
  type: 'product' | 'order' | 'member'
  id: string
  title: string
  subtitle?: string
}

interface Notification {
  id: string
  type: 'order' | 'stock' | 'member'
  title: string
  message: string
  time: Date
  read: boolean
}

export function AdminHeader() {
  const navigate = useNavigate()
  const { adminUser, setMobileSidebarOpen } = useAdminStore()
  const { data: products } = useProducts()
  const { data: orders } = useOrders()
  const { data: members } = useMembers()

  // 검색 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // 알림 상태
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const notificationRef = useRef<HTMLDivElement>(null)

  // 알림 생성 (새 주문, 재고 부족, 신규 회원)
  useEffect(() => {
    const newNotifications: Notification[] = []

    // 대기 중인 주문 알림
    const pendingOrders = orders?.filter(o => o.status === 'pending') || []
    if (pendingOrders.length > 0) {
      newNotifications.push({
        id: 'pending-orders',
        type: 'order',
        title: '새 주문',
        message: `처리 대기 중인 주문이 ${pendingOrders.length}건 있습니다.`,
        time: new Date(),
        read: false,
      })
    }

    // 재고 부족 상품 알림
    const lowStockProducts = products?.filter(p => p.stock <= 10) || []
    if (lowStockProducts.length > 0) {
      newNotifications.push({
        id: 'low-stock',
        type: 'stock',
        title: '재고 부족',
        message: `재고가 부족한 상품이 ${lowStockProducts.length}개 있습니다.`,
        time: new Date(),
        read: false,
      })
    }

    // 승인 대기 회원 알림
    const pendingMembers = members?.filter(m => m.status === 'pending_approval') || []
    if (pendingMembers.length > 0) {
      newNotifications.push({
        id: 'pending-members',
        type: 'member',
        title: '회원 승인 대기',
        message: `승인 대기 중인 회원이 ${pendingMembers.length}명 있습니다.`,
        time: new Date(),
        read: false,
      })
    }

    setNotifications(newNotifications)
  }, [orders, products, members])

  // 검색 기능
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    // 상품 검색
    products?.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.sku?.toLowerCase().includes(query)
    ).slice(0, 3).forEach(p => {
      results.push({
        type: 'product',
        id: p.id,
        title: p.name,
        subtitle: `SKU: ${p.sku || '-'} | 재고: ${p.stock}`,
      })
    })

    // 주문 검색
    orders?.filter(o =>
      o.orderNumber?.toLowerCase().includes(query) ||
      o.user?.name?.toLowerCase().includes(query)
    ).slice(0, 3).forEach(o => {
      results.push({
        type: 'order',
        id: o.id,
        title: `주문 #${o.orderNumber}`,
        subtitle: `${o.user?.name || '고객'} | ${o.totalAmount?.toLocaleString()}원`,
      })
    })

    // 회원 검색
    members?.filter(m =>
      m.name?.toLowerCase().includes(query) ||
      m.email?.toLowerCase().includes(query) ||
      m.company?.toLowerCase().includes(query)
    ).slice(0, 3).forEach(m => {
      results.push({
        type: 'member',
        id: m.id,
        title: m.name,
        subtitle: m.company || m.email,
      })
    })

    setSearchResults(results)
  }, [searchQuery, products, orders, members])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 검색 결과 클릭
  const handleSearchResultClick = (result: SearchResult) => {
    setIsSearchOpen(false)
    setSearchQuery('')
    switch (result.type) {
      case 'product':
        navigate(`/admin/products/${result.id}`)
        break
      case 'order':
        navigate(`/admin/orders/${result.id}`)
        break
      case 'member':
        navigate(`/admin/members/${result.id}`)
        break
    }
  }

  // 알림 클릭
  const handleNotificationClick = (notification: Notification) => {
    setIsNotificationOpen(false)
    switch (notification.type) {
      case 'order':
        navigate('/admin/orders?status=pending')
        break
      case 'stock':
        navigate('/admin/products?stock=low')
        break
      case 'member':
        navigate('/admin/members?status=pending_approval')
        break
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-primary-600" />
      case 'stock':
        return <AlertTriangle className="w-4 h-4 text-warning" />
      case 'member':
        return <Users className="w-4 h-4 text-success" />
    }
  }

  const getSearchResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4 text-neutral-400" />
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-neutral-400" />
      case 'member':
        return <Users className="w-4 h-4 text-neutral-400" />
    }
  }

  return (
    <header className="sticky top-0 z-20 h-14 lg:h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-3 sm:px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-2 -ml-1 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-xs sm:max-w-md" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="상품, 주문, 회원 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsSearchOpen(true)
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-9 sm:pl-10 pr-8 sm:pr-4 py-1.5 sm:py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSearchResults([])
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden z-50">
              {searchResults.length > 0 ? (
                <ul className="divide-y divide-neutral-100">
                  {searchResults.map((result) => (
                    <li key={`${result.type}-${result.id}`}>
                      <button
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-neutral-50 text-left"
                      >
                        {getSearchResultIcon(result.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">{result.title}</p>
                          {result.subtitle && (
                            <p className="text-xs text-neutral-500 truncate">{result.subtitle}</p>
                          )}
                        </div>
                        <span className="text-xs text-neutral-400 capitalize">
                          {result.type === 'product' ? '상품' : result.type === 'order' ? '주문' : '회원'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-4 text-center text-sm text-neutral-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-1.5 sm:p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-error text-white text-xs font-medium rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute top-full right-0 mt-1 w-72 sm:w-80 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden z-50">
              <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-900">알림</h3>
              </div>
              {notifications.length > 0 ? (
                <ul className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full px-3 py-3 flex items-start gap-3 hover:bg-neutral-50 text-left"
                      >
                        <div className="mt-0.5 p-1.5 bg-neutral-100 rounded-full">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900">{notification.title}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{notification.message}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-6 text-center text-sm text-neutral-500">
                  새로운 알림이 없습니다.
                </div>
              )}
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-neutral-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-medium text-primary-600">
              {adminUser?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-neutral-900">{adminUser?.name || '관리자'}</p>
            <p className="text-xs text-neutral-500">
              {adminUser?.role === 'super_admin' ? '최고관리자' :
               adminUser?.role === 'admin' ? '관리자' : '매니저'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
