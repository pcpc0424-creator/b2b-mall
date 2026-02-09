import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, User, FileText, CreditCard, Loader2 } from 'lucide-react'
import { useStore, getPriceByTier } from '../store'
import { useProducts } from '../hooks/queries'
import { Button, Card, CardContent } from '../components/ui'
import { formatPrice } from '../lib/utils'
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

// 상품별 배송 정보 가져오기
function getProductShipping(productId: string, adminProducts: AdminProduct[]) {
  const product = adminProducts.find(p => p.id === productId)
  if (product?.shipping) {
    return product.shipping
  }
  return { type: 'paid' as const, fee: 3000, bundleShipping: true }
}

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY

export function CheckoutPage() {
  const navigate = useNavigate()
  const {
    user,
    cart,
    getCartTotal,
    appliedCoupon,
    getCouponDiscount,
  } = useStore()
  const { data: adminProducts = [] } = useProducts()

  // 배송 정보 상태
  const [recipientName, setRecipientName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [zonecode, setZonecode] = useState('')
  const [address, setAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [deliveryMemo, setDeliveryMemo] = useState('')
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const tier = user?.tier || 'guest'
  const totalAmount = getCartTotal()

  // 배송비 계산
  const shippingFee = (() => {
    let bundleShippingItems: { fee: number }[] = []
    let separateShippingFee = 0

    cart.forEach(item => {
      const shipping = getProductShipping(item.product.id, adminProducts)

      if (shipping.type === 'free') {
        return
      } else if (shipping.type === 'conditional') {
        const itemTotal = getPriceByTier(item.product, tier) * item.quantity
        if (itemTotal >= (shipping.freeCondition || 50000)) {
          return
        }
        if (shipping.bundleShipping !== false) {
          bundleShippingItems.push({ fee: shipping.fee || 3000 })
        } else {
          separateShippingFee += shipping.fee || 3000
        }
      } else {
        if (shipping.bundleShipping !== false) {
          bundleShippingItems.push({ fee: shipping.fee || 3000 })
        } else {
          separateShippingFee += shipping.fee || 3000
        }
      }
    })

    const bundleFee = bundleShippingItems.length > 0
      ? Math.max(...bundleShippingItems.map(i => i.fee))
      : 0

    return bundleFee + separateShippingFee
  })()

  const couponDiscount = getCouponDiscount(totalAmount)
  const discountedAmount = totalAmount - couponDiscount
  const vat = Math.round(discountedAmount * 0.1)
  const grandTotal = discountedAmount + vat + shippingFee

  // 장바구니가 비어있으면 장바구니 페이지로 이동
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart')
    }
  }, [cart, navigate])

  // 다음 우편번호 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

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
        // 상세주소 입력란에 포커스
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
        shippingFee,
        totalAmount: grandTotal,
        paymentMethod: '카드',
        // 배송 정보 추가
        shippingInfo: {
          recipientName,
          phone,
          zonecode,
          address,
          addressDetail,
          fullAddress: `(${zonecode}) ${address} ${addressDetail}`,
          deliveryMemo,
        },
      }
      localStorage.setItem('pendingOrderData', JSON.stringify(pendingOrderData))

      const baseUrl = window.location.origin
      await tossPayments.requestPayment('카드', {
        amount: grandTotal,
        orderId,
        orderName,
        customerName: recipientName,
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
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/cart">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            장바구니
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">주문서 작성</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 배송 정보 입력 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 배송지 정보 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                배송지 정보
              </h2>

              <div className="space-y-4">
                {/* 수령인 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    수령인 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="수령인 이름"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.recipientName ? 'border-red-500' : 'border-neutral-300'
                      }`}
                    />
                  </div>
                  {errors.recipientName && (
                    <p className="mt-1 text-sm text-red-500">{errors.recipientName}</p>
                  )}
                </div>

                {/* 연락처 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.phone ? 'border-red-500' : 'border-neutral-300'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* 주소 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    주소 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={zonecode}
                      placeholder="우편번호"
                      readOnly
                      className={`w-28 px-4 py-2.5 border rounded-lg bg-neutral-50 ${
                        errors.address ? 'border-red-500' : 'border-neutral-300'
                      }`}
                    />
                    <Button type="button" variant="outline" onClick={handleAddressSearch}>
                      <MapPin className="w-4 h-4 mr-1" />
                      주소 검색
                    </Button>
                  </div>
                  <input
                    type="text"
                    value={address}
                    placeholder="기본주소"
                    readOnly
                    className={`w-full px-4 py-2.5 border rounded-lg bg-neutral-50 mb-2 ${
                      errors.address ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  />
                  <input
                    id="addressDetail"
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder="상세주소 입력"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.addressDetail ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  />
                  {(errors.address || errors.addressDetail) && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.address || errors.addressDetail}
                    </p>
                  )}
                </div>

                {/* 배송 메모 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    배송 메모
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                    <textarea
                      value={deliveryMemo}
                      onChange={(e) => setDeliveryMemo(e.target.value)}
                      placeholder="배송 시 요청사항을 입력해주세요 (예: 부재 시 경비실에 맡겨주세요)"
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 주문 상품 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">
                주문 상품 ({cart.length}개)
              </h2>
              <div className="space-y-3">
                {cart.map((item, index) => {
                  const price = getPriceByTier(item.product, tier)
                  const optionText = item.selectedOptions
                    ? Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')
                    : null

                  return (
                    <div key={index} className="flex gap-3 py-3 border-b border-neutral-100 last:border-0">
                      <img
                        src={item.product.images[0] || '/placeholder.png'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{item.product.name}</p>
                        {optionText && (
                          <p className="text-sm text-neutral-500">{optionText}</p>
                        )}
                        <p className="text-sm text-neutral-500">수량: {item.quantity}개</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neutral-900">{formatPrice(price * item.quantity)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 결제 정보 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                결제 정보
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">상품금액</span>
                  <span className="font-medium">{formatPrice(totalAmount)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>쿠폰할인</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-neutral-500">배송비</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? '무료' : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">부가세 (10%)</span>
                  <span className="font-medium">{formatPrice(vat)}</span>
                </div>

                <div className="border-t border-neutral-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-900">총 결제금액</span>
                    <span className="text-xl font-bold text-primary-600">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handlePayment}
                disabled={isPaymentLoading}
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

              <p className="text-xs text-neutral-400 text-center mt-3">
                주문 내용을 확인하였으며, 결제에 동의합니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
