import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, ShoppingCart, User, Menu, ChevronRight, X,
  Package, Leaf, Pill, Sparkles, Shirt, ChefHat,
  Refrigerator, Monitor, Dumbbell, PawPrint
} from 'lucide-react'
import { useStore, getTierLabel, getTierColor } from '../../store'
import { categories } from '../../data'
import { Input } from '../ui'
import { cn } from '../../lib/utils'

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Package, Leaf, Pill, Sparkles, Shirt, ChefHat,
  Refrigerator, Monitor, Dumbbell, PawPrint
}

export function Header() {
  const { user, isLoggedIn, cart, isMegaMenuOpen, setMegaMenuOpen } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false)

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      {/* Top Bar */}
      <div className="bg-neutral-900 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          {/* 고객센터 - PC만 표시 */}
          <div className="hidden md:flex items-center gap-4">
            <span>고객센터: 1588-0000</span>
            <span className="text-neutral-400">평일 09:00 - 18:00</span>
          </div>
          {/* 사용자 정보 */}
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
            {isLoggedIn && user ? (
              <>
                <span className="flex items-center gap-1 md:gap-2">
                  <span className={cn('px-1.5 md:px-2 py-0.5 rounded text-xs font-medium', getTierColor(user.tier))}>
                    {getTierLabel(user.tier)}
                  </span>
                  <span className="truncate max-w-[80px] md:max-w-none">{user.name}님</span>
                </span>
                <div className="flex items-center gap-2 md:gap-4">
                  <Link to="/dashboard" className="hover:text-primary-400">마이페이지</Link>
                  <button className="hover:text-primary-400">로그아웃</button>
                </div>
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

      {/* Category Navigation Bar - Like the reference image */}
      <div className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-12">
            {/* Mobile Quick Navigation - 중앙정렬 */}
            <nav className="md:hidden flex items-center justify-center flex-1 gap-3">
              <Link
                to="/products?sort=best"
                className="text-xs text-neutral-700 hover:text-primary-600 transition-colors whitespace-nowrap"
              >
                베스트연구실
              </Link>
              <Link
                to="/products?sort=new"
                className="text-xs text-neutral-700 hover:text-primary-600 transition-colors whitespace-nowrap"
              >
                신상품연구실
              </Link>
              <Link
                to="/products?sort=sale"
                className="text-xs text-neutral-700 hover:text-primary-600 transition-colors whitespace-nowrap"
              >
                초특가연구실
              </Link>
              <Link
                to="/promotions"
                className="text-xs text-neutral-700 hover:text-primary-600 transition-colors whitespace-nowrap"
              >
                기획전연구실
              </Link>
              {/* 소통연구실 with dropdown - 터치 방식 */}
              <div className="relative">
                <button
                  onClick={() => setMobileCommunityOpen(!mobileCommunityOpen)}
                  className="text-xs text-neutral-700 hover:text-primary-600 transition-colors flex items-center gap-0.5 whitespace-nowrap"
                >
                  소통연구실
                  <ChevronRight className={cn(
                    "w-3 h-3 transition-transform",
                    mobileCommunityOpen ? "rotate-[270deg]" : "rotate-90"
                  )} />
                </button>
                <div className={cn(
                  "absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all z-50",
                  mobileCommunityOpen ? "opacity-100 visible" : "opacity-0 invisible"
                )}>
                  <div className="bg-white border border-neutral-200 rounded-lg shadow-lg py-2 min-w-[120px]">
                    <Link
                      to="/community/notice"
                      onClick={() => setMobileCommunityOpen(false)}
                      className="block px-4 py-2 text-xs text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      공지사항
                    </Link>
                    <Link
                      to="/community/faq"
                      onClick={() => setMobileCommunityOpen(false)}
                      className="block px-4 py-2 text-xs text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      자주묻는질문
                    </Link>
                    <Link
                      to="/community/qna"
                      onClick={() => setMobileCommunityOpen(false)}
                      className="block px-4 py-2 text-xs text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      상품Q&A
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            {/* 전체카테고리 Menu Trigger - PC only */}
            <div className="hidden md:block relative mr-6">
              <button
                onClick={() => {
                  const nextState = !isMegaMenuOpen
                  setMegaMenuOpen(nextState)
                  if (nextState) {
                    setHoveredCategory(categories[0]?.id || null)
                  }
                }}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                {isMegaMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                <span className="font-medium text-sm">전체카테고리</span>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  isMegaMenuOpen ? "rotate-[270deg]" : "rotate-90"
                )} />
              </button>

              {/* Category Dropdown Menu - PC */}
              <div className={cn(
                "hidden md:block absolute left-0 top-full mt-2 z-50 bg-white shadow-xl border border-neutral-200 rounded-lg overflow-hidden transition-all duration-300 ease-out origin-top",
                isMegaMenuOpen
                  ? "opacity-100 translate-y-0 visible"
                  : "opacity-0 -translate-y-2 invisible"
              )}>
                <div className="flex">
                  {/* Main Categories */}
                  <div className="w-56 border-r border-neutral-100">
                    <ul className="py-2">
                      {categories.map((category, index) => {
                        const IconComponent = category.icon ? iconMap[category.icon] : null
                        return (
                          <li
                            key={category.id}
                            className={cn(
                              "transition-all duration-300",
                              isMegaMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                            )}
                            style={{ transitionDelay: isMegaMenuOpen ? `${index * 30}ms` : '0ms' }}
                          >
                            <Link
                              to={`/products?category=${category.id}`}
                              onMouseEnter={() => setHoveredCategory(category.id)}
                              onClick={() => setMegaMenuOpen(false)}
                              className={cn(
                                'flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-200',
                                hoveredCategory === category.id
                                  ? 'bg-primary-50 text-primary-600 pl-5'
                                  : 'text-neutral-700 hover:bg-neutral-50'
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {IconComponent && (
                                  <IconComponent className={cn(
                                    "w-5 h-5 transition-transform duration-200",
                                    hoveredCategory === category.id ? "text-primary-500 scale-110" : "text-neutral-400"
                                  )} />
                                )}
                                <span>{category.name}</span>
                              </div>
                              <ChevronRight className={cn(
                                "w-4 h-4 transition-transform duration-200",
                                hoveredCategory === category.id ? "text-primary-400 translate-x-1" : "text-neutral-300"
                              )} />
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  {/* Subcategories Panel */}
                  <div className="w-64 bg-neutral-50 min-h-[320px] overflow-hidden">
                    <div
                      key={hoveredCategory}
                      className="p-4 animate-fade-in"
                    >
                      {hoveredCategory && (
                        <>
                          <h3 className="text-sm font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200">
                            {categories.find(c => c.id === hoveredCategory)?.name}
                          </h3>
                          <ul className="space-y-1">
                            {categories
                              .find(c => c.id === hoveredCategory)
                              ?.subcategories.map((sub, idx) => (
                                <li
                                  key={idx}
                                  className="animate-slide-in"
                                  style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                  <Link
                                    to={`/products?category=${hoveredCategory}&sub=${encodeURIComponent(sub)}`}
                                    onClick={() => setMegaMenuOpen(false)}
                                    className="block px-3 py-2 text-sm text-neutral-600 hover:text-primary-600 hover:bg-white hover:pl-4 rounded-md transition-all duration-200"
                                  >
                                    {sub}
                                  </Link>
                                </li>
                              ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Navigation Links - Centered */}
            <nav className="hidden md:flex items-center justify-center flex-1 gap-8">
              <Link
                to="/products?sort=best"
                className="text-sm text-neutral-700 hover:text-primary-600 transition-colors"
              >
                베스트연구실
              </Link>
              <Link
                to="/products?sort=new"
                className="text-sm text-neutral-700 hover:text-primary-600 transition-colors"
              >
                신상품연구실
              </Link>
              <Link
                to="/products?sort=sale"
                className="text-sm text-neutral-700 hover:text-primary-600 transition-colors"
              >
                초특가연구실
              </Link>
              <Link
                to="/promotions"
                className="text-sm text-neutral-700 hover:text-primary-600 transition-colors"
              >
                기획전연구실
              </Link>
              {/* 소통연구실 with dropdown */}
              <div className="relative group">
                <button className="text-sm text-neutral-700 hover:text-primary-600 transition-colors flex items-center gap-1">
                  소통연구실
                  <ChevronRight className="w-3 h-3 rotate-90 group-hover:rotate-[270deg] transition-transform" />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-white border border-neutral-200 rounded-lg shadow-lg py-2 min-w-[140px]">
                    <Link
                      to="/community/notice"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      공지사항
                    </Link>
                    <Link
                      to="/community/faq"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      자주묻는질문
                    </Link>
                    <Link
                      to="/community/qna"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      상품Q&A
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4 md:gap-8">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl font-bold text-primary-600">정담B2B</h1>
          </Link>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-md">
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
          <div className="flex items-center gap-1 md:gap-2">
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
            {/* Category Menu Trigger - Mobile */}
            <div className="relative md:hidden">
              <button
                onClick={() => setMegaMenuOpen(!isMegaMenuOpen)}
                className="p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                {isMegaMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Mobile Dropdown Menu - 햄버거 버튼 아래로 */}
              <div className={cn(
                "absolute right-0 top-full mt-2 z-50 bg-white shadow-xl border border-neutral-200 rounded-lg transition-all duration-300 origin-top-right w-[calc(100vw-2rem)]",
                isMegaMenuOpen
                  ? "opacity-100 scale-100 visible"
                  : "opacity-0 scale-95 invisible"
              )}>
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {/* 검색창 */}
                <div className="p-3 border-b border-neutral-100">
                  <div className="relative">
                    <Input
                      placeholder="SKU 또는 상품명 검색"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={<Search className="w-4 h-4" />}
                      className="pr-16"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700 transition-colors">
                      검색
                    </button>
                  </div>
                </div>

                {/* 퀵 메뉴 */}
                <div className="p-2 border-b border-neutral-100 grid grid-cols-4 gap-1">
                  <Link
                    to="/products?sort=best"
                    onClick={() => setMegaMenuOpen(false)}
                    className="flex flex-col items-center gap-1 p-2 text-xs text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <span className="text-lg">🔥</span>
                    <span>베스트</span>
                  </Link>
                  <Link
                    to="/products?sort=new"
                    onClick={() => setMegaMenuOpen(false)}
                    className="flex flex-col items-center gap-1 p-2 text-xs text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <span className="text-lg">✨</span>
                    <span>신상품</span>
                  </Link>
                  <Link
                    to="/products?sort=sale"
                    onClick={() => setMegaMenuOpen(false)}
                    className="flex flex-col items-center gap-1 p-2 text-xs text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <span className="text-lg">💰</span>
                    <span>초특가</span>
                  </Link>
                  <Link
                    to="/promotions"
                    onClick={() => setMegaMenuOpen(false)}
                    className="flex flex-col items-center gap-1 p-2 text-xs text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <span className="text-lg">🎁</span>
                    <span>기획전</span>
                  </Link>
                </div>

                {/* 카테고리 */}
                <ul className="py-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon ? iconMap[category.icon] : null
                    const isExpanded = expandedCategory === category.id
                    return (
                      <li key={category.id} className="border-b border-neutral-100 last:border-b-0">
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-3 text-sm transition-colors',
                            isExpanded
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-neutral-700 active:bg-neutral-50'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {IconComponent && (
                              <IconComponent className={cn(
                                "w-5 h-5",
                                isExpanded ? "text-primary-500" : "text-neutral-400"
                              )} />
                            )}
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <ChevronRight className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isExpanded ? "rotate-90 text-primary-400" : "text-neutral-300"
                          )} />
                        </button>

                        <div className={cn(
                          "overflow-hidden transition-all duration-300",
                          isExpanded ? "max-h-96" : "max-h-0"
                        )}>
                          <div className="bg-neutral-50 px-4 py-2">
                            <Link
                              to={`/products?category=${category.id}`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="block px-3 py-2 text-sm text-primary-600 font-medium hover:bg-white rounded-md transition-colors"
                            >
                              전체보기
                            </Link>
                            {category.subcategories.map((sub, idx) => (
                              <Link
                                key={idx}
                                to={`/products?category=${category.id}&sub=${encodeURIComponent(sub)}`}
                                onClick={() => setMegaMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-neutral-600 hover:text-primary-600 hover:bg-white rounded-md transition-colors"
                              >
                                {sub}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for closing menu */}
      {isMegaMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMegaMenuOpen(false)}
        />
      )}
    </header>
  )
}
