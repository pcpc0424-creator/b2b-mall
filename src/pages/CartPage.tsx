import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Package, Truck, Ticket, ChevronDown, X, LogIn, MapPin, Phone, User, FileText, CreditCard, Loader2, Star } from 'lucide-react'
import { useStore, getPriceByTier, getTierLabel } from '../store'
import { useProducts, useUserCoupons, useClaimAllCoupons, useUserShippingAddresses } from '../hooks/queries'
import type { SavedShippingAddress } from '../admin/types/admin'
import { Button, NumberStepper, Card, CardContent, Badge } from '../components/ui'
import { formatPrice, formatNumber } from '../lib/utils'
import { Animated } from '../hooks'
import { useMemo, useState, useEffect } from 'react'
import { Coupon } from '../types'
import { AdminProduct } from '../admin/types/admin'

// 다음 우편번호 API 타입 선언
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void
      }) => { open: () => void }
    }
    TossPayments: (clientKey: string) => {
      requestPayment: (method: string, options: {
        amount: number
        orderId: string
        orderName: string
        customerName?: string
        customerMobilePhone?: string
        successUrl: string
        failUrl: string
      }) => Promise<void>
    }
  }
}

interface DaumPostcodeData {
  zonecode: string
  address: string
  addressType: string
  bname: string
  buildingName: string
}

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY


// 상품별 배송 정보 가져오기
function getProductShipping(productId: string, adminProducts: AdminProduct[]) {
  const product = adminProducts.find(p => p.id === productId)
  if (product?.shipping) {
    return product.shipping
  }
  // 기본값: 유료배송, 묶음배송 가능
  return { type: 'paid' as const, fee: 3000, bundleShipping: true }
}

