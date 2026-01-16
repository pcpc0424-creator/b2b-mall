import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShoppingCart, Zap, ChevronDown, Truck, Package } from 'lucide-react'
import { useStore, getPriceByTier, getTierLabel, getTierColor } from '../store'
import { useAdminStore } from '../admin/store/adminStore'
import { products as defaultProducts, categories } from '../data'
import { ProductCard, ProductReviews } from '../components/product'
import { Button, Badge, NumberStepper, Card, CardContent } from '../components/ui'
import { formatPrice, cn } from '../lib/utils'
import { Animated } from '../hooks'
import { ProductOption } from '../types'
import { ProductOptionAdmin, OptionValue } from '../admin/types/admin'

export function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { user, addToCart } = useStore()
  const [showAddedToast, setShowAddedToast] = useState(false)
  const { products: adminProducts } = useAdminStore()
  const [quantity, setQuantity] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [optionPriceModifier, setOptionPriceModifier] = useState(0)

  // 관리자 상품 우선, 없으면 기본 상품 사용
  const product = useMemo(() => {
    const adminProduct = adminProducts.find(p => p.id === productId)
    if (adminProduct) return adminProduct
    return defaultProducts.find(p => p.id === productId)
  }, [productId, adminProducts])

  // localStorage에서 직접 adminOptions 가져오기 (zustand persist 우회)
  const getAdminOptionsFromLocalStorage = (pid: string) => {
    try {
      const stored = localStorage.getItem('admin-storage')
      if (stored) {
        const parsed = JSON.parse(stored)
        const products = parsed.state?.products
        if (products) {
          const product = products.find((p: any) => p.id === pid)
          return product?.adminOptions || []
        }
      }
    } catch (e) {
      console.error('localStorage 읽기 에러:', e)
    }
    return []
  }

  // 관리자 상품에서 옵션 가져오기 (adminOptions -> ProductOption 변환)
  const productOptions = useMemo((): ProductOption[] => {
    const adminProduct = adminProducts.find(p => p.id === productId)
    const defaultProduct = defaultProducts.find(p => p.id === productId)

    // localStorage에서 직접 읽기 (zustand persist 문제 우회)
    const localStorageOptions = productId ? getAdminOptionsFromLocalStorage(productId) : []

    console.log('=== 옵션 디버그 ===')
    console.log('productId:', productId)
    console.log('adminProduct.adminOptions:', adminProduct?.adminOptions)
    console.log('localStorage adminOptions:', localStorageOptions)

    // 1. localStorage에서 직접 가져온 adminOptions 우선 사용
    if (localStorageOptions && localStorageOptions.length > 0) {
      console.log('localStorage adminOptions 사용')
      return localStorageOptions.map((opt: any) => ({
        id: opt.id,
        name: opt.name,
        values: opt.values.map((v: any) => v.value)
      }))
    }
    // 2. zustand store의 adminOptions 사용
    if (adminProduct?.adminOptions && adminProduct.adminOptions.length > 0) {
      console.log('adminOptions 사용')
      return adminProduct.adminOptions.map(opt => ({
        id: opt.id,
        name: opt.name,
        values: opt.values.map(v => v.value)
      }))
    }
    // 3. 기본 상품의 options 확인
    if (defaultProduct?.options && defaultProduct.options.length > 0) {
      console.log('defaultProduct.options 사용')
      return defaultProduct.options
    }
    // 4. product.options 폴백
    console.log('폴백 사용')
    return product?.options || []
  }, [productId, adminProducts, product])

  // 관리자 옵션 원본 (가격 수정자 계산용) - localStorage에서 직접 읽기
  const adminOptionsMap = useMemo((): ProductOptionAdmin[] => {
    // localStorage에서 직접 읽기
    const localStorageOptions = productId ? getAdminOptionsFromLocalStorage(productId) : []
    if (localStorageOptions && localStorageOptions.length > 0) {
      return localStorageOptions
    }
    // fallback to zustand store
    const adminProduct = adminProducts.find(p => p.id === productId)
    return adminProduct?.adminOptions || []
  }, [productId, adminProducts])

  // 배송비 정보 가져오기 - localStorage에서 직접 읽기
  const shippingInfo = useMemo(() => {
    // localStorage에서 직접 읽기
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
      console.error('localStorage shipping 읽기 에러:', e)
    }
    // fallback
    const adminProduct = adminProducts.find(p => p.id === productId)
    return adminProduct?.shipping || { type: 'paid' as const, fee: 3000 }
  }, [productId, adminProducts])

  // 상품이 변경되면 옵션 초기화
  useEffect(() => {
    if (productOptions.length > 0) {
      const initialOptions: Record<string, string> = {}
      productOptions.forEach(opt => {
        initialOptions[opt.id] = ''
      })
      setSelectedOptions(initialOptions)
      setOptionPriceModifier(0)
    } else {
      setSelectedOptions({})
      setOptionPriceModifier(0)
    }
  }, [productOptions])

  // 옵션 선택 시 가격 수정자 계산
  useEffect(() => {
    let totalModifier = 0
    adminOptionsMap.forEach(opt => {
      const selectedValue = selectedOptions[opt.id]
      if (selectedValue) {
        const optionValue = opt.values.find(v => v.value === selectedValue)
        if (optionValue) {
          totalModifier += optionValue.priceModifier
        }
      }
    })
    setOptionPriceModifier(totalModifier)
  }, [selectedOptions, adminOptionsMap])

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
  const memberPrice = product.prices.member
  // 회원가 기준 할인율 (정상가 대비)
  const discountPercent = Math.round((1 - memberPrice / retailPrice) * 100)
  // 현재 등급 기준 추가 할인율
  const tierDiscountPercent = tier !== 'guest' ? Math.round((1 - currentPrice / retailPrice) * 100) : discountPercent

  // Related products
  const relatedProducts = defaultProducts
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 5)

  const stockStatusConfig = {
    available: { label: '재고충분', variant: 'success' as const, color: 'text-success' },
    low: { label: '재고부족', variant: 'warning' as const, color: 'text-accent-600' },
    out_of_stock: { label: '품절', variant: 'error' as const, color: 'text-error' },
  }

  const stockConfig = stockStatusConfig[product.stockStatus]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center flex-wrap">
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
      </Animated>

      {/* Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <Animated animation="fade-left" delay={100}>
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
                    'w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105',
                    idx === currentImageIndex ? 'border-primary-600' : 'border-transparent hover:border-neutral-300'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </Animated>

        {/* Info */}
        <Animated animation="fade-right" delay={200}>
          <div className="mb-4">
            <span className="text-sm text-neutral-500">{product.brand}</span>
            <span className="text-sm text-neutral-400 ml-3">SKU: {product.sku}</span>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-4">{product.name}</h1>

          {/* Price Section */}
          <div className="bg-neutral-50 rounded-lg p-6 mb-6">
            {/* 상품가격 (정상가) */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-neutral-500 w-16">상품가격</span>
              <span className="text-base text-neutral-400 line-through">{formatPrice(retailPrice)}</span>
            </div>

            {/* 할인률 */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-neutral-500 w-16">할인</span>
              <span className="text-lg font-bold text-red-500">{tierDiscountPercent}%</span>
              {tier !== 'guest' && tierDiscountPercent > discountPercent && (
                <span className="text-xs text-red-400">(기본 {discountPercent}% + 등급추가할인)</span>
              )}
            </div>

            {/* 판매가 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-neutral-500 w-16">판매가</span>
              <span className="text-2xl font-bold text-primary-600">{formatPrice(tier === 'guest' ? memberPrice : currentPrice)}</span>
              {tier !== 'guest' && (
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded', getTierColor(tier))}>
                  {getTierLabel(tier)}
                </span>
              )}
            </div>

          </div>

          {/* 옵션 선택 (모든 상품에 표시) */}
          <div className="mb-6 space-y-3">
            {/* 상품 옵션들 */}
            {productOptions.map((option) => {
              const adminOption = adminOptionsMap.find(ao => ao.id === option.id)

              return (
                <div key={option.id} className="relative border border-neutral-200 rounded-lg">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-600 pointer-events-none">
                    {option.name}
                  </span>
                  <select
                    value={selectedOptions[option.id] || ''}
                    onChange={(e) => setSelectedOptions(prev => ({ ...prev, [option.id]: e.target.value }))}
                    className="w-full px-4 py-3 text-sm text-neutral-900 bg-transparent border-none focus:outline-none cursor-pointer appearance-none text-center pr-10"
                  >
                    <option value="">선택하세요</option>
                    {option.values.map((value) => {
                      const optionValue = adminOption?.values.find(v => v.value === value)
                      const priceModifier = optionValue?.priceModifier || 0
                      const priceText = priceModifier > 0 ? ` (+${formatPrice(priceModifier)})` :
                                       priceModifier < 0 ? ` (${formatPrice(priceModifier)})` : ''
                      return (
                        <option key={value} value={value}>{value}{priceText}</option>
                      )
                    })}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              )
            })}

            {/* 배송비 옵션 (모든 상품에 표시) */}
            <div className="relative border border-neutral-200 rounded-lg bg-neutral-50">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-600 pointer-events-none flex items-center gap-1">
                <Truck className="w-4 h-4" />
                배송
              </span>
              <div className="w-full px-4 py-3 text-sm text-neutral-900 text-center pr-10">
                {shippingInfo.type === 'free' && (
                  <span className="text-primary-600 font-medium">무료배송</span>
                )}
                {shippingInfo.type === 'paid' && (
                  <span>택배배송 {formatPrice(shippingInfo.fee || 3000)} (주문시 결제)</span>
                )}
                {shippingInfo.type === 'conditional' && (
                  <span>{formatPrice(shippingInfo.freeCondition || 50000)} 이상 무료 / 미만 {formatPrice(shippingInfo.fee || 3000)}</span>
                )}
              </div>
            </div>

            {/* 묶음배송 표시 */}
            {shippingInfo.type !== 'free' && (
              <div className="relative border border-neutral-200 rounded-lg bg-neutral-50">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-600 pointer-events-none flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  묶음배송
                </span>
                <div className="w-full px-4 py-3 text-sm text-neutral-900 text-center pr-10">
                  {shippingInfo.bundleShipping !== false ? (
                    <span className="text-primary-600 font-medium">가능</span>
                  ) : (
                    <span className="text-neutral-500">불가</span>
                  )}
                </div>
              </div>
            )}

            {/* 옵션 추가금액 표시 */}
            {optionPriceModifier !== 0 && (
              <div className="text-sm text-right">
                <span className="text-neutral-500">옵션 추가금액: </span>
                <span className={optionPriceModifier > 0 ? 'text-red-500 font-medium' : 'text-green-500 font-medium'}>
                  {optionPriceModifier > 0 ? '+' : ''}{formatPrice(optionPriceModifier)}
                </span>
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
                min={0}
                max={product.stock}
                disabled={product.stockStatus === 'out_of_stock'}
              />
              <span className="text-sm text-neutral-500">
                = <span className="font-bold text-primary-600">{formatPrice((currentPrice + optionPriceModifier) * quantity)}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <Button
              size="lg"
              onClick={() => {
                if (quantity <= 0) {
                  alert('수량을 선택해주세요.')
                  return
                }
                // 옵션명으로 변환하여 저장
                const optionsWithNames: Record<string, string> = {}
                productOptions.forEach(opt => {
                  if (selectedOptions[opt.id]) {
                    optionsWithNames[opt.name] = selectedOptions[opt.id]
                  }
                })
                addToCart(product, quantity, Object.keys(optionsWithNames).length > 0 ? optionsWithNames : undefined)
                navigate('/cart')
              }}
              disabled={product.stockStatus === 'out_of_stock'}
              className="flex-1"
            >
              <Zap className="w-5 h-5 mr-2" />
              바로 구매
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                if (quantity <= 0) {
                  alert('수량을 선택해주세요.')
                  return
                }
                // 옵션명으로 변환하여 저장
                const optionsWithNames: Record<string, string> = {}
                productOptions.forEach(opt => {
                  if (selectedOptions[opt.id]) {
                    optionsWithNames[opt.name] = selectedOptions[opt.id]
                  }
                })
                addToCart(product, quantity, Object.keys(optionsWithNames).length > 0 ? optionsWithNames : undefined)
                setShowAddedToast(true)
                setTimeout(() => setShowAddedToast(false), 2000)
              }}
              disabled={product.stockStatus === 'out_of_stock'}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              장바구니 담기
            </Button>
          </div>

          {/* 장바구니 추가 알림 */}
          {showAddedToast && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
              장바구니에 상품이 담겼습니다.
            </div>
          )}


        </Animated>
      </div>

      {/* Product Reviews */}
      <Animated animation="fade-up" delay={300}>
        <ProductReviews productId={product.id} />
      </Animated>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Animated animation="fade-up" delay={400}>
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-6">관련 상품</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedProducts.map((p, index) => (
                <div key={p.id} className="animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        </Animated>
      )}
    </div>
  )
}
