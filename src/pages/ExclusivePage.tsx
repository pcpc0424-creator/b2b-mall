import { Link } from 'react-router-dom'
import { Crown, Star, Gift, Truck, Percent, Headphones, Award, TrendingUp } from 'lucide-react'
import { useStore } from '../store'
import { useProducts } from '../hooks/queries'
import { ProductCard } from '../components/product'
import { Badge, Card, Button } from '../components/ui'
import { Animated } from '../hooks'
import { cn } from '../lib/utils'

export function ExclusivePage() {
  const { user } = useStore()
  const tier = user?.tier || 'guest'

  const tierConfig = {
    guest: {
      label: '비회원',
      color: 'bg-neutral-100 text-neutral-600',
      discount: 0,
      nextTier: 'member',
      benefits: []
    },
    member: {
      label: '일반회원',
      color: 'bg-green-100 text-green-700',
      discount: 3,
      nextTier: 'premium',
      benefits: ['기본 회원가 적용', '적립금 1% 지급']
    },
    premium: {
      label: '우수회원',
      color: 'bg-blue-100 text-blue-700',
      discount: 7,
      nextTier: 'vip',
      benefits: ['우수회원 전용가 적용', '적립금 2% 지급', '무료 배송', '전용 기획전 참여']
    },
    vip: {
      label: 'VIP회원',
      color: 'bg-amber-100 text-amber-700',
      discount: 15,
      nextTier: null,
      benefits: ['VIP 전용가 적용', '적립금 3% 지급', '무료 배송', '우선 배송', 'VIP 전용 고객센터']
    }
  }

  const { data: products = [] } = useProducts()

  const currentTierConfig = tierConfig[tier]
  const allTiers = ['member', 'premium', 'vip'] as const

  // 등급별 추천 상품
  const exclusiveProducts = products.slice(0, 4)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center">
          <Link to="/" className="hover:text-primary-600">홈</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-medium">등급별 혜택</span>
        </nav>
      </Animated>

      {/* Header */}
      <Animated animation="fade-up" delay={100}>
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">등급별 혜택 안내</h1>
          <p className="text-neutral-500">회원 등급에 따른 특별한 혜택을 확인하세요</p>
        </div>
      </Animated>

      {/* Current Tier Card */}
      <Animated animation="fade-up" delay={150}>
        <Card className="p-6 mb-12 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <p className="text-primary-100 text-sm">현재 회원 등급</p>
                <p className="text-2xl font-bold">{currentTierConfig.label}</p>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-primary-100 text-sm">현재 적용 할인율</p>
              <p className="text-3xl font-bold">{currentTierConfig.discount}%</p>
            </div>
          </div>
          {currentTierConfig.nextTier && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-sm text-primary-100">
                다음 등급 <span className="font-bold text-white">{tierConfig[currentTierConfig.nextTier as keyof typeof tierConfig].label}</span>까지 더 많은 구매로 업그레이드하세요!
              </p>
            </div>
          )}
        </Card>
      </Animated>

      {/* Benefits Overview */}
      <Animated animation="fade-up" delay={200}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="p-4 text-center">
            <Percent className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-900">등급별 할인</p>
            <p className="text-xs text-neutral-500">최대 15% 할인</p>
          </Card>
          <Card className="p-4 text-center">
            <Truck className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-900">무료 배송</p>
            <p className="text-xs text-neutral-500">우수회원 이상</p>
          </Card>
          <Card className="p-4 text-center">
            <Gift className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-900">적립금</p>
            <p className="text-xs text-neutral-500">최대 3% 지급</p>
          </Card>
          <Card className="p-4 text-center">
            <Headphones className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-900">전용 고객센터</p>
            <p className="text-xs text-neutral-500">VIP회원</p>
          </Card>
        </div>
      </Animated>

      {/* Tier Comparison Table */}
      <Animated animation="fade-up" delay={250}>
        <h2 className="text-xl font-bold text-neutral-900 mb-6">등급별 혜택 비교</h2>
        <div className="overflow-x-auto mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 border-b">혜택</th>
                {allTiers.map((t) => (
                  <th
                    key={t}
                    className={cn(
                      'px-4 py-3 text-center text-sm font-medium border-b',
                      tier === t ? 'bg-primary-50 text-primary-700' : 'text-neutral-700'
                    )}
                  >
                    <span className={cn(
                      'inline-block px-2 py-1 rounded text-xs',
                      tierConfig[t].color
                    )}>
                      {tierConfig[t].label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 text-sm text-neutral-600 border-b">할인율</td>
                {allTiers.map((t) => (
                  <td key={t} className={cn(
                    'px-4 py-3 text-center text-sm font-medium border-b',
                    tier === t ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
                  )}>
                    {tierConfig[t].discount}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-neutral-600 border-b">적립금</td>
                <td className={cn('px-4 py-3 text-center text-sm border-b', tier === 'member' && 'bg-primary-50')}>1%</td>
                <td className={cn('px-4 py-3 text-center text-sm border-b', tier === 'premium' && 'bg-primary-50')}>2%</td>
                <td className={cn('px-4 py-3 text-center text-sm border-b', tier === 'vip' && 'bg-primary-50')}>3%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-neutral-600 border-b">무료 배송</td>
                <td className={cn('px-4 py-3 text-center text-sm border-b', tier === 'member' && 'bg-primary-50')}>30만원 이상</td>
                <td className={cn('px-4 py-3 text-center text-sm border-b text-primary-600 font-medium', tier === 'premium' && 'bg-primary-50')}>무조건 무료</td>
                <td className={cn('px-4 py-3 text-center text-sm border-b text-primary-600 font-medium', tier === 'vip' && 'bg-primary-50')}>무조건 무료</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-neutral-600 border-b">전용 고객센터</td>
                <td className={cn('px-4 py-3 text-center text-sm text-neutral-400 border-b', tier === 'member' && 'bg-primary-50')}>-</td>
                <td className={cn('px-4 py-3 text-center text-sm text-neutral-400 border-b', tier === 'premium' && 'bg-primary-50')}>-</td>
                <td className={cn('px-4 py-3 text-center text-sm border-b text-primary-600 font-medium', tier === 'vip' && 'bg-primary-50')}>VIP 전용</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-neutral-600 border-b">우선 배송</td>
                <td className={cn('px-4 py-3 text-center text-sm text-neutral-400 border-b', tier === 'member' && 'bg-primary-50')}>-</td>
                <td className={cn('px-4 py-3 text-center text-sm text-neutral-400 border-b', tier === 'premium' && 'bg-primary-50')}>-</td>
                <td className={cn('px-4 py-3 text-center text-sm border-b text-primary-600 font-medium', tier === 'vip' && 'bg-primary-50')}>가능</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-neutral-600">누적 구매 기준</td>
                <td className={cn('px-4 py-3 text-center text-sm border-b', tier === 'member' && 'bg-primary-50')}>30만원 미만</td>
                <td className={cn('px-4 py-3 text-center text-sm border-b', tier === 'premium' && 'bg-primary-50')}>30만원 이상</td>
                <td className={cn('px-4 py-3 text-center text-sm border-b', tier === 'vip' && 'bg-primary-50')}>100만원 이상</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Animated>

      {/* Exclusive Products */}
      <Animated animation="fade-up" delay={300}>
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">회원 전용 특가 상품</h2>
            <Link to="/products" className="text-sm text-primary-600 hover:text-primary-700">
              전체보기 →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {exclusiveProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </Animated>

      {/* CTA */}
      {tier === 'guest' && (
        <Animated animation="fade-up" delay={350}>
          <Card className="p-8 text-center bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
            <Award className="w-12 h-12 mx-auto mb-4 text-primary-400" />
            <h3 className="text-xl font-bold mb-2">지금 가입하고 혜택을 누리세요!</h3>
            <p className="text-neutral-300 mb-6">회원가입 즉시 Member 등급으로 시작합니다.</p>
            <Link to="/register">
              <Button size="lg" className="bg-primary-500 hover:bg-primary-600">
                회원가입하기
              </Button>
            </Link>
          </Card>
        </Animated>
      )}
    </div>
  )
}
