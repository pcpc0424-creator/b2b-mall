import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Package, Truck, Ticket, ChevronDown, X, LogIn } from 'lucide-react'
import { useStore, getPriceByTier, getTierLabel } from '../store'
import { Button, NumberStepper, Card, CardContent, Badge } from '../components/ui'
import { formatPrice, formatNumber, cn } from '../lib/utils'
import { Animated } from '../hooks'
import { useMemo, useState, useEffect } from 'react'
import { sampleCoupons } from '../data'
import { Coupon } from '../types'

// 토스페이먼츠 타입 선언
declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      requestPayment: (method: string, options: {
        amount: number
        orderId: string
        orderName: string
        customerName?: string
        successUrl: string
        failUrl: string
      }) => Promise<void>
    }
  }
}

// 상품별 배송 정보 가져오기
function getProductShipping(productId: string) {
  try {
    const stored = localStorage.getItem('admin-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      const products = parsed.state?.products
      if (products) {
        const product = products.find((p: any) => p.id === productId)
        if (product?.shipping) {
          return product.shipping
        }
      }
    }
  } catch (e) {
    // ignore
  }
  // 기본값: 유료배송, 묶음배송 가능
  return { type: 'paid' as const, fee: 3000, bundleShipping: true }
}

// 토스페이먼츠 테스트 클라이언트 키
const TOSS_CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'

