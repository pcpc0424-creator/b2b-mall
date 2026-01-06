import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShoppingCart, FileText, Zap, Package, Truck, Shield, ChevronDown } from 'lucide-react'
import { useStore, getPriceByTier, getTierLabel, getTierColor } from '../store'
import { products, categories } from '../data'
import { ProductCard } from '../components/product'
import { Button, Badge, NumberStepper, Card, CardContent } from '../components/ui'
import { formatPrice, cn } from '../lib/utils'
import { UserTier } from '../types'

export function ProductDetailPage() {
  const { productId } = useParams()
  const { user, addToCart, addToQuote } = useStore()
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showPriceTable, setShowPriceTable] = useState(false)

  const product = products.find(p => p.id === productId)
  const tier = user?.tier || 'guest'

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">상품을 찾을 수 없습니다</h1>
        <Link to="/products" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          상품 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  const category = categories.find(c => c.id === product.categoryId)
  const currentPrice = getPriceByTier(product, tier)
  const retailPrice = product.prices.retail
  const discountPercent = Math.round((1 - currentPrice / retailPrice) * 100)

  // Related products
  const relatedProducts = products
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 5)

  const stockStatusConfig = {
    available: { label: '재고충분', variant: 'success' as const, color: 'text-success' },
    low: { label: '재고부족', variant: 'warning' as const, color: 'text-accent-600' },
    out_of_stock: { label: '품절', variant: 'error' as const, color: 'text-error' },
  }

  const stockConfig = stockStatusConfig[product.stockStatus]

  const priceTableRows: { tier: UserTier; label: string; price: number }[] = [
    { tier: 'guest', label: '소매가', price: product.prices.retail },
    { tier: 'member', label: '일반회원가', price: product.prices.member },
    { tier: 'vip', label: 'VIP가', price: product.prices.vip },
    { tier: 'wholesale', label: '도매가', price: product.prices.wholesale },
    { tier: 'partner', label: '파트너가', price: product.prices.partner },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-neutral-500 mb-6">
        <Link to="/" className="hover:text-primary-600">홈</Link>
        <span className="mx-2">/</span>
        {category && (
          <>
            <Link to={`/category/${category.id}`} className="hover:text-primary-600">{category.name}</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-neutral-900">{product.name}</span>
      </nav>

      {/* Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden mb-4">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % product.images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge variant={stockConfig.variant}>{stockConfig.label}</Badge>
              {discountPercent > 0 && tier !== 'guest' && (
                <Badge variant="error">{discountPercent}% OFF</Badge>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    'w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors',
                    idx === currentImageIndex ? 'border-primary-600' : 'border-transparent hover:border-neutral-300'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="mb-4">
            <span className="text-sm text-neutral-500">{product.brand}</span>
            <span className="text-sm text-neutral-400 ml-3">SKU: {product.sku}</span>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-4">{product.name}</h1>

          {/* Price Section */}
          <div className="bg-neutral-50 rounded-lg p-6 mb-6">
            <div className="flex items-baseline gap-3 mb-4">
              {tier !== 'guest' && currentPrice < retailPrice && (
                <span className="text-lg text-neutral-400 line-through">{formatPrice(retailPrice)}</span>
              )}
              <span className="text-3xl font-bold text-primary-600">{formatPrice(currentPrice)}</span>
              {tier !== 'guest' && (
                <span className={cn('text-sm font-medium px-2 py-1 rounded', getTierColor(tier))}>
                  {getTierLabel(tier)}가
                </span>
              )}
            </div>

            {/* Price Table Toggle */}
            <button
              onClick={() => setShowPriceTable(!showPriceTable)}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              등급별 가격표 보기
              <ChevronDown className={cn('w-4 h-4 transition-transform', showPriceTable && 'rotate-180')} />
            </button>

            {showPriceTable && (
              <div className="mt-4 border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-neutral-600">등급</th>
                      <th className="px-4 py-2 text-right font-medium text-neutral-600">단가</th>
                      <th className="px-4 py-2 text-right font-medium text-neutral-600">할인율</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {priceTableRows.map((row) => (
                      <tr
                        key={row.tier}
                        className={cn(
                          tier === row.tier && 'bg-primary-50'
                        )}
                      >
                        <td className="px-4 py-2">
                          <span className={cn(
                            'inline-flex items-center gap-2',
                            tier === row.tier && 'font-medium'
                          )}>
                            {row.label}
                            {tier === row.tier && (
                              <Badge variant="primary" size="sm">현재 등급</Badge>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatPrice(row.price)}
                        </td>
                        <td className="px-4 py-2 text-right text-secondary-600">
                          {row.tier !== 'guest' && `-${Math.round((1 - row.price / retailPrice) * 100)}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stock & Quantity */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-neutral-600">재고 상태</span>
              <span className={cn('font-medium', stockConfig.color)}>
                {product.stockStatus !== 'out_of_stock' && `${product.stock}개 `}
                {stockConfig.label}
              </span>
            </div>

            {product.minQuantity > 1 && (
              <p className="text-sm text-neutral-500 mb-3">
                최소 주문수량: <span className="font-medium text-neutral-700">{product.minQuantity}개</span>
              </p>
            )}

            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">주문 수량</span>
              <NumberStepper
                value={quantity}
                onChange={setQuantity}
                min={product.minQuantity}
                max={product.stock}
                disabled={product.stockStatus === 'out_of_stock'}
              />
              <span className="text-sm text-neutral-500">
                = <span className="font-bold text-primary-600">{formatPrice(currentPrice * quantity)}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <Button
              size="lg"
              onClick={() => addToCart(product, quantity)}
              disabled={product.stockStatus === 'out_of_stock'}
              className="flex-1"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              장바구니 담기
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => addToQuote(product, quantity)}
              disabled={product.stockStatus === 'out_of_stock'}
            >
              <FileText className="w-5 h-5 mr-2" />
              견적에 담기
            </Button>
          </div>

          <Link to="/quick-order">
            <Button variant="secondary" size="lg" className="w-full">
              <Zap className="w-5 h-5 mr-2" />
              빠른 주문에 추가
            </Button>
          </Link>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <Truck className="w-6 h-6 mx-auto text-primary-600 mb-2" />
              <p className="text-xs text-neutral-600">100개 이상<br />무료배송</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <Package className="w-6 h-6 mx-auto text-primary-600 mb-2" />
              <p className="text-xs text-neutral-600">안전포장<br />출고</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <Shield className="w-6 h-6 mx-auto text-primary-600 mb-2" />
              <p className="text-xs text-neutral-600">정품보증<br />A/S</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Order Table */}
      <Card className="mb-12">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">대량 주문 단가표</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">수량</th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-600">단가</th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-600">합계</th>
                  <th className="px-4 py-3 text-center font-medium text-neutral-600">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {[10, 50, 100, 500, 1000].map((qty) => {
                  const unitPrice = currentPrice * (qty >= 100 ? 0.95 : qty >= 500 ? 0.9 : 1)
                  return (
                    <tr key={qty} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">{qty}개</td>
                      <td className="px-4 py-3 text-right font-medium">{formatPrice(Math.round(unitPrice))}</td>
                      <td className="px-4 py-3 text-right font-bold text-primary-600">{formatPrice(Math.round(unitPrice * qty))}</td>
                      <td className="px-4 py-3 text-center">
                        {qty >= 500 && <Badge variant="error" size="sm">10% 추가할인</Badge>}
                        {qty >= 100 && qty < 500 && <Badge variant="secondary" size="sm">5% 추가할인</Badge>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-neutral-500 mt-4">
            * 대량 주문 시 추가 할인이 적용됩니다. 1,000개 이상 주문은 별도 문의 바랍니다.
          </p>
        </CardContent>
      </Card>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-6">관련 상품</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
