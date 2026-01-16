import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { formatPrice } from '../lib/utils'
import { useStore } from '../store'

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const { clearCart, useCoupon, applyCoupon } = useStore()
  const [orderInfo, setOrderInfo] = useState<{
    orderId: string
    amount: number
    paymentKey: string
  } | null>(null)

  useEffect(() => {
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

      // 적용된 쿠폰 사용 처리
      const pendingCouponId = localStorage.getItem('pendingCouponId')
      if (pendingCouponId) {
        useCoupon(pendingCouponId)
        applyCoupon(null)
        localStorage.removeItem('pendingCouponId')
      }

      // 실제 서비스에서는 여기서 서버에 결제 승인 요청을 보내야 합니다
      // 예: await fetch('/api/payments/confirm', { ... })
    }
  }, [searchParams, clearCart, useCoupon, applyCoupon])

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
