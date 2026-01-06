import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, ChevronDown, Zap, Gift, X } from 'lucide-react'
import { useStore, getTierLabel, getTierColor } from '../../store'
import { categories } from '../../data'
import { Button, Input, Badge } from '../ui'
import { cn } from '../../lib/utils'

export function Header() {
  const { user, isLoggedIn, cart, isMegaMenuOpen, setMegaMenuOpen } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      {/* Top Bar */}
      <div className="bg-neutral-900 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>고객센터: 1588-0000</span>
            <span className="text-neutral-400">평일 09:00 - 18:00</span>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn && user ? (
              <>
                <span className="flex items-center gap-2">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getTierColor(user.tier))}>
                    {getTierLabel(user.tier)}
                  </span>
                  <span>{user.name}님</span>
                </span>
                <Link to="/dashboard" className="hover:text-primary-400">마이페이지</Link>
                <button className="hover:text-primary-400">로그아웃</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary-400">로그인</Link>
                <Link to="/register" className="hover:text-primary-400">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl font-bold text-primary-600">정담B2B</h1>
          </Link>

          {/* Category Menu Trigger */}
          <button
            onClick={() => setMegaMenuOpen(!isMegaMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            {isMegaMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="font-medium">전체 카테고리</span>
            <ChevronDown className={cn('w-4 h-4 transition-transform', isMegaMenuOpen && 'rotate-180')} />
          </button>

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/quick-order"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
            >
              <Zap className="w-4 h-4" />
              빠른 주문
            </Link>
            <Link
              to="/promotions"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-accent-600 hover:bg-accent-50 rounded-md transition-colors"
            >
              <Gift className="w-4 h-4" />
              기획전
            </Link>
            {isLoggedIn && user && (user.tier === 'vip' || user.tier === 'wholesale' || user.tier === 'partner') && (
              <Link
                to="/exclusive"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
              >
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">ONLY</span>
                등급 전용
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Input
                placeholder="SKU 또는 상품명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                className="pr-20"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700 transition-colors">
                검색
              </button>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>
            <Link
              to="/cart"
              className="relative p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-error text-white text-xs font-bold rounded-full">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mega Menu */}
      {isMegaMenuOpen && (
        <div className="absolute left-0 right-0 bg-white border-b border-neutral-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex">
              {/* Category List */}
              <div className="w-64 border-r border-neutral-200 pr-6">
                <h3 className="text-sm font-bold text-neutral-900 mb-4">카테고리</h3>
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        onMouseEnter={() => setHoveredCategory(category.id)}
                        onClick={() => {
                          setMegaMenuOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between',
                          hoveredCategory === category.id
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-neutral-700 hover:bg-neutral-100'
                        )}
                      >
                        <span>{category.name}</span>
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subcategories */}
              <div className="flex-1 pl-6">
                {hoveredCategory && (
                  <>
                    <h3 className="text-sm font-bold text-neutral-900 mb-4">
                      {categories.find(c => c.id === hoveredCategory)?.name}
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {categories
                        .find(c => c.id === hoveredCategory)
                        ?.subcategories.map((sub, idx) => (
                          <Link
                            key={idx}
                            to={`/category/${hoveredCategory}?sub=${sub}`}
                            onClick={() => setMegaMenuOpen(false)}
                            className="px-3 py-2 text-sm text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          >
                            {sub}
                          </Link>
                        ))}
                    </div>
                  </>
                )}
                {!hoveredCategory && (
                  <div className="text-sm text-neutral-500">카테고리를 선택하세요</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
