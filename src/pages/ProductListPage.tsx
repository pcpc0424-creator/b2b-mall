import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Grid, List, Filter, ChevronDown } from 'lucide-react'
import { useStore } from '../store'
import { useAdminStore } from '../admin/store/adminStore'
import { products as defaultProducts, categories } from '../data'
import { ProductCard, ProductTable } from '../components/product'
import { Button, Select, Badge, Card, CardContent } from '../components/ui'
import { cn } from '../lib/utils'
import { Animated } from '../hooks'
import { Product } from '../types'

export function ProductListPage() {
  const { categoryId: paramCategoryId } = useParams()
  const [searchParams] = useSearchParams()
  const { viewMode, setViewMode } = useStore()
  const { products: adminProducts } = useAdminStore()

  // URL path parameter 또는 query parameter에서 categoryId 가져오기
  const categoryId = paramCategoryId || searchParams.get('category')

  // 관리자 상품과 기본 상품 병합 (관리자 상품 우선)
  const products = useMemo((): Product[] => {
    const adminProductIds = new Set(adminProducts.map(p => p.id))
    const activeAdminProducts = adminProducts.filter(p => p.isActive)
    const mergedProducts = [
      ...activeAdminProducts,
      ...defaultProducts.filter(p => !adminProductIds.has(p.id))
    ]
    return mergedProducts
  }, [adminProducts])

  // URL의 sort 파라미터에 따라 초기 정렬 설정
  const getSortFromUrl = () => {
    const sortParam = searchParams.get('sort')
    switch (sortParam) {
      case 'best': return 'recommend'
      case 'new': return 'newest'
      case 'sale': return 'discount'
      default: return 'newest'
    }
  }

  const [sortBy, setSortBy] = useState(getSortFromUrl)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: 'all',
    stockStatus: 'all',
    subcategory: searchParams.get('sub') || 'all',
  })

  // URL 파라미터 변경 시 정렬 및 subcategory 업데이트
  useEffect(() => {
    setSortBy(getSortFromUrl())
    setSelectedFilters(f => ({
      ...f,
      subcategory: searchParams.get('sub') || 'all',
    }))
  }, [searchParams])

  const category = categoryId ? categories.find(c => c.id === parseInt(categoryId)) : null

  // URL의 sort 파라미터에 따른 페이지 제목
  const getPageTitle = () => {
    const sortParam = searchParams.get('sort')
    switch (sortParam) {
      case 'best': return '베스트연구실'
      case 'new': return '신상품연구실'
      case 'sale': return '초특가연구실'
      default: return category ? category.name : '전체 상품'
    }
  }

  // Filter products
  let filteredProducts = categoryId
    ? products.filter(p => p.categoryId === parseInt(categoryId))
    : products

  if (selectedFilters.subcategory !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.subcategory === selectedFilters.subcategory)
  }

  if (selectedFilters.stockStatus !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.stockStatus === selectedFilters.stockStatus)
  }

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.id.localeCompare(a.id) // 최신순
      case 'price_low':
        return a.prices.retail - b.prices.retail // 가격낮은순
      case 'price_high':
        return b.prices.retail - a.prices.retail // 가격높은순
      case 'discount':
        // 할인률순 (retail 대비 member 할인율 기준)
        const discountA = (a.prices.retail - a.prices.member) / a.prices.retail
        const discountB = (b.prices.retail - b.prices.member) / b.prices.retail
        return discountB - discountA
      case 'recommend':
        return 0 // 추천순 (기본 순서 유지)
      default:
        return 0
    }
  })

  const sortOptions = [
    { value: 'newest', label: '최신순' },
    { value: 'price_low', label: '가격낮은순' },
    { value: 'price_high', label: '가격높은순' },
    { value: 'discount', label: '할인률순' },
    { value: 'recommend', label: '추천순' },
  ]

  const priceRangeOptions = [
    { value: 'all', label: '전체 가격' },
    { value: '0-50000', label: '5만원 이하' },
    { value: '50000-100000', label: '5만원 ~ 10만원' },
    { value: '100000-200000', label: '10만원 ~ 20만원' },
    { value: '200000+', label: '20만원 이상' },
  ]

  const stockStatusOptions = [
    { value: 'all', label: '전체 재고' },
    { value: 'available', label: '재고충분' },
    { value: 'low', label: '재고부족' },
    { value: 'out_of_stock', label: '품절 포함' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center flex-wrap">
          <span>홈</span>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-medium">{getPageTitle()}</span>
          {selectedFilters.subcategory !== 'all' && (
            <>
              <span className="mx-2">/</span>
              <span className="text-neutral-900 font-medium">{selectedFilters.subcategory}</span>
            </>
          )}
        </nav>
      </Animated>

      {/* Header */}
      <Animated animation="fade-up" delay={100}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              총 {sortedProducts.length}개의 상품
            </p>
          </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setViewMode('normal')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'normal'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              <Grid className="w-4 h-4" />
              일반 보기
            </button>
            <button
              onClick={() => setViewMode('bulk')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'bulk'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              <List className="w-4 h-4" />
              대량 주문
            </button>
          </div>
        </div>
        </div>
      </Animated>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <Animated animation="fade-left" delay={200} className="w-64 flex-shrink-0 hidden lg:block">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-neutral-900 mb-4">필터</h3>

              {/* Subcategories */}
              {category && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">세부 카테고리</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedFilters(f => ({ ...f, subcategory: 'all' }))}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                        selectedFilters.subcategory === 'all'
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      )}
                    >
                      전체
                    </button>
                    {category.subcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedFilters(f => ({ ...f, subcategory: sub }))}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                          selectedFilters.subcategory === sub
                            ? 'bg-primary-50 text-primary-600 font-medium'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        )}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-neutral-700 mb-2">가격대</h4>
                <Select
                  options={priceRangeOptions}
                  value={selectedFilters.priceRange}
                  onChange={(e) => setSelectedFilters(f => ({ ...f, priceRange: e.target.value }))}
                />
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-neutral-700 mb-2">재고 상태</h4>
                <div className="space-y-1">
                  {stockStatusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedFilters(f => ({ ...f, stockStatus: option.value }))}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                        selectedFilters.stockStatus === option.value
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSelectedFilters({ priceRange: 'all', stockStatus: 'all', subcategory: 'all' })}
              >
                필터 초기화
              </Button>
            </CardContent>
          </Card>
        </Animated>

        {/* Main Content */}
        <Animated animation="fade-up" delay={200} className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border border-neutral-200">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 text-sm text-neutral-600"
            >
              <Filter className="w-4 h-4" />
              필터
            </button>

            {/* Active Filters */}
            <div className="hidden lg:flex items-center gap-2">
              {selectedFilters.subcategory !== 'all' && (
                <Badge variant="primary" className="flex items-center gap-1">
                  {selectedFilters.subcategory}
                  <button
                    onClick={() => setSelectedFilters(f => ({ ...f, subcategory: 'all' }))}
                    className="ml-1 hover:text-primary-900"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedFilters.stockStatus !== 'all' && (
                <Badge variant="primary" className="flex items-center gap-1">
                  {stockStatusOptions.find(o => o.value === selectedFilters.stockStatus)?.label}
                  <button
                    onClick={() => setSelectedFilters(f => ({ ...f, stockStatus: 'all' }))}
                    className="ml-1 hover:text-primary-900"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 whitespace-nowrap">정렬:</span>
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-32"
              />
            </div>
          </div>

          {/* Products */}
          {viewMode === 'normal' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <ProductTable products={sortedProducts} />
          )}

          {sortedProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-neutral-500">조건에 맞는 상품이 없습니다.</p>
            </div>
          )}
        </Animated>
      </div>
    </div>
  )
}