export function CartPage() {
  const {
    user,
    isLoggedIn,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    appliedCoupon,
    applyCoupon,
    getCouponDiscount,
  } = useStore()
  const { data: adminProducts = [] } = useProducts()
  const { data: myCoupons = [] } = useUserCoupons(user?.id)
  const { data: savedAddresses = [] } = useUserShippingAddresses(user?.id)
  const claimAll = useClaimAllCoupons()
  const [showCouponSelector, setShowCouponSelector] = useState(false)
  const [claimed, setClaimed] = useState(false)

  // 배송 정보 상태
  const [recipientName, setRecipientName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [zonecode, setZonecode] = useState('')
  const [address, setAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [deliveryMemo, setDeliveryMemo] = useState('')
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressInitialized, setAddressInitialized] = useState(false)

  // 쿠폰 자동 발급 (Supabase, 처음 방문 시 보유 쿠폰 없으면)
  useEffect(() => {
    if (user?.id && myCoupons.length === 0 && !claimed) {
      setClaimed(true)
      claimAll.mutate(user.id)
    }
  }, [user?.id, myCoupons.length, claimed, claimAll])

  // 사용자 정보 변경 시 수령인 이름 업데이트
  useEffect(() => {
    if (user?.name && !recipientName) {
      setRecipientName(user.name)
    }
    if (user?.phone && !phone) {
      setPhone(user.phone)
    }
  }, [user])

  // 기본 배송지 자동 입력 (최초 1회)
  useEffect(() => {
    if (!addressInitialized && savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0]
      if (defaultAddr && !zonecode) {
        fillAddressFromSaved(defaultAddr)
        setAddressInitialized(true)
      }
    }
  }, [savedAddresses, addressInitialized, zonecode])

  // 저장된 배송지로 폼 채우기
  const fillAddressFromSaved = (addr: SavedShippingAddress) => {
    setRecipientName(addr.recipient)
    setPhone(addr.phone)
    setZonecode(addr.postalCode)
    setAddress(addr.address1)
    setAddressDetail(addr.address2 || '')
    setDeliveryMemo(addr.notes || '')
    setErrors({})
  }

  // 배송지 선택
  const handleSelectAddress = (addr: SavedShippingAddress) => {
    fillAddressFromSaved(addr)
    setShowAddressModal(false)
  }

  // 다음 우편번호 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

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
      const shipping = getProductShipping(item.product.id, adminProducts)

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
  }, [cart, tier, adminProducts])

  const couponDiscount = getCouponDiscount(totalAmount)
  const discountedAmount = totalAmount - couponDiscount
  const grandTotal = discountedAmount + shippingCalculation.totalShippingFee

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discountType === 'percent') {
      return `${coupon.discountValue}%`
    }
    return formatPrice(coupon.discountValue)
  }

  // 배송지 정보 입력 완료 여부
  const isShippingComplete = recipientName.trim() !== '' &&
    phone.trim() !== '' &&
    zonecode !== '' &&
    address !== '' &&
    addressDetail.trim() !== ''

  // 우편번호 검색
  const handleAddressSearch = () => {
    if (!window.daum) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        setZonecode(data.zonecode)
        setAddress(data.address)
        setAddressDetail('')
        setTimeout(() => {
          document.getElementById('addressDetail')?.focus()
        }, 100)
      }
    }).open()
  }

  // 유효성 검사
  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!recipientName.trim()) {
      newErrors.recipientName = '수령인 이름을 입력해주세요'
    }

    if (!phone.trim()) {
      newErrors.phone = '연락처를 입력해주세요'
    } else if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.replace(/-/g, ''))) {
      newErrors.phone = '올바른 연락처 형식이 아닙니다'
    }

    if (!zonecode || !address) {
      newErrors.address = '주소를 검색해주세요'
    }

    if (!addressDetail.trim()) {
      newErrors.addressDetail = '상세주소를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 결제 처리
  const handlePayment = async () => {
    if (!validate()) return
    if (cart.length === 0) return

    setIsPaymentLoading(true)

    try {
      const tossPayments = window.TossPayments(TOSS_CLIENT_KEY)

      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const orderName = cart.length === 1
        ? cart[0].product.name
        : `${cart[0].product.name} 외 ${cart.length - 1}건`

      if (appliedCoupon) {
        localStorage.setItem('pendingCouponId', appliedCoupon.id)
      }

      const orderItems = cart.map(item => {
        const unitPrice = getPriceByTier(item.product, tier)
        return {
          id: crypto.randomUUID(),
          productId: item.product.id,
          productName: item.product.name,
          productSku: item.product.sku,
          selectedOptions: item.selectedOptions,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        }
      })

      const pendingOrderData = {
        orderNumber: orderId,
        userId: user?.id || '',
        user: {
          id: user?.id || '',
          name: user?.name || '',
          email: user?.email || '',
          company: user?.company,
          tier: user?.tier || 'guest',
        },
        items: orderItems,
        subtotal: totalAmount,
        shippingFee: shippingCalculation.totalShippingFee,
        totalAmount: grandTotal,
        paymentMethod: '카드',
        shippingInfo: {
          recipientName,
          phone: phone.replace(/-/g, ''),
          zonecode,
          address,
          addressDetail,
          fullAddress: `(${zonecode}) ${address} ${addressDetail}`,
          deliveryMemo,
        },
      }
      localStorage.setItem('pendingOrderData', JSON.stringify(pendingOrderData))

      // 전화번호 형식 통일 (하이픈 제거)
      const normalizedPhone = phone.replace(/-/g, '')

      const baseUrl = window.location.origin
      await tossPayments.requestPayment('카드', {
        amount: grandTotal,
        orderId,
        orderName,
        customerName: recipientName,
        customerMobilePhone: normalizedPhone,
        successUrl: `${baseUrl}/payment/success`,
        failUrl: `${baseUrl}/payment/fail`,
      })
    } catch (error: any) {
      if (error.code !== 'USER_CANCEL') {
        alert('결제 처리 중 오류가 발생했습니다.')
      }
      localStorage.removeItem('pendingOrderData')
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
                  const itemShipping = getProductShipping(item.product.id, adminProducts)
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
        <Animated animation="fade-up" delay={200} className="space-y-4">
          {/* 배송지 정보 (로그인 사용자만) */}
          {isLoggedIn && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    배송지 정보
                    {isShippingComplete && (
                      <span className="text-xs text-green-600 font-normal">✓ 입력완료</span>
                    )}
                  </h2>
                  {savedAddresses.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressModal(true)}
                    >
                      <ChevronDown className="w-3 h-3 mr-1" />
                      저장된 배송지
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* 수령인 */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      수령인 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="수령인 이름"
                        className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.recipientName ? 'border-red-500' : 'border-neutral-300'
                        }`}
                      />
                    </div>
                    {errors.recipientName && (
                      <p className="mt-1 text-xs text-red-500">{errors.recipientName}</p>
                    )}
                  </div>

                  {/* 연락처 */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010-0000-0000"
                        className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.phone ? 'border-red-500' : 'border-neutral-300'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  {/* 주소 */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      주소 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={zonecode}
                        placeholder="우편번호"
                        readOnly
                        className={`w-24 px-3 py-2 text-sm border rounded-lg bg-neutral-50 ${
                          errors.address ? 'border-red-500' : 'border-neutral-300'
                        }`}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={handleAddressSearch}>
                        <MapPin className="w-3 h-3 mr-1" />
                        검색
                      </Button>
                    </div>
                    <input
                      type="text"
                      value={address}
                      placeholder="기본주소"
                      readOnly
                      className={`w-full px-3 py-2 text-sm border rounded-lg bg-neutral-50 mb-2 ${
                        errors.address ? 'border-red-500' : 'border-neutral-300'
                      }`}
                    />
                    <input
                      id="addressDetail"
                      type="text"
                      value={addressDetail}
                      onChange={(e) => setAddressDetail(e.target.value)}
                      placeholder="상세주소 입력"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.addressDetail ? 'border-red-500' : 'border-neutral-300'
                      }`}
                    />
                    {(errors.address || errors.addressDetail) && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.address || errors.addressDetail}
                      </p>
                    )}
                  </div>

                  {/* 배송 메모 */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      배송 메모
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                      <textarea
                        value={deliveryMemo}
                        onChange={(e) => setDeliveryMemo(e.target.value)}
                        placeholder="배송 요청사항 (선택)"
                        rows={2}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 주문 요약 */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-bold text-neutral-900 mb-3">주문 요약</h2>

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
              <div className="mt-4">
                {isLoggedIn ? (
                  <>
                    {!isShippingComplete && (
                      <p className="text-xs text-amber-600 text-center mb-2">
                        배송지 정보를 모두 입력해주세요
                      </p>
                    )}
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePayment}
                      disabled={isPaymentLoading || !isShippingComplete}
                    >
                      {isPaymentLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          결제 처리 중...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          {formatPrice(grandTotal)} 결제하기
                        </>
                      )}
                    </Button>
                  </>
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

      {/* 저장된 배송지 선택 모달 */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900">저장된 배송지 선택</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => handleSelectAddress(addr)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-neutral-50 ${
                    addr.isDefault ? 'border-primary-500 bg-primary-50/50' : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-neutral-900">{addr.name}</span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center text-xs text-primary-600 bg-primary-100 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 mr-1" />
                        기본
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-neutral-600">
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-400" />
                      {addr.recipient}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      {addr.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      ({addr.postalCode}) {addr.address1} {addr.address2}
                    </p>
                    {addr.notes && (
                      <p className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-neutral-400" />
                        {addr.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {savedAddresses.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  <MapPin className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p>저장된 배송지가 없습니다.</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-neutral-200">
              <Link to="/my/shipping-addresses">
                <Button variant="outline" className="w-full">
                  배송지 관리
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
