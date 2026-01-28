import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Zap, ArrowRight, Clock, ShoppingCart, Lock } from 'lucide-react'
import { useStore, getTierLabel, getPriceByTier } from '../store'
import { useProducts, usePromotions, useSiteSettings, useCategories, useHomeSections } from '../hooks/queries'
import { ProductCard } from '../components/product'
import { Button, Badge, Card, CardContent } from '../components/ui'
import { cn, formatPrice } from '../lib/utils'
import { Animated } from '../hooks'

export function HomePage() {
  const { user, isLoggedIn } = useStore()
  const { data: products = [] } = useProducts()
  const { data: promotions = [] } = usePromotions()
  const { data: siteSettings } = useSiteSettings()
  const { data: categories = [] } = useCategories()
  const [currentSlide, setCurrentSlide] = useState(0)

  // 상품 캐러셀 슬라이드 인덱스
  const [productSlide1, setProductSlide1] = useState(0)
  const [productSlide2, setProductSlide2] = useState(0)
  const [productSlide3, setProductSlide3] = useState(0)
  const itemsPerView = 5 // 한 번에 보여줄 상품 수

  const tier = user?.tier || 'guest'
  const { data: homeSections = [] } = useHomeSections()

  // 큐레이션 상품 배열 (관리자가 등록한 순서대로, 없으면 기존 폴백)
  const bestProducts = useMemo(() => {
    const curated = homeSections
      .filter((s) => s.sectionType === 'best')
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((s) => products.find((p) => p.id === s.productId))
      .filter(Boolean) as typeof products
    return curated.length > 0 ? curated : products.slice(0, 10)
  }, [homeSections, products])

  const newProducts = useMemo(() => {
    const curated = homeSections
      .filter((s) => s.sectionType === 'new')
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((s) => products.find((p) => p.id === s.productId))
      .filter(Boolean) as typeof products
    return curated.length > 0 ? curated : products.slice(5, 15)
  }, [homeSections, products])

  const saleProducts = useMemo(() => {
    const curated = homeSections
      .filter((s) => s.sectionType === 'sale')
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((s) => products.find((p) => p.id === s.productId))
      .filter(Boolean) as typeof products
    return curated.length > 0 ? curated : products.slice(10, 20)
  }, [homeSections, products])

  // Filter promotions based on user tier and active status
  // isActive가 true인 프로모션만 표시
  const visiblePromotions = promotions
    .filter(p => p.isActive)
    .filter(p => tier === 'guest' || p.targetTiers.includes(tier))
  const heroPromotions = visiblePromotions.slice(0, 3)

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroPromotions.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroPromotions.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroPromotions.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroPromotions.length) % heroPromotions.length)


  // Get best products per category
  const getCategoryBestProducts = (categoryId: number) => {
    return products.filter(p => p.categoryId === categoryId).slice(0, 3)
  }

  // 배너 설정
  const bannerImage = siteSettings?.topBanner?.image || `${import.meta.env.BASE_URL}be.jpeg`
  const bannerAlt = siteSettings?.topBanner?.alt || '가성비연구소 PRICE LAB'
  const bannerLink = siteSettings?.topBanner?.link
  const isBannerActive = siteSettings?.topBanner?.isActive ?? true

  return (
    <div>
      {/* Top Banner - 가성비연구소 */}
      {isBannerActive && (
        <section className="w-full">
          {bannerLink ? (
            <a href={bannerLink} className="block">
              <img
                src={bannerImage}
                alt={bannerAlt}
                className="w-full h-auto object-cover"
              />
            </a>
          ) : (
            <img
              src={bannerImage}
              alt={bannerAlt}
              className="w-full h-auto object-cover"
            />
          )}
        </section>
      )}

      {/* Hero Section - 캐러셀 스타일 */}
      {heroPromotions.length > 0 && (
      <section className="relative bg-neutral-100 py-2 md:py-6 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-2 md:px-4">
          <div className="relative h-[200px] md:h-[400px]">
            {/* 슬라이드 컨테이너 */}
            <div className="flex items-center justify-center h-full">
              {heroPromotions.map((promo, index) => {
                const isActive = index === currentSlide
                const isPrev = index === (currentSlide - 1 + heroPromotions.length) % heroPromotions.length
                const isNext = index === (currentSlide + 1) % heroPromotions.length

                return (
                  <div
                    key={promo.id}
                    className={cn(
                      'absolute transition-all duration-500 ease-in-out rounded-xl md:rounded-2xl overflow-hidden shadow-xl',
                      isActive && 'z-20 scale-100 opacity-100',
                      isPrev && 'z-10 -translate-x-[90%] md:-translate-x-[85%] scale-[0.85] md:scale-90 opacity-40 md:opacity-50',
                      isNext && 'z-10 translate-x-[90%] md:translate-x-[85%] scale-[0.85] md:scale-90 opacity-40 md:opacity-50',
                      !isActive && !isPrev && !isNext && 'z-0 scale-75 opacity-0'
                    )}
                    style={{
                      width: 'calc(100% - 32px)',
                      maxWidth: '900px',
                      height: '100%'
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${promo.image})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-900/30 md:from-neutral-900/80 md:via-neutral-900/50 md:to-transparent" />
                    </div>
                    <div className="relative h-full flex items-center p-4 md:p-10">
                      <div className={cn(
                        "w-full md:max-w-md transition-all duration-500",
                        isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                      )}>
                        {promo.type === 'exclusive' && (
                          <Badge variant="warning" className="mb-2 md:mb-3 text-[10px] md:text-xs">
                            {getTierLabel(tier)} 전용
                          </Badge>
                        )}
                        {promo.type === 'timesale' && (
                          <Badge variant="error" className="mb-2 md:mb-3 text-[10px] md:text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            타임특가
                          </Badge>
                        )}
                        <h2 className="text-lg md:text-3xl font-bold text-white mb-2 md:mb-3 line-clamp-2">{promo.title}</h2>
                        <p className="text-xs md:text-base text-neutral-200 mb-3 md:mb-5 line-clamp-2">{promo.description}</p>
                        <div className="flex gap-2">
                          <Link to={`/promotion/${promo.id}`}>
                            <Button size="sm" className="btn-hover text-[10px] md:text-sm px-3 py-1.5 md:px-4 md:py-2">
                              <Zap className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                              자세히 보기
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Slide Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 shadow-lg hover:bg-white flex items-center justify-center text-neutral-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 shadow-lg hover:bg-white flex items-center justify-center text-neutral-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {heroPromotions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  index === currentSlide ? 'w-8 bg-primary-600' : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                )}
              />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* 베스트연구실 */}
      <section className="py-6 md:py-10 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-0 md:px-4">
          <Animated animation="fade-up">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              {/* 왼쪽 타이틀 영역 */}
              <div className="md:w-44 flex-shrink-0 flex items-center justify-between md:block px-3 md:px-0">
                <h2 className="text-lg md:text-3xl font-bold text-neutral-900 leading-tight">
                  베스트연구실
                </h2>
                <Link to="/products?sort=best" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 md:mt-3 link-hover">
                  전체보기 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {/* 오른쪽 캐러셀 영역 */}
              <div className="flex-1 min-w-0 relative md:px-12">
                {/* 좌측 화살표 - 데스크탑만 */}
                <button
                  onClick={() => setProductSlide1(Math.max(0, productSlide1 - 1))}
                  className={cn(
                    "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center transition-all",
                    productSlide1 === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-neutral-100"
                  )}
                  disabled={productSlide1 === 0}
                >
                  <ChevronLeft className="w-6 h-6 text-neutral-600" />
                </button>
                {/* 모바일: 터치 스크롤, 데스크탑: 캐러셀 */}
                {/* 모바일 전용 스크롤 */}
                <div className="flex md:hidden gap-2 overflow-x-auto scrollbar-hide px-3 snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {bestProducts.map((product) => {
                    const retailPrice = product.prices.retail
                    const memberPrice = product.prices.member
                    const currentPrice = getPriceByTier(product, tier)
                    const salePrice = tier === 'guest' ? memberPrice : currentPrice
                    const discountRate = Math.round((1 - salePrice / retailPrice) * 100)
                    return (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="flex-shrink-0 w-[calc(50%-4px)] snap-start group"
                      >
                        <div className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-neutral-100">
                          <div className="aspect-[4/3] flex items-center justify-center p-1 bg-neutral-50">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="px-2 py-1.5 border-t border-neutral-100">
                            <p className="text-[10px] text-neutral-500 truncate">{product.brand}</p>
                            <p className="text-xs font-medium text-neutral-800 truncate">{product.name}</p>
                            <div className="mt-1">
                              {isLoggedIn ? (
                                <>
                                  <p className="text-[10px] text-neutral-400 line-through">{formatPrice(retailPrice)}</p>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold text-red-500">{discountRate}%</span>
                                    <span className="text-xs font-bold text-neutral-900">{formatPrice(salePrice)}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-1 text-neutral-400">
                                  <Lock className="w-3 h-3" />
                                  <span className="text-[10px]">회원전용</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
                {/* 데스크탑 전용 캐러셀 */}
                <div className="hidden md:block overflow-hidden">
                  <div
                    className="flex gap-4 transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${productSlide1 * 188}px)` }}
                  >
                    {bestProducts.map((product) => {
                      const retailPrice = product.prices.retail
                      const memberPrice = product.prices.member
                      const currentPrice = getPriceByTier(product, tier)
                      const salePrice = tier === 'guest' ? memberPrice : currentPrice
                      const discountRate = Math.round((1 - salePrice / retailPrice) * 100)
                      return (
                        <Link
                          key={`desktop-${product.id}`}
                          to={`/product/${product.id}`}
                          className="flex-shrink-0 group"
                        >
                          <div className="w-44 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-100">
                            <div className="h-28 flex items-center justify-center p-2 bg-neutral-50">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="px-3 py-2 border-t border-neutral-100">
                              <p className="text-[10px] text-neutral-500 truncate">{product.brand}</p>
                              <p className="text-xs font-medium text-neutral-800 truncate">{product.name}</p>
                              <div className="mt-1">
                                {isLoggedIn ? (
                                  <>
                                    <p className="text-[10px] text-neutral-400 line-through">{formatPrice(retailPrice)}</p>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs font-bold text-red-500">{discountRate}%</span>
                                      <span className="text-xs font-bold text-neutral-900">{formatPrice(salePrice)}</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-1 text-neutral-400">
                                    <Lock className="w-3 h-3" />
                                    <span className="text-[10px]">회원전용</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
                {/* 우측 화살표 - 데스크탑만 */}
                <button
                  onClick={() => setProductSlide1(Math.min(bestProducts.length - itemsPerView, productSlide1 + 1))}
                  className={cn(
                    "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center transition-all",
                    productSlide1 >= bestProducts.length - itemsPerView ? "opacity-30 cursor-not-allowed" : "hover:bg-neutral-100"
                  )}
                  disabled={productSlide1 >= bestProducts.length - itemsPerView}
                >
                  <ChevronRight className="w-6 h-6 text-neutral-600" />
                </button>
                {/* 페이지네이션 dots - 데스크탑만 */}
                <div className="hidden md:flex justify-center gap-2 mt-4">
                  {Array.from({ length: bestProducts.length - itemsPerView + 1 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setProductSlide1(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === productSlide1 ? "bg-neutral-800" : "bg-neutral-300 hover:bg-neutral-400"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Animated>
        </div>
      </section>

      {/* 신상품연구실 */}
      <section className="py-6 md:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-0 md:px-4">
          <Animated animation="fade-up">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              {/* 왼쪽 타이틀 영역 */}
              <div className="md:w-44 flex-shrink-0 flex items-center justify-between md:block px-3 md:px-0">
                <h2 className="text-lg md:text-3xl font-bold text-neutral-900 leading-tight">
                  신상품연구실
                </h2>
                <Link to="/products?sort=new" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 md:mt-3 link-hover">
                  전체보기 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {/* 오른쪽 캐러셀 영역 */}
              <div className="flex-1 min-w-0 relative md:px-12">
                {/* 좌측 화살표 - 데스크탑만 */}
                <button
                  onClick={() => setProductSlide2(Math.max(0, productSlide2 - 1))}
                  className={cn(
                    "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center transition-all",
                    productSlide2 === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-neutral-100"
                  )}
                  disabled={productSlide2 === 0}
                >
                  <ChevronLeft className="w-6 h-6 text-neutral-600" />
                </button>
                {/* 모바일 전용 스크롤 */}
                <div className="flex md:hidden gap-2 overflow-x-auto scrollbar-hide px-3 snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {newProducts.map((product) => {
                    const retailPrice = product.prices.retail
                    const memberPrice = product.prices.member
                    const currentPrice = getPriceByTier(product, tier)
                    const salePrice = tier === 'guest' ? memberPrice : currentPrice
                    const discountRate = Math.round((1 - salePrice / retailPrice) * 100)
                    return (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="flex-shrink-0 w-[calc(50%-4px)] snap-start group"
                      >
                        <div className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-neutral-100">
                          <div className="aspect-[4/3] flex items-center justify-center p-1 bg-neutral-50">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="px-2 py-1.5 border-t border-neutral-100">
                            <p className="text-[10px] text-neutral-500 truncate">{product.brand}</p>
                            <p className="text-xs font-medium text-neutral-800 truncate">{product.name}</p>
                            <div className="mt-1">
                              {isLoggedIn ? (
                                <>
                                  <p className="text-[10px] text-neutral-400 line-through">{formatPrice(retailPrice)}</p>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold text-red-500">{discountRate}%</span>
                                    <span className="text-xs font-bold text-neutral-900">{formatPrice(salePrice)}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-1 text-neutral-400">
                                  <Lock className="w-3 h-3" />
                                  <span className="text-[10px]">회원전용</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
                {/* 데스크탑 전용 캐러셀 */}
                <div className="hidden md:block overflow-hidden">
                  <div
                    className="flex gap-4 transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${productSlide2 * 188}px)` }}
                  >
                    {newProducts.map((product) => {
                      const retailPrice = product.prices.retail
                      const memberPrice = product.prices.member
                      const currentPrice = getPriceByTier(product, tier)
                      const salePrice = tier === 'guest' ? memberPrice : currentPrice
                      const discountRate = Math.round((1 - salePrice / retailPrice) * 100)
                      return (
                        <Link
                          key={`desktop-${product.id}`}
                          to={`/product/${product.id}`}
                          className="flex-shrink-0 group"
                        >
                          <div className="w-44 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-100">
                            <div className="h-28 flex items-center justify-center p-2 bg-neutral-50">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="px-3 py-2 border-t border-neutral-100">
                              <p className="text-[10px] text-neutral-500 truncate">{product.brand}</p>
                              <p className="text-xs font-medium text-neutral-800 truncate">{product.name}</p>
                              <div className="mt-1">
                                {isLoggedIn ? (
                                  <>
                                    <p className="text-[10px] text-neutral-400 line-through">{formatPrice(retailPrice)}</p>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs font-bold text-red-500">{discountRate}%</span>
                                      <span className="text-xs font-bold text-neutral-900">{formatPrice(salePrice)}</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-1 text-neutral-400">
                                    <Lock className="w-3 h-3" />
                                    <span className="text-[10px]">회원전용</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
                {/* 우측 화살표 - 데스크탑만 */}
                <button
                  onClick={() => setProductSlide2(Math.min(newProducts.length - itemsPerView, productSlide2 + 1))}
                  className={cn(
                    "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center transition-all",
                    productSlide2 >= newProducts.length - itemsPerView ? "opacity-30 cursor-not-allowed" : "hover:bg-neutral-100"
                  )}
                  disabled={productSlide2 >= newProducts.length - itemsPerView}
                >
                  <ChevronRight className="w-6 h-6 text-neutral-600" />
                </button>
                {/* 페이지네이션 dots - 데스크탑만 */}
                <div className="hidden md:flex justify-center gap-2 mt-4">
                  {Array.from({ length: newProducts.length - itemsPerView + 1 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setProductSlide2(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === productSlide2 ? "bg-neutral-800" : "bg-neutral-300 hover:bg-neutral-400"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Animated>
        </div>
      </section>

      {/* 초특가연구실 */}
      <section className="py-6 md:py-10 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-0 md:px-4">
          <Animated animation="fade-up">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              {/* 왼쪽 타이틀 영역 */}
              <div className="md:w-44 flex-shrink-0 flex items-center justify-between md:block px-3 md:px-0">
                <h2 className="text-lg md:text-3xl font-bold text-neutral-900 leading-tight">
                  초특가연구실
                </h2>
                <Link to="/products?sort=sale" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 md:mt-3 link-hover">
                  전체보기 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {/* 오른쪽 캐러셀 영역 */}
              <div className="flex-1 min-w-0 relative md:px-12">
                {/* 좌측 화살표 - 데스크탑만 */}
                <button
                  onClick={() => setProductSlide3(Math.max(0, productSlide3 - 1))}
                  className={cn(
                    "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center transition-all",
                    productSlide3 === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-neutral-100"
                  )}
                  disabled={productSlide3 === 0}
                >
                  <ChevronLeft className="w-6 h-6 text-neutral-600" />
                </button>
                {/* 모바일 전용 스크롤 */}
                <div className="flex md:hidden gap-2 overflow-x-auto scrollbar-hide px-3 snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {saleProducts.map((product) => {
                    const retailPrice = product.prices.retail
                    const memberPrice = product.prices.member
                    const currentPrice = getPriceByTier(product, tier)
                    const salePrice = tier === 'guest' ? memberPrice : currentPrice
                    const discountRate = Math.round((1 - salePrice / retailPrice) * 100)
                    return (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="flex-shrink-0 w-[calc(50%-4px)] snap-start group"
                      >
                        <div className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-neutral-100">
                          <div className="aspect-[4/3] flex items-center justify-center p-1 bg-neutral-50">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="px-2 py-1.5 border-t border-neutral-100">
                            <p className="text-[10px] text-neutral-500 truncate">{product.brand}</p>
                            <p className="text-xs font-medium text-neutral-800 truncate">{product.name}</p>
                            <div className="mt-1">
                              {isLoggedIn ? (
                                <>
                                  <p className="text-[10px] text-neutral-400 line-through">{formatPrice(retailPrice)}</p>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold text-red-500">{discountRate}%</span>
                                    <span className="text-xs font-bold text-neutral-900">{formatPrice(salePrice)}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-1 text-neutral-400">
                                  <Lock className="w-3 h-3" />
                                  <span className="text-[10px]">회원전용</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
                {/* 데스크탑 전용 캐러셀 */}
                <div className="hidden md:block overflow-hidden">
                  <div
                    className="flex gap-4 transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${productSlide3 * 188}px)` }}
                  >
                    {saleProducts.map((product) => {
                      const retailPrice = product.prices.retail
                      const memberPrice = product.prices.member
                      const currentPrice = getPriceByTier(product, tier)
                      const salePrice = tier === 'guest' ? memberPrice : currentPrice
                      const discountRate = Math.round((1 - salePrice / retailPrice) * 100)
                      return (
                        <Link
                          key={`desktop-${product.id}`}
                          to={`/product/${product.id}`}
                          className="flex-shrink-0 group"
                        >
                          <div className="w-44 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-100">
                            <div className="h-28 flex items-center justify-center p-2 bg-neutral-50">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="px-3 py-2 border-t border-neutral-100">
                              <p className="text-[10px] text-neutral-500 truncate">{product.brand}</p>
                              <p className="text-xs font-medium text-neutral-800 truncate">{product.name}</p>
                              <div className="mt-1">
                                {isLoggedIn ? (
                                  <>
                                    <p className="text-[10px] text-neutral-400 line-through">{formatPrice(retailPrice)}</p>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs font-bold text-red-500">{discountRate}%</span>
                                      <span className="text-xs font-bold text-neutral-900">{formatPrice(salePrice)}</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-1 text-neutral-400">
                                    <Lock className="w-3 h-3" />
                                    <span className="text-[10px]">회원전용</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
                {/* 우측 화살표 - 데스크탑만 */}
                <button
                  onClick={() => setProductSlide3(Math.min(saleProducts.length - itemsPerView, productSlide3 + 1))}
                  className={cn(
                    "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center transition-all",
                    productSlide3 >= saleProducts.length - itemsPerView ? "opacity-30 cursor-not-allowed" : "hover:bg-neutral-100"
                  )}
                  disabled={productSlide3 >= saleProducts.length - itemsPerView}
                >
                  <ChevronRight className="w-6 h-6 text-neutral-600" />
                </button>
                {/* 페이지네이션 dots - 데스크탑만 */}
                <div className="hidden md:flex justify-center gap-2 mt-4">
                  {Array.from({ length: saleProducts.length - itemsPerView + 1 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setProductSlide3(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === productSlide3 ? "bg-neutral-800" : "bg-neutral-300 hover:bg-neutral-400"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Animated>
        </div>
      </section>

      {/* 기획전 연구실 */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <Animated animation="fade-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">기획전 연구실</h2>
                <Badge variant="primary" size="sm">EVENT</Badge>
              </div>
              <Link to="/promotions" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 link-hover">
                전체보기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Animated>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {visiblePromotions.slice(0, 4).map((promo) => (
              <Card key={promo.id} hover className="overflow-hidden">
                <img src={promo.image} alt={promo.title} className="w-full h-32 object-cover" />
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={promo.discount >= 30 ? 'error' : 'primary'} size="sm">
                      {promo.discount}% OFF
                    </Badge>
                    {promo.type === 'exclusive' && (
                      <Badge variant="warning" size="sm">등급전용</Badge>
                    )}
                  </div>
                  <h3 className="font-medium text-neutral-900">{promo.title}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{promo.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 카테고리 */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <Animated animation="fade-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">카테고리</h2>
              <Link to="/categories" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 link-hover">
                전체보기 <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Animated>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => {
              const bestProducts = getCategoryBestProducts(category.id)
              return (
                <Animated key={category.id} animation="fade-up" delay={index * 80}>
                  <Link to={`/category/${category.id}`} className="block">
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden card-hover cursor-pointer img-hover" style={{ height: '280px', display: 'flex', flexDirection: 'column' }}>
                      <div className="relative h-32 flex-shrink-0 overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 to-transparent" />
                        <h3 className="absolute bottom-3 left-3 text-white font-medium">{category.name}</h3>
                      </div>
                      <div className="p-3 flex flex-col" style={{ flex: 1 }}>
                        <div className="space-y-1 overflow-hidden" style={{ flex: 1 }}>
                          {bestProducts.map((p) => (
                            <div key={p.id} className="text-xs text-neutral-600 truncate">
                              {p.sku} - {p.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Animated>
              )
            })}
          </div>
        </div>
      </section>

    </div>
  )
}
