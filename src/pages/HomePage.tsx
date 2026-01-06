import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Zap, Download, Truck, Award, FileText, Gift, Clock, ArrowRight, RotateCcw, TrendingUp, AlertTriangle } from 'lucide-react'
import { useStore, getTierLabel } from '../store'
import { categories, products, promotions, mockSalesData } from '../data'
import { ProductCard } from '../components/product'
import { Button, Badge, Tabs, Card, CardContent } from '../components/ui'
import { formatPrice, cn } from '../lib/utils'

export function HomePage() {
  const { user, isLoggedIn } = useStore()
  const [currentSlide, setCurrentSlide] = useState(0)

  const tier = user?.tier || 'guest'

  // Filter promotions based on user tier
  const visiblePromotions = promotions.filter(p => p.targetTiers.includes(tier))
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

  const benefits = [
    { icon: Award, title: '등급별 할인', desc: '등급에 따라 최대 40% 할인' },
    { icon: Truck, title: '대량 주문 혜택', desc: '100개 이상 주문 시 무료 배송' },
    { icon: FileText, title: '견적 자동 생성', desc: '원클릭 견적서 PDF 발행' },
    { icon: Gift, title: '무료 배송', desc: 'VIP 이상 회원 전 상품 무료 배송' },
  ]

  // Get best products per category
  const getCategoryBestProducts = (categoryId: number) => {
    return products.filter(p => p.categoryId === categoryId).slice(0, 3)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-neutral-900 overflow-hidden">
        <div className="relative h-[400px]">
          {heroPromotions.map((promo, index) => (
            <div
              key={promo.id}
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${promo.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-transparent" />
              </div>
              <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
                <div className="max-w-xl">
                  {promo.type === 'exclusive' && (
                    <Badge variant="warning" className="mb-4">
                      {getTierLabel(tier)} 전용
                    </Badge>
                  )}
                  {promo.type === 'timesale' && (
                    <Badge variant="error" className="mb-4">
                      <Clock className="w-3 h-3 mr-1" />
                      타임특가
                    </Badge>
                  )}
                  <h2 className="text-4xl font-bold text-white mb-4">{promo.title}</h2>
                  <p className="text-lg text-neutral-300 mb-6">{promo.description}</p>
                  <div className="flex gap-3">
                    <Button size="lg">
                      <Zap className="w-5 h-5 mr-2" />
                      대량 주문 바로가기
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-neutral-900">
                      <Download className="w-5 h-5 mr-2" />
                      단가표 다운로드
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slide Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {heroPromotions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentSlide ? 'w-8 bg-white' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs
            tabs={[
              {
                id: 'all',
                label: '전체 기획전',
                badge: visiblePromotions.length,
                content: (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {visiblePromotions.map((promo) => (
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
                ),
              },
              {
                id: 'timesale',
                label: '타임특가',
                content: (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {visiblePromotions.filter(p => p.type === 'timesale').map((promo) => (
                      <Card key={promo.id} hover className="overflow-hidden border-error">
                        <img src={promo.image} alt={promo.title} className="w-full h-32 object-cover" />
                        <CardContent>
                          <Badge variant="error" size="sm" className="mb-2">
                            <Clock className="w-3 h-3 mr-1" />
                            오늘만!
                          </Badge>
                          <h3 className="font-medium text-neutral-900">{promo.title}</h3>
                          <p className="text-sm text-neutral-500 mt-1">{promo.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                    {visiblePromotions.filter(p => p.type === 'timesale').length === 0 && (
                      <p className="col-span-4 text-center text-neutral-500 py-8">현재 진행 중인 타임특가가 없습니다.</p>
                    )}
                  </div>
                ),
              },
              {
                id: 'exclusive',
                label: '등급 전용',
                content: (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {visiblePromotions.filter(p => p.type === 'exclusive').map((promo) => (
                      <Card key={promo.id} hover className="overflow-hidden border-amber-300">
                        <img src={promo.image} alt={promo.title} className="w-full h-32 object-cover" />
                        <CardContent>
                          <Badge variant="warning" size="sm" className="mb-2">
                            {getTierLabel(tier)} 전용
                          </Badge>
                          <h3 className="font-medium text-neutral-900">{promo.title}</h3>
                          <p className="text-sm text-neutral-500 mt-1">{promo.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                    {!isLoggedIn && (
                      <div className="col-span-4 text-center py-8 bg-neutral-50 rounded-lg">
                        <p className="text-neutral-500 mb-3">로그인 후 등급 전용 혜택을 확인하세요</p>
                        <Button>로그인</Button>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          {isLoggedIn && user && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg text-white">
              <p className="text-lg font-medium">
                {user.name}님, {getTierLabel(user.tier)} 고객님 전용 혜택을 확인하세요!
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-medium text-neutral-900 mb-1">{benefit.title}</h3>
                <p className="text-sm text-neutral-500">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Category Hub */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">카테고리</h2>
            <Link to="/categories" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              전체보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const bestProducts = getCategoryBestProducts(category.id)
              return (
                <div key={category.id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-neutral-300 cursor-pointer transition-all duration-200" style={{ height: '280px', display: 'flex', flexDirection: 'column' }}>
                  <div className="relative h-32 flex-shrink-0">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
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
                    <Link to={`/category/${category.id}`} className="mt-auto pt-3">
                      <Button size="sm" variant="outline" className="w-full">
                        <Zap className="w-3 h-3 mr-1" />
                        빠른 주문
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Data-driven Recommendations (Logged in users) */}
      {isLoggedIn && (
        <section className="py-12 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4">
            <Tabs
              tabs={[
                {
                  id: 'recent',
                  label: '최근 주문 상품',
                  content: (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {products.slice(0, 5).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ),
                },
                {
                  id: 'frequent',
                  label: '자주 구매한 SKU',
                  content: (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {products.slice(2, 7).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ),
                },
                {
                  id: 'lowstock',
                  label: '재고 임박 상품',
                  content: (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {products.filter(p => p.stockStatus === 'low').map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </section>
      )}

      {/* Best Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">베스트 상품</h2>
            <Link to="/products" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              전체보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
