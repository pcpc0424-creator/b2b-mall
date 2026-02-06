import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { formatPrice } from '../lib/utils'
import { useStore } from '../store'
import { createOrder } from '../services/orders'
import { confirmPayment } from '../services/payment'
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
  const [isConfirming, setIsConfirming] = useState(true)
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const paymentKey = searchParams.get('paymentKey')

    if (!orderId || !amount || !paymentKey) {
      setIsConfirming(false)
      setOrderError('결제 정보가 올바르지 않습니다.')
      return
    }

    const parsedAmount = parseInt(amount)
    setOrderInfo({ orderId, amount: parsedAmount, paymentKey })

    // 결제 승인 → 주문 생성 순서로 처리
    async function processPayment() {
      try {
        // 1. 토스페이먼츠 결제 승인 (서버 사이드)
        await confirmPayment({
          paymentKey: paymentKey!,
          orderId: orderId!,
          amount: parsedAmount,
        })

        // 2. 장바구니 비우기
        clearCart()

        // 3. 쿠폰 사용 처리
        const pendingCouponId = localStorage.getItem('pendingCouponId')
        if (pendingCouponId) {
          markCouponUsed(pendingCouponId).catch(console.error)
          applyCoupon(null)
          localStorage.removeItem('pendingCouponId')
        }

        // 4. Supabase에 주문 저장
        const pendingOrderDataStr = localStorage.getItem('pendingOrderData')
        if (pendingOrderDataStr) {
          const pendingOrderData: CreateOrderInput = JSON.parse(pendingOrderDataStr)
          pendingOrderData.paymentKey = paymentKey!

          await createOrder(pendingOrderData)
          setOrderSaved(true)
          localStorage.removeItem('pendingOrderData')
        } else {
          setOrderSaved(true)
        }
      } catch (err: any) {
        console.error('결제 처리 실패:', err)
        setOrderError(
          err.message || '결제 승인에 실패했습니다. 고객센터에 문의해주세요.'
        )
      } finally {
        setIsConfirming(false)
      }
    }

    processPayment()
  }, [searchParams, clearCart, applyCoupon])

  // 결제 승인 처리 중
  if (isConfirming) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <Card className="p-8 text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-6" />
          <h1 className="text-xl font-bold text-neutral-900 mb-2">
            결제를 확인하고 있습니다
          </h1>
          <p className="text-neutral-500">
            잠시만 기다려주세요...
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <Card className="p-8 text-center">
        {orderError ? (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              결제 처리 중 문제가 발생했습니다
            </h1>
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm text-red-700">{orderError}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              결제가 완료되었습니다
            </h1>
            <p className="text-neutral-500 mb-8">
              주문해 주셔서 감사합니다
            </p>
          </>
        )}

        {orderInfo && !orderError && (
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
