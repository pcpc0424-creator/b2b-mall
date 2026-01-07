import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, FileText } from 'lucide-react'
import { useStore, getPriceByTier, getTierLabel } from '../store'
import { Button, NumberStepper, Card, CardContent, Badge } from '../components/ui'
import { formatPrice, formatNumber, cn } from '../lib/utils'
import { Animated } from '../hooks'

export function CartPage() {
  const { user, cart, updateCartQuantity, removeFromCart, clearCart, getCartTotal, addToQuote } = useStore()

  const tier = user?.tier || 'guest'
  const totalAmount = getCartTotal()
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)
  const vat = Math.round(totalAmount * 0.1)
  const grandTotal = totalAmount + vat

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

  const handleConvertToQuote = () => {
    cart.forEach(item => {
      addToQuote(item.product, item.quantity)
    })
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
                {cart.map((item) => {
                  const price = getPriceByTier(item.product, tier)
                  const subtotal = price * item.quantity

                  return (
                    <div key={item.product.id} className="p-4 flex gap-4">
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
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-neutral-400 hover:text-error transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4">
                            <NumberStepper
                              value={item.quantity}
                              onChange={(q) => updateCartQuantity(item.product.id, q)}
                              min={item.product.minQuantity}
                              max={item.product.stock}
                              size="sm"
                            />
                            <span className="text-sm text-neutral-500">
                              × {formatPrice(price)}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-primary-600">
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
                <div className="flex justify-between">
                  <span className="text-neutral-600">부가세 (10%)</span>
                  <span className="font-medium">{formatPrice(vat)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">배송비</span>
                  <span className="font-medium text-success">무료</span>
                </div>

                <div className="border-t border-neutral-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">총 결제금액</span>
                    <span className="text-2xl font-bold text-primary-600">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button className="w-full" size="lg">
                  주문하기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link to="/quote">
                  <Button variant="outline" className="w-full" onClick={handleConvertToQuote}>
                    <FileText className="w-4 h-4 mr-2" />
                    견적서로 전환
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-neutral-600 space-y-2">
                <p>• VIP 이상 회원 무료 배송</p>
                <p>• 100개 이상 주문 시 무료 배송</p>
                <p>• 예상 배송일: 영업일 기준 2-3일</p>
              </div>
            </CardContent>
          </Card>
        </Animated>
      </div>
    </div>
  )
}
