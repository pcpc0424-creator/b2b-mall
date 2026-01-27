import { Link } from 'react-router-dom'
import { Clock, Tag, ArrowRight } from 'lucide-react'
import { products } from '../data'
import { usePromotions } from '../hooks/queries'
import { useStore } from '../store'
import { ProductCard } from '../components/product'
import { Badge, Card, CardContent } from '../components/ui'
import { Animated } from '../hooks'

export function PromotionsPage() {
  const { data: promotions = [] } = usePromotions()
  const { user } = useStore()
  const tier = user?.tier || 'guest'

  // isActive가 true이고 사용자 등급에 맞는 프로모션만 표시
  const visiblePromotions = promotions
    .filter(p => p.isActive)
    .filter(p => tier === 'guest' || p.targetTiers.includes(tier))

  // 프로모션 상품들 (할인율이 높은 상품들)
  const promotionProducts = products.slice(0, 8)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center">
          <Link to="/" className="hover:text-primary-600">홈</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-medium">프로모션</span>
        </nav>
      </Animated>

      {/* Header */}
      <Animated animation="fade-up" delay={100}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">프로모션</h1>
          <p className="text-neutral-500">특별 할인과 이벤트를 확인하세요</p>
        </div>
      </Animated>

      {/* 프로모션 배너 */}
      <Animated animation="fade-up" delay={200}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {visiblePromotions.map((promo, index) => (
            <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    {promo.type === 'timesale' && (
                      <Badge variant="error" size="sm" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        타임특가
                      </Badge>
                    )}
                    {promo.type === 'exclusive' && (
                      <Badge variant="secondary" size="sm">회원전용</Badge>
                    )}
                    <Badge variant="primary" size="sm">
                      <Tag className="w-3 h-3 mr-1" />
                      {promo.discount}% 할인
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold">{promo.title}</h3>
                  <p className="text-sm text-white/80">{promo.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Animated>

      {/* 프로모션 상품 */}
      <Animated animation="fade-up" delay={300}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">할인 상품</h2>
            <Link
              to="/products"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              전체보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {promotionProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </Animated>
    </div>
  )
}
