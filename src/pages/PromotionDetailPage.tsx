import { useParams, Link, useNavigate } from 'react-router-dom'
import { Clock, Tag, ArrowLeft, Calendar } from 'lucide-react'
import { promotions, products } from '../data'
import { ProductCard } from '../components/product'
import { Badge, Button } from '../components/ui'
import { Animated } from '../hooks'

export function PromotionDetailPage() {
  const { promoId } = useParams<{ promoId: string }>()
  const navigate = useNavigate()

  const promotion = promotions.find(p => p.id === promoId)

  if (!promotion) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">프로모션을 찾을 수 없습니다</h1>
        <p className="text-neutral-500 mb-8">요청하신 프로모션이 존재하지 않거나 종료되었습니다.</p>
        <Button onClick={() => navigate('/promotions')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          프로모션 목록으로
        </Button>
      </div>
    )
  }

  // 프로모션 관련 상품 (할인율 기준)
  const promotionProducts = products.slice(0, 8)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center">
          <Link to="/" className="hover:text-primary-600">홈</Link>
          <span className="mx-2">/</span>
          <Link to="/promotions" className="hover:text-primary-600">프로모션</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-medium">{promotion.title}</span>
        </nav>
      </Animated>

      {/* 프로모션 배너 */}
      <Animated animation="fade-up" delay={100}>
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <img
            src={promotion.image}
            alt={promotion.title}
            className="w-full h-64 md:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              {promotion.type === 'timesale' && (
                <Badge variant="error" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  타임특가
                </Badge>
              )}
              {promotion.type === 'exclusive' && (
                <Badge variant="secondary">회원전용</Badge>
              )}
              <Badge variant="primary">
                <Tag className="w-3 h-3 mr-1" />
                {promotion.discount}% 할인
              </Badge>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{promotion.title}</h1>
            <p className="text-lg text-white/90 mb-4">{promotion.description}</p>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(promotion.startDate)} ~ {formatDate(promotion.endDate)}</span>
            </div>
          </div>
        </div>
      </Animated>

      {/* 프로모션 상세 정보 */}
      <Animated animation="fade-up" delay={200}>
        <div className="bg-primary-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">프로모션 혜택</h2>
          <ul className="space-y-2 text-neutral-700">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-600 rounded-full" />
              최대 {promotion.discount}% 할인 적용
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-600 rounded-full" />
              {promotion.type === 'exclusive' ? '회원 전용 특별 혜택' : '전 회원 대상 혜택'}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-600 rounded-full" />
              기간 내 무제한 적용
            </li>
          </ul>
        </div>
      </Animated>

      {/* 프로모션 상품 */}
      <Animated animation="fade-up" delay={300}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">프로모션 적용 상품</h2>
            <Link
              to="/products"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              전체보기
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
