import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight, AlertCircle } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { formatPrice } from '../lib/utils'
import { useStore } from '../store'
import { createOrder } from '../services/orders'
import { markCouponUsed } from '../services/coupons'
import type { CreateOrderInput } from '../services/orders'

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const { clearCart, applyCoupon } = useStore()
  const [orderInfo, setOrderInfo] = useState<{
    orderId: string
    amount: number
    paymentKey: string
  } | null>(null)
  const [orderSaved, setOrderSaved] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const paymentKey = searchParams.get('paymentKey')

    if (orderId && amount && paymentKey) {
      setOrderInfo({
        orderId,
        amount: parseInt(amount),
        paymentKey
      })

      // 장바구니 비우기
      clearCart()

      // 적용된 쿠폰 사용 처리 (Supabase)
      const pendingCouponId = localStorage.getItem('pendingCouponId')
      if (pendingCouponId) {
        markCouponUsed(pendingCouponId).catch(console.error)
        applyCoupon(null)
        localStorage.removeItem('pendingCouponId')
      }

      // localStorage에서 주문 데이터 읽어와서 Supabase에 저장
      const pendingOrderDataStr = localStorage.getItem('pendingOrderData')
      if (pendingOrderDataStr) {
        try {
          const pendingOrderData: CreateOrderInput = JSON.parse(pendingOrderDataStr)
          // paymentKey 추가
          pendingOrderData.paymentKey = paymentKey

          createOrder(pendingOrderData)
            .then(() => {
              setOrderSaved(true)
              localStorage.removeItem('pendingOrderData')
            })
            .catch((err) => {
              console.error('주문 저장 실패:', err)
              setOrderError('주문 정보 저장에 실패했습니다. 고객센터에 문의해주세요.')
            })
        } catch {
          console.error('주문 데이터 파싱 실패')
          setOrderError('주문 데이터 처리 중 오류가 발생했습니다.')
        }
      } else {
        // pendingOrderData가 없는 경우 (이미 처리됨 등)
        setOrderSaved(true)
      }
    }
  }, [searchParams, clearCart, applyCoupon])

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <Card className="p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          결제가 완료되었습니다
        </h1>
        <p className="text-neutral-500 mb-8">
          주문해 주셔서 감사합니다
        </p>

        {orderError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 font-medium">주문 저장 오류</p>
              <p className="text-sm text-red-600 mt-1">{orderError}</p>
            </div>
          </div>
        )}

        {orderInfo && (
          <div className="bg-neutral-50 rounded-lg p-4 mb-8 text-left">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">주문번호</span>
                <span className="font-mono font-medium">{orderInfo.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">결제금액</span>
                <span className="font-bold text-primary-600">{formatPrice(orderInfo.amount)}</span>
              </div>
              {orderSaved && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">주문상태</span>
                  <span className="text-green-600 font-medium">주문 확인됨</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link to="/orders" className="block">
            <Button className="w-full">
              <Package className="w-5 h-5 mr-2" />
              주문내역 확인
            </Button>
          </Link>
          <Link to="/products" className="block">
            <Button variant="outline" className="w-full">
              쇼핑 계속하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