export function CartPage() {
  const {
    user,
    isLoggedIn,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    myCoupons,
    addCoupon,
    appliedCoupon,
    applyCoupon,
    getCouponDiscount,
    useCoupon
  } = useStore()
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [showCouponSelector, setShowCouponSelector] = useState(false)

  // 샘플 쿠폰 자동 발급 (처음 방문 시)
  useEffect(() => {
    if (myCoupons.length === 0) {
      sampleCoupons.forEach(coupon => {
        addCoupon(coupon)
      })
    }
  }, [myCoupons.length, addCoupon])

  const tier = user?.tier || 'guest'
  const totalAmount = getCartTotal()
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)

  // 사용 가능한 쿠폰 필터링
  const availableCoupons = myCoupons.filter(c => {
    if (c.isUsed) return false
    const now = new Date()
    if (now < new Date(c.validFrom) || now > new Date(c.validUntil)) return false
    if (c.minOrderAmount && totalAmount < c.minOrderAmount) return false
    return true
  })

  // 배송비 계산
  const shippingCalculation = useMemo(() => {
    let freeShippingItems: string[] = []
    let bundleShippingItems: { productId: string; fee: number }[] = []
    let separateShippingItems: { productId: string; fee: number }[] = []

    cart.forEach(item => {
      const shipping = getProductShipping(item.product.id)

      if (shipping.type === 'free') {
        freeShippingItems.push(item.product.id)
      } else if (shipping.type === 'conditional') {
        // 조건부 무료: 해당 상품 금액이 기준 이상이면 무료
        const itemTotal = getPriceByTier(item.product, tier) * item.quantity
        if (itemTotal >= (shipping.freeCondition || 50000)) {
          freeShippingItems.push(item.product.id)
        } else if (shipping.bundleShipping !== false) {
          bundleShippingItems.push({ productId: item.product.id, fee: shipping.fee || 3000 })
        } else {
          separateShippingItems.push({ productId: item.product.id, fee: shipping.fee || 3000 })
        }
      } else {
        // 유료배송
        if (shipping.bundleShipping !== false) {
          bundleShippingItems.push({ productId: item.product.id, fee: shipping.fee || 3000 })
        } else {
          separateShippingItems.push({ productId: item.product.id, fee: shipping.fee || 3000 })
        }
      }
    })

    // 묶음배송은 가장 높은 배송비 1건만 적용
    const bundleShippingFee = bundleShippingItems.length > 0
      ? Math.max(...bundleShippingItems.map(i => i.fee))
      : 0

    // 개별배송은 각각 적용
    const separateShippingFee = separateShippingItems.reduce((sum, i) => sum + i.fee, 0)

    const totalShippingFee = bundleShippingFee + separateShippingFee
    const shippingCount = (bundleShippingItems.length > 0 ? 1 : 0) + separateShippingItems.length

    return {
      freeCount: freeShippingItems.length,
      bundleCount: bundleShippingItems.length,
      separateCount: separateShippingItems.length,
      bundleShippingFee,
      separateShippingFee,
      totalShippingFee,
      shippingCount
    }
  }, [cart, tier])

  const couponDiscount = getCouponDiscount(totalAmount)
  const discountedAmount = totalAmount - couponDiscount
  const vat = Math.round(discountedAmount * 0.1)
  const grandTotal = discountedAmount + vat + shippingCalculation.totalShippingFee

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discountType === 'percent') {
      return `${coupon.discountValue}%`
    }
    return formatPrice(coupon.discountValue)
  }

  // 결제 처리 함수
  const handlePayment = async () => {
    if (cart.length === 0) return

    setIsPaymentLoading(true)

    try {
      const tossPayments = window.TossPayments(TOSS_CLIENT_KEY)

      // 주문 ID 생성 (고유값)
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 주문명 생성
      const orderName = cart.length === 1
        ? cart[0].product.name
        : `${cart[0].product.name} 외 ${cart.length - 1}건`

      // 적용된 쿠폰 ID 저장 (결제 성공 시 사용처리를 위해)
      if (appliedCoupon) {
        localStorage.setItem('pendingCouponId', appliedCoupon.id)
      }

      // 결제 요청
      await tossPayments.requestPayment('카드', {
        amount: grandTotal,
        orderId,
        orderName,
        customerName: user?.name || '고객',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      })
    } catch (error: any) {
      // 사용자 취소 시 무시
      if (error.code === 'USER_CANCEL') {
        console.log('사용자가 결제를 취소했습니다.')
      } else {
        console.error('결제 오류:', error)
        alert('결제 처리 중 오류가 발생했습니다.')
      }
    } finally {
      setIsPaymentLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">장바구니가 비어있습니다</h1>
        <p className="text-neutral-500 mb-6">상품을 담아주세요</p>
        <Link to="/products">
          <Button>상품 둘러보기</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Animated animation="fade-up">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">장바구니</h1>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-error hover:text-error hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-1" />
            전체 삭제
          </Button>
        </div>
      </Animated>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <Animated animation="fade-up" delay={100} className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-100">
                {cart.map((item, index) => {
                  const price = getPriceByTier(item.product, tier)
                  const subtotal = price * item.quantity
                  // 옵션이 있으면 옵션 키도 포함하여 고유 키 생성
                  const itemKey = item.selectedOptions
                    ? `${item.product.id}-${JSON.stringify(item.selectedOptions)}`
                    : `${item.product.id}-${index}`

                  // 배송 정보
                  const itemShipping = getProductShipping(item.product.id)
                  const isFreeShipping = itemShipping.type === 'free' ||
                    (itemShipping.type === 'conditional' && subtotal >= (itemShipping.freeCondition || 50000))
                  const isBundleShipping = !isFreeShipping && itemShipping.bundleShipping !== false

                  return (
                    <div key={itemKey} className="p-4 flex gap-4">
                      <Link to={`/product/${item.product.id}`}>
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-xs text-neutral-500">{item.product.brand}</span>
                            <Link to={`/product/${item.product.id}`}>
                              <h3 className="font-medium text-neutral-900 hover:text-primary-600">
                                {item.product.name}
                              </h3>
                            </Link>
                            <p className="text-xs text-neutral-400">SKU: {item.product.sku}</p>
                            {/* 선택된 옵션 표시 */}
                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                              <p className="text-xs text-primary-600 mt-1">
                                {Object.entries(item.selectedOptions).map(([key, value]) => `${key}: ${value}`).join(' / ')}
                              </p>
                            )}
                            {/* 배송 타입 표시 */}
                            <div className="flex items-center gap-1 mt-1">
                              {isFreeShipping ? (
                                <Badge variant="success" size="sm">무료배송</Badge>
                              ) : isBundleShipping ? (
                                <Badge variant="secondary" size="sm" className="flex items-center gap-0.5">
                                  <Package className="w-3 h-3" />
                                  묶음배송
                                </Badge>
                              ) : (
                                <Badge variant="default" size="sm" className="flex items-center gap-0.5">
                                  <Truck className="w-3 h-3" />
                                  개별배송
                                </Badge>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedOptions)}
                            className="text-neutral-400 hover:text-error transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-2">
                          <div className="flex items-center gap-2 sm:gap-4">
                            <NumberStepper
                              value={item.quantity}
                              onChange={(q) => updateCartQuantity(item.product.id, q, item.selectedOptions)}
                              min={0}
                              max={item.product.stock}
                              size="sm"
                            />
                            <span className="text-xs sm:text-sm text-neutral-500">
                              × {formatPrice(price)}
                            </span>
                          </div>
                          <p className="text-base sm:text-lg font-bold text-primary-600">
                            {formatPrice(subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </Animated>

        {/* Summary */}
        <Animated animation="fade-up" delay={200} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-neutral-900 mb-4">주문 요약</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">상품 수</span>
                  <span className="font-medium">{cart.length}개 품목</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">총 수량</span>
                  <span className="font-medium">{formatNumber(totalQuantity)}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">적용 등급</span>
                  <Badge variant="primary" size="sm">{getTierLabel(tier)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">상품 금액</span>
                  <span className="font-medium">{formatPrice(totalAmount)}</span>
                </div>
                {/* 쿠폰 선택 */}
                <div className="border-t border-neutral-200 pt-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-600 flex items-center gap-1">
                      <Ticket className="w-4 h-4" />
                      쿠폰
                    </span>
                    <Link to="/my/coupons" className="text-xs text-primary-600 hover:underline">
                      내 쿠폰함
                    </Link>
                  </div>

                  {appliedCoupon ? (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-primary-700 text-sm">{appliedCoupon.name}</p>
                          <p className="text-xs text-primary-600">
                            {getDiscountText(appliedCoupon)} 할인
                            {appliedCoupon.maxDiscountAmount && appliedCoupon.discountType === 'percent' &&
                              ` (최대 ${formatPrice(appliedCoupon.maxDiscountAmount)})`
                            }
                          </p>
                        </div>
                        <button
                          onClick={() => applyCoupon(null)}
                          className="text-primary-500 hover:text-primary-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => setShowCouponSelector(!showCouponSelector)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-left flex items-center justify-between hover:border-primary-500 transition-colors"
                      >
                        <span className="text-neutral-500">
                          {availableCoupons.length > 0
                            ? `사용 가능한 쿠폰 ${availableCoupons.length}장`
                            : '사용 가능한 쿠폰이 없습니다'
                          }
                        </span>
                        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showCouponSelector ? 'rotate-180' : ''}`} />
                      </button>

                      {showCouponSelector && availableCoupons.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          {availableCoupons.map(coupon => (
                            <button
                              key={coupon.id}
                              onClick={() => {
                                applyCoupon(coupon)
                                setShowCouponSelector(false)
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm text-neutral-900">{coupon.name}</p>
                                  <p className="text-xs text-neutral-500">{coupon.description}</p>
                                </div>
                                <Badge variant="primary" size="sm">{getDiscountText(coupon)}</Badge>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 쿠폰 할인 금액 */}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>쿠폰 할인</span>
                    <span className="font-medium">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-neutral-600">부가세 (10%)</span>
                  <span className="font-medium">{formatPrice(vat)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">배송비</span>
                  {shippingCalculation.totalShippingFee === 0 ? (
                    <span className="font-medium text-success">무료</span>
                  ) : (
                    <span className="font-medium">{formatPrice(shippingCalculation.totalShippingFee)}</span>
                  )}
                </div>
                {shippingCalculation.totalShippingFee > 0 && (
                  <div className="text-xs text-neutral-500 space-y-1 pl-2 border-l-2 border-neutral-200">
                    {shippingCalculation.bundleCount > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          묶음배송 ({shippingCalculation.bundleCount}건)
                        </span>
                        <span>{formatPrice(shippingCalculation.bundleShippingFee)}</span>
                      </div>
                    )}
                    {shippingCalculation.separateCount > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          개별배송 ({shippingCalculation.separateCount}건)
                        </span>
                        <span>{formatPrice(shippingCalculation.separateShippingFee)}</span>
                      </div>
                    )}
                    {shippingCalculation.freeCount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>무료배송 ({shippingCalculation.freeCount}건)</span>
                        <span>₩0</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-neutral-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">총 결제금액</span>
                    <span className="text-2xl font-bold text-primary-600">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* 주문 버튼 영역 */}
              <div className="mt-6">
                {isLoggedIn ? (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePayment}
                    disabled={isPaymentLoading}
                  >
                    {isPaymentLoading ? (
                      <>
                        <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        결제 처리 중...
                      </>
                    ) : (
                      <>
                        주문하기
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                      <p className="text-amber-800 text-sm font-medium mb-1">
                        회원만 주문할 수 있습니다
                      </p>
                      <p className="text-amber-600 text-xs">
                        로그인 또는 회원가입 후 주문해 주세요
                      </p>
                    </div>
                    <Link to="/login" className="block">
                      <Button className="w-full" size="lg">
                        <LogIn className="w-5 h-5 mr-2" />
                        로그인하기
                      </Button>
                    </Link>
                    <Link to="/register" className="block">
                      <Button variant="outline" className="w-full" size="lg">
                        회원가입하기
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Animated>
      </div>
    </div>
  )
}
