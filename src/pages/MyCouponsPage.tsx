import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Tag, Calendar, Check, X, Copy, ShoppingCart } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, CardContent, Badge } from '../components/ui'
import { formatPrice } from '../lib/utils'
import { Animated } from '../hooks'
import { sampleCoupons } from '../data'
import { Coupon } from '../types'

export function MyCouponsPage() {
  const { myCoupons, addCoupon } = useStore()
  const [activeTab, setActiveTab] = useState<'available' | 'used'>('available')
  const [couponCode, setCouponCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeSuccess, setCodeSuccess] = useState('')

  // 샘플 쿠폰 자동 발급 (처음 방문 시)
  useEffect(() => {
    if (myCoupons.length === 0) {
      sampleCoupons.forEach(coupon => {
        addCoupon(coupon)
      })
    }
  }, [myCoupons.length, addCoupon])

  const availableCoupons = myCoupons.filter(c => !c.isUsed && new Date(c.validUntil) >= new Date())
  const usedCoupons = myCoupons.filter(c => c.isUsed)
  const expiredCoupons = myCoupons.filter(c => !c.isUsed && new Date(c.validUntil) < new Date())

  const displayCoupons = activeTab === 'available' ? availableCoupons : [...usedCoupons, ...expiredCoupons]

  const handleAddCoupon = () => {
    setCodeError('')
    setCodeSuccess('')

    if (!couponCode.trim()) {
      setCodeError('쿠폰 코드를 입력해주세요.')
      return
    }

    // 이미 보유한 쿠폰인지 확인
    const existingCoupon = myCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase())
    if (existingCoupon) {
      setCodeError('이미 보유한 쿠폰입니다.')
      return
    }

    // 샘플 쿠폰에서 찾기 (실제로는 서버에서 검증)
    const newCoupon = sampleCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase())
    if (!newCoupon) {
      setCodeError('유효하지 않은 쿠폰 코드입니다.')
      return
    }

    addCoupon({ ...newCoupon, id: `coupon-${Date.now()}` })
    setCodeSuccess('쿠폰이 등록되었습니다!')
    setCouponCode('')
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('쿠폰 코드가 복사되었습니다.')
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isExpired = (coupon: Coupon) => new Date(coupon.validUntil) < new Date()

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discountType === 'percent') {
      return `${coupon.discountValue}%`
    }
    return formatPrice(coupon.discountValue)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Animated animation="fade-up">
        <div className="flex items-center gap-3 mb-8">
          <Ticket className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-neutral-900">내 쿠폰함</h1>
        </div>
      </Animated>

      {/* 쿠폰 등록 */}
      <Animated animation="fade-up" delay={100}>
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">쿠폰 등록</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="쿠폰 코드를 입력하세요"
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button onClick={handleAddCoupon}>등록</Button>
            </div>
            {codeError && <p className="mt-2 text-sm text-red-500">{codeError}</p>}
            {codeSuccess && <p className="mt-2 text-sm text-green-500">{codeSuccess}</p>}
            <p className="mt-2 text-xs text-neutral-500">
              테스트용 코드: WELCOME10, SPRING5, VIP15, FLAT5000, MEGA20
            </p>
          </CardContent>
        </Card>
      </Animated>

      {/* 탭 */}
      <Animated animation="fade-up" delay={150}>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'available'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            사용 가능 ({availableCoupons.length})
          </button>
          <button
            onClick={() => setActiveTab('used')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'used'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            사용완료/만료 ({usedCoupons.length + expiredCoupons.length})
          </button>
        </div>
      </Animated>

      {/* 쿠폰 목록 */}
      <div className="space-y-4">
        {displayCoupons.length === 0 ? (
          <Animated animation="fade-up" delay={200}>
            <Card className="p-8 text-center">
              <Ticket className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500">
                {activeTab === 'available' ? '사용 가능한 쿠폰이 없습니다.' : '사용한 쿠폰이 없습니다.'}
              </p>
            </Card>
          </Animated>
        ) : (
          displayCoupons.map((coupon, index) => (
            <Animated key={coupon.id} animation="fade-up" delay={200 + index * 50}>
              <Card className={`overflow-hidden ${coupon.isUsed || isExpired(coupon) ? 'opacity-60' : ''}`}>
                <div className="flex">
                  {/* 왼쪽: 할인 정보 */}
                  <div className={`w-32 flex flex-col items-center justify-center p-4 text-white ${
                    coupon.isUsed || isExpired(coupon) ? 'bg-neutral-400' : 'bg-primary-600'
                  }`}>
                    <Tag className="w-6 h-6 mb-1" />
                    <span className="text-2xl font-bold">{getDiscountText(coupon)}</span>
                    <span className="text-xs opacity-80">
                      {coupon.discountType === 'percent' ? '할인' : '할인'}
                    </span>
                  </div>

                  {/* 오른쪽: 쿠폰 상세 */}
                  <CardContent className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-900">{coupon.name}</h3>
                          {coupon.isUsed && (
                            <Badge variant="secondary" size="sm">사용완료</Badge>
                          )}
                          {!coupon.isUsed && isExpired(coupon) && (
                            <Badge variant="default" size="sm">기간만료</Badge>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500 mb-2">{coupon.description}</p>

                        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                          {coupon.minOrderAmount && (
                            <span className="bg-neutral-100 px-2 py-1 rounded">
                              {formatPrice(coupon.minOrderAmount)} 이상 구매 시
                            </span>
                          )}
                          {coupon.maxDiscountAmount && coupon.discountType === 'percent' && (
                            <span className="bg-neutral-100 px-2 py-1 rounded">
                              최대 {formatPrice(coupon.maxDiscountAmount)} 할인
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-2 text-xs text-neutral-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDate(coupon.validFrom)} ~ {formatDate(coupon.validUntil)}
                          </span>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      {!coupon.isUsed && !isExpired(coupon) && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-primary-600"
                          >
                            <Copy className="w-3 h-3" />
                            코드 복사
                          </button>
                          <Link to="/cart">
                            <Button size="sm" variant="outline">
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              사용하기
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* 쿠폰 코드 */}
                    <div className="mt-3 pt-3 border-t border-dashed border-neutral-200">
                      <span className="text-xs text-neutral-400">쿠폰 코드: </span>
                      <span className="font-mono text-sm font-medium text-neutral-700">{coupon.code}</span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Animated>
          ))
        )}
      </div>

      {/* 안내 사항 */}
      <Animated animation="fade-up" delay={300}>
        <Card className="mt-8 bg-neutral-50">
          <CardContent className="p-4">
            <h3 className="font-medium text-neutral-900 mb-2">쿠폰 이용 안내</h3>
            <ul className="text-sm text-neutral-500 space-y-1">
              <li>• 쿠폰은 1회 주문당 1개만 사용 가능합니다.</li>
              <li>• 최소 주문 금액 조건을 충족해야 사용할 수 있습니다.</li>
              <li>• 일부 상품에는 쿠폰이 적용되지 않을 수 있습니다.</li>
              <li>• 쿠폰은 유효기간 내에만 사용 가능합니다.</li>
            </ul>
          </CardContent>
        </Card>
      </Animated>
    </div>
  )
}
