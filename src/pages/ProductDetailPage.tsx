import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShoppingCart, Zap, ChevronDown, Truck, Package, X, ZoomIn, ZoomOut, Lock, Plus, Minus, Trash2 } from 'lucide-react'
import { useStore, getPriceByTier, getTierLabel, getTierColor } from '../store'
import { useProducts, useCategories } from '../hooks/queries'
import { ProductCard, ProductReviews } from '../components/product'
import { Button, Badge, NumberStepper, Card, CardContent } from '../components/ui'
import { formatPrice, cn } from '../lib/utils'
import { Animated } from '../hooks'
import { ProductOption } from '../types'
import { ProductOptionAdmin, QuantityDiscount, ProductVariant } from '../admin/types/admin'

// 선택된 옵션 아이템 타입 (다중 옵션 지원)
interface SelectedOptionItem {
  id: string
  options: Record<string, string> // 옵션명: 옵션값
  quantity: number
  priceModifier: number
  stock: number // 해당 옵션 조합의 재고
}

export function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { user, addToCart, isLoggedIn } = useStore()
  const [showAddedToast, setShowAddedToast] = useState(false)
  const { data: adminProducts = [] } = useProducts()
  const { data: categories = [] } = useCategories()
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [optionPriceModifier, setOptionPriceModifier] = useState(0)
  const [selectedQuantityDiscount, setSelectedQuantityDiscount] = useState<QuantityDiscount | null>(null)
  const [selectedOptionItems, setSelectedOptionItems] = useState<SelectedOptionItem[]>([]) // 다중 옵션 선택 리스트

  // 관리자 상품에서 찾기
  const product = useMemo(() => {
    return adminProducts.find(p => p.id === productId)
  }, [productId, adminProducts])

  // 상품 설정 가져오기
  const productSettings = useMemo(() => {
    const adminProduct = adminProducts.find(p => p.id === productId)
    return {
      showOptionImages: adminProduct?.showOptionImages || false,
      quantityDiscounts: adminProduct?.quantityDiscounts || [],
      description: adminProduct?.description || '',
      detailImages: adminProduct?.detailImages || [],
    }
  }, [productId, adminProducts])

  // 관리자 상품에서 옵션 가져오기 (adminOptions -> ProductOption 변환)
  const productOptions = useMemo((): ProductOption[] => {
    const adminProduct = adminProducts.find(p => p.id === productId)

    // 1. adminOptions 사용
    if (adminProduct?.adminOptions && adminProduct.adminOptions.length > 0) {
      return adminProduct.adminOptions.map(opt => ({
        id: opt.id,
        name: opt.name,
        values: opt.values.map(v => v.value)
      }))
    }
    // 2. product.options 폴백
    return product?.options || []
  }, [productId, adminProducts, product])

  // 관리자 옵션 원본 (가격 수정자 계산용)
  const adminOptionsMap = useMemo((): ProductOptionAdmin[] => {
    const adminProduct = adminProducts.find(p => p.id === productId)
    return adminProduct?.adminOptions || []
  }, [productId, adminProducts])

  // 상품 변형(옵션 조합) 정보
  const productVariants = useMemo((): ProductVariant[] => {
    const adminProduct = adminProducts.find(p => p.id === productId)
    return adminProduct?.variants || []
  }, [productId, adminProducts])

  // 필수 옵션이 모두 선택되었는지 확인 (required=true인 옵션만 체크)
  const isAllOptionsSelected = useMemo(() => {
    if (productOptions.length === 0) return true
    // adminOptionsMap에서 required 정보 확인
    return productOptions.every(opt => {
      const adminOpt = adminOptionsMap.find(ao => ao.id === opt.id)
      // required가 false이면 선택 안 해도 됨
      if (adminOpt && adminOpt.required === false) return true
      // required가 true이거나 undefined면 필수
      return selectedOptions[opt.id] && selectedOptions[opt.id] !== ''
    })
  }, [productOptions, selectedOptions, adminOptionsMap])

  // 최소 하나 이상의 옵션이 선택되었는지 확인
  const hasAnyOptionSelected = useMemo(() => {
    if (productOptions.length === 0) return true
    return productOptions.some(opt => selectedOptions[opt.id] && selectedOptions[opt.id] !== '')
  }, [productOptions, selectedOptions])

  // 현재 선택된 옵션 조합의 재고 확인
  const getCurrentOptionStock = useCallback((optionsToCheck: Record<string, string>): number => {
    if (productOptions.length === 0) return product?.stock || 0

    // 옵션명으로 변환
    const optionsByName: Record<string, string> = {}
    productOptions.forEach(opt => {
      if (optionsToCheck[opt.id]) {
        optionsByName[opt.name] = optionsToCheck[opt.id]
      }
    })

    // variants에서 해당 조합 찾기
    const variant = productVariants.find(v => {
      return Object.keys(v.optionCombination).every(
        key => v.optionCombination[key] === optionsByName[key]
      ) && Object.keys(optionsByName).every(
        key => optionsByName[key] === v.optionCombination[key]
      )
    })

    if (variant) return variant.stock
    return product?.stock || 0 // variant가 없으면 기본 재고 사용
  }, [productOptions, productVariants, product])

  // 현재 선택된 옵션의 재고
  const currentOptionStock = useMemo(() => {
    if (!isAllOptionsSelected) return product?.stock || 0
    return getCurrentOptionStock(selectedOptions)
  }, [isAllOptionsSelected, selectedOptions, getCurrentOptionStock, product])

  // 옵션 선택 토글 (이미지 옵션용)
  const toggleOption = useCallback((optionId: string, value: string) => {
    setSelectedOptions(prev => {
      if (prev[optionId] === value) {
        // 같은 값이면 선택 해제
        return { ...prev, [optionId]: '' }
      }
      return { ...prev, [optionId]: value }
    })
  }, [])

  // 선택한 옵션을 리스트에 추가
  const addSelectedOptionToList = useCallback(() => {
    // 최소 하나 이상의 옵션이 선택되어야 함
    if (!hasAnyOptionSelected) {
      alert('옵션을 선택해주세요.')
      return
    }

    // 필수 옵션이 선택되었는지 확인
    if (!isAllOptionsSelected) {
      // 필수 옵션 중 선택 안 된 것 찾기
      const missingOptions = productOptions
        .filter(opt => {
          const adminOpt = adminOptionsMap.find(ao => ao.id === opt.id)
          const isRequired = !adminOpt || adminOpt.required !== false
          return isRequired && (!selectedOptions[opt.id] || selectedOptions[opt.id] === '')
        })
        .map(opt => opt.name)

      if (missingOptions.length > 0) {
        alert(`필수 옵션을 선택해주세요: ${missingOptions.join(', ')}`)
        return
      }
    }

    // 옵션명으로 변환 (선택된 옵션만)
    const optionsByName: Record<string, string> = {}
    productOptions.forEach(opt => {
      if (selectedOptions[opt.id]) {
        optionsByName[opt.name] = selectedOptions[opt.id]
      }
    })

    // 이미 같은 옵션 조합이 있는지 확인
    const existingIndex = selectedOptionItems.findIndex(item => {
      return Object.keys(item.options).every(
        key => item.options[key] === optionsByName[key]
      ) && Object.keys(optionsByName).every(
        key => optionsByName[key] === item.options[key]
      )
    })

    const stock = getCurrentOptionStock(selectedOptions)

    if (existingIndex >= 0) {
      // 이미 있으면 수량 증가
      setSelectedOptionItems(prev => prev.map((item, idx) => {
        if (idx === existingIndex) {
          const newQuantity = Math.min(item.quantity + 1, stock)
          return { ...item, quantity: newQuantity }
        }
        return item
      }))
    } else {
      // 새로운 옵션 조합 추가
      const newItem: SelectedOptionItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        options: optionsByName,
        quantity: 1,
        priceModifier: optionPriceModifier,
        stock
      }
      setSelectedOptionItems(prev => [...prev, newItem])
    }

    // 옵션 선택 초기화
    const initialOptions: Record<string, string> = {}
    productOptions.forEach(opt => {
      initialOptions[opt.id] = ''
    })
    setSelectedOptions(initialOptions)
  }, [hasAnyOptionSelected, isAllOptionsSelected, productOptions, selectedOptions, selectedOptionItems, optionPriceModifier, getCurrentOptionStock, adminOptionsMap])

  // 선택된 옵션 아이템 수량 변경
  const updateOptionItemQuantity = useCallback((itemId: string, newQuantity: number) => {
    setSelectedOptionItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const qty = Math.max(1, Math.min(newQuantity, item.stock))
        return { ...item, quantity: qty }
      }
      return item
    }))
  }, [])

  // 선택된 옵션 아이템 삭제
  const removeOptionItem = useCallback((itemId: string) => {
    setSelectedOptionItems(prev => prev.filter(item => item.id !== itemId))
  }, [])

  // 선택된 옵션들의 총 금액 (product 존재 시에만 계산)
  const selectedOptionsTotalPrice = useMemo(() => {
    if (!product) return 0
    const basePrice = getPriceByTier(product, user?.tier || 'guest')
    if (productOptions.length === 0) {
      // 옵션이 없는 상품
      return (basePrice + optionPriceModifier) * quantity
    }
    // 옵션이 있는 상품
    return selectedOptionItems.reduce((total, item) => {
      return total + (basePrice + item.priceModifier) * item.quantity
    }, 0)
  }, [product, user?.tier, productOptions, optionPriceModifier, quantity, selectedOptionItems])

  // 선택된 옵션들의 총 수량
  const selectedOptionsTotalQuantity = useMemo(() => {
    if (productOptions.length === 0) return quantity
    return selectedOptionItems.reduce((total, item) => total + item.quantity, 0)
  }, [productOptions, quantity, selectedOptionItems])

  // 배송비 정보 가져오기
  const shippingInfo = useMemo(() => {
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
      setSelectedOptionItems([]) // 선택된 옵션 리스트도 초기화
    } else {
      setSelectedOptions({})
      setOptionPriceModifier(0)
      setSelectedOptionItems([])
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
  const relatedProducts = adminProducts
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
          <div className="relative bg-neutral-50 rounded-lg overflow-hidden mb-3 group">
            {/* 메인 이미지 */}
            <div className="aspect-square">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain cursor-zoom-in"
                onClick={() => {
                  setIsLightboxOpen(true)
                  setZoomLevel(1)
                }}
              />
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge variant={stockConfig.variant}>{stockConfig.label}</Badge>
              {discountPercent > 0 && tier !== 'guest' && (
                <Badge variant="error">{discountPercent}% OFF</Badge>
              )}
            </div>

            {/* 확대 아이콘 */}
            <button
              onClick={() => {
                setIsLightboxOpen(true)
                setZoomLevel(1)
              }}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ZoomIn className="w-4 h-4 text-neutral-700" />
            </button>
          </div>

          {/* Thumbnails - 참고 이미지 스타일 */}
          {product.images.length > 1 && (
            <div className="flex justify-center gap-2 py-2">
              {product.images.slice(0, 6).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  onMouseEnter={() => setCurrentImageIndex(idx)}
                  className={cn(
                    'flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden transition-all duration-150',
                    idx === currentImageIndex
                      ? 'ring-2 ring-neutral-900'
                      : 'ring-1 ring-neutral-200 hover:ring-neutral-400'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {/* 더보기 표시 */}
              {product.images.length > 6 && (
                <button
                  onClick={() => {
                    setCurrentImageIndex(6)
                    setIsLightboxOpen(true)
                    setZoomLevel(1)
                  }}
                  className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden ring-1 ring-neutral-200 hover:ring-neutral-400 relative"
                >
                  <img src={product.images[6]} alt="" className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-white text-sm font-medium">+{product.images.length - 6}</span>
                  </div>
                </button>
              )}
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

          {/* Price Section - 폐쇄몰: 비로그인 시 가격 숨김 */}
          <div className="bg-neutral-50 rounded-lg p-6 mb-6">
            {isLoggedIn ? (
              <>
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
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <Lock className="w-10 h-10 text-neutral-400 mb-3" />
                <p className="text-neutral-600 font-medium mb-1">회원 전용 가격</p>
                <p className="text-sm text-neutral-500 mb-4">로그인 후 회원 특별가를 확인하세요</p>
                <Button onClick={() => navigate('/login')} size="sm">
                  로그인하여 가격 확인
                </Button>
              </div>
            )}
          </div>

          {/* 옵션 선택 (쿠팡 스타일) - 로그인 회원만 표시 */}
          {isLoggedIn && (
          <div className="mb-6 space-y-4">
            {/* 상품 옵션들 */}
            {productOptions.map((option) => {
              const adminOption = adminOptionsMap.find(ao => ao.id === option.id)
              const hasImages = productSettings.showOptionImages && adminOption?.values.some(v => v.image)

              return (
                <div key={option.id}>
                  <p className="text-sm font-medium text-neutral-700 mb-2">
                    {option.name}: <span className="text-neutral-500">{selectedOptions[option.id] || '선택하세요'}</span>
                  </p>

                  {/* 이미지 옵션 UI */}
                  {hasImages ? (
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const optionValue = adminOption?.values.find(v => v.value === value)
                        const isSelected = selectedOptions[option.id] === value

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => toggleOption(option.id, value)}
                            className={cn(
                              'relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                              isSelected
                                ? 'border-primary-600 ring-2 ring-primary-200'
                                : 'border-neutral-200 hover:border-neutral-400'
                            )}
                            title={`${value}${isSelected ? ' (클릭하여 선택 해제)' : ''}`}
                          >
                            {optionValue?.image ? (
                              <img src={optionValue.image} alt={value} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-500">
                                {value.substring(0, 2)}
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary-600/10 flex items-center justify-center">
                                <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    /* 기본 드롭다운 UI */
                    <div className="relative border border-neutral-200 rounded-lg">
                      <select
                        value={selectedOptions[option.id] || ''}
                        onChange={(e) => setSelectedOptions(prev => ({ ...prev, [option.id]: e.target.value }))}
                        className="w-full px-4 py-3 text-sm text-neutral-900 bg-transparent border-none focus:outline-none cursor-pointer appearance-none pr-10"
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
                  )}
                </div>
              )
            })}

            {/* 수량별 할인 선택 (쿠팡 스타일) */}
            {productSettings.quantityDiscounts.length > 0 && (
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
                  <p className="text-sm font-medium text-neutral-700">구매 수량 선택</p>
                </div>
                <div className="divide-y divide-neutral-100">
                  {productSettings.quantityDiscounts.map((discount: QuantityDiscount) => {
                    const discountedPrice = Math.round(currentPrice * (1 - discount.discountPercent / 100))
                    const totalPrice = discountedPrice * discount.quantity
                    const isSelected = selectedQuantityDiscount?.id === discount.id

                    return (
                      <label
                        key={discount.id}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                          isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50'
                        )}
                      >
                        <input
                          type="radio"
                          name="quantityDiscount"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedQuantityDiscount(discount)
                            setQuantity(discount.quantity)
                          }}
                          className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">{discount.quantity}개</span>
                            {discount.label && (
                              <Badge variant="success" size="sm">{discount.label}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            개당 {formatPrice(discountedPrice)}
                            {discount.discountPercent > 0 && (
                              <span className="text-red-500 ml-1">({discount.discountPercent}% 할인)</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-neutral-900">{formatPrice(totalPrice)}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

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

            {/* 옵션 선택 완료 버튼 및 재고 표시 (옵션이 있는 상품만) */}
            {productOptions.length > 0 && (
              <div className="space-y-3">
                {/* 현재 선택된 옵션 재고 표시 */}
                {hasAnyOptionSelected && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">선택 옵션 재고</span>
                    <span className={cn(
                      'font-medium',
                      currentOptionStock <= 0 ? 'text-red-500' : currentOptionStock <= 5 ? 'text-amber-500' : 'text-green-500'
                    )}>
                      {currentOptionStock <= 0 ? '품절' : `${currentOptionStock}개`}
                    </span>
                  </div>
                )}

                {/* 옵션 선택 완료 버튼 */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={addSelectedOptionToList}
                  disabled={!hasAnyOptionSelected || currentOptionStock <= 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {!hasAnyOptionSelected ? '옵션을 선택해주세요' : currentOptionStock <= 0 ? '품절된 옵션입니다' : '옵션 선택 완료'}
                </Button>
              </div>
            )}

            {/* 선택된 옵션 리스트 */}
            {selectedOptionItems.length > 0 && (
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
                  <p className="text-sm font-medium text-neutral-700">선택한 옵션</p>
                </div>
                <div className="divide-y divide-neutral-100">
                  {selectedOptionItems.map((item) => {
                    const itemPrice = currentPrice + item.priceModifier
                    const itemTotal = itemPrice * item.quantity

                    return (
                      <div key={item.id} className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-neutral-700 truncate">
                              {Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(', ')}
                            </p>
                            {item.priceModifier !== 0 && (
                              <p className="text-xs text-neutral-500">
                                추가금액: {item.priceModifier > 0 ? '+' : ''}{formatPrice(item.priceModifier)}
                              </p>
                            )}
                            <p className="text-xs text-neutral-400">재고: {item.stock}개</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOptionItem(item.id)}
                            className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                            title="삭제"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateOptionItemQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 rounded border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateOptionItemQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-12 h-7 text-center text-sm border border-neutral-200 rounded"
                              min={1}
                              max={item.stock}
                            />
                            <button
                              type="button"
                              onClick={() => updateOptionItemQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="w-7 h-7 rounded border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-neutral-900">{formatPrice(itemTotal)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* 총 금액 */}
                <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">
                      총 {selectedOptionsTotalQuantity}개
                    </span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(selectedOptionsTotalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Stock & Quantity - 옵션이 없는 상품만, 로그인 회원만 표시 */}
          {isLoggedIn && productOptions.length === 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-neutral-600">재고 상태</span>
              <span className={cn('font-medium', stockConfig.color)}>
                {product.stockStatus !== 'out_of_stock' && `${product.stock}개 `}
                {stockConfig.label}
              </span>
            </div>

            {/* 구매수량 제한 안내 */}
            {product.maxQuantity && product.maxQuantity > 0 && (
              <p className="text-sm text-amber-600 mb-3 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                1인당 최대 <span className="font-semibold">{product.maxQuantity}개</span>까지 구매 가능
              </p>
            )}

            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">주문 수량</span>
              <NumberStepper
                value={quantity}
                onChange={setQuantity}
                min={product.minQuantity || 1}
                max={product.maxQuantity && product.maxQuantity > 0
                  ? Math.min(product.maxQuantity, product.stock)
                  : product.stock}
                disabled={product.stockStatus === 'out_of_stock'}
              />
              <span className="text-sm text-neutral-500">
                = <span className="font-bold text-primary-600">{formatPrice((currentPrice + optionPriceModifier) * quantity)}</span>
              </span>
            </div>
          </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-6">
          {isLoggedIn ? (
            <>
            <Button
              size="lg"
              onClick={() => {
                // 옵션이 있는 상품인 경우
                if (productOptions.length > 0) {
                  if (selectedOptionItems.length === 0) {
                    alert('옵션을 선택해주세요.')
                    return
                  }
                  // 선택된 옵션들을 각각 장바구니에 추가
                  selectedOptionItems.forEach(item => {
                    addToCart(product, item.quantity, item.options)
                  })
                  setSelectedOptionItems([]) // 선택 초기화
                  navigate('/cart')
                } else {
                  // 옵션이 없는 상품
                  if (quantity <= 0) {
                    alert('수량을 선택해주세요.')
                    return
                  }
                  addToCart(product, quantity, undefined)
                  navigate('/cart')
                }
              }}
              disabled={product.stockStatus === 'out_of_stock' || (productOptions.length > 0 && selectedOptionItems.length === 0)}
              className="flex-1"
            >
              <Zap className="w-5 h-5 mr-2" />
              바로 구매
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                // 옵션이 있는 상품인 경우
                if (productOptions.length > 0) {
                  if (selectedOptionItems.length === 0) {
                    alert('옵션을 선택해주세요.')
                    return
                  }
                  // 선택된 옵션들을 각각 장바구니에 추가
                  selectedOptionItems.forEach(item => {
                    addToCart(product, item.quantity, item.options)
                  })
                  setSelectedOptionItems([]) // 선택 초기화
                } else {
                  // 옵션이 없는 상품
                  if (quantity <= 0) {
                    alert('수량을 선택해주세요.')
                    return
                  }
                  addToCart(product, quantity, undefined)
                }
                setShowAddedToast(true)
                setTimeout(() => setShowAddedToast(false), 2000)
              }}
              disabled={product.stockStatus === 'out_of_stock' || (productOptions.length > 0 && selectedOptionItems.length === 0)}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              장바구니 담기
            </Button>
            </>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="flex-1"
            >
              <Lock className="w-5 h-5 mr-2" />
              로그인하고 구매하기
            </Button>
          )}
          </div>

          {/* 장바구니 추가 알림 */}
          {showAddedToast && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
              장바구니에 상품이 담겼습니다.
            </div>
          )}


        </Animated>
      </div>

      {/* 상품 상세 설명 & 이미지 */}
      {(productSettings.description || productSettings.detailImages.length > 0) && (
        <Animated animation="fade-up" delay={250}>
          <section className="mb-12">
            {productSettings.description && (
              <div
                className="prose prose-sm max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: productSettings.description }}
              />
            )}
            {productSettings.detailImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.name} 상세 이미지 ${index + 1}`}
                className="w-full mb-4 rounded-lg"
              />
            ))}
          </section>
        </Animated>
      )}

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

      {/* Image Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* 줌 컨트롤 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setZoomLevel(prev => Math.max(0.5, prev - 0.25))
              }}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <span className="text-white text-sm min-w-[60px] text-center">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setZoomLevel(prev => Math.min(3, prev + 0.25))
              }}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* 이미지 */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="max-w-none transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              draggable={false}
            />
          </div>

          {/* 이전/다음 버튼 */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
                  setZoomLevel(1)
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
                  setZoomLevel(1)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* 하단 썸네일 */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/50 rounded-full">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex(idx)
                    setZoomLevel(1)
                  }}
                  className={cn(
                    'w-12 h-12 rounded-lg overflow-hidden border-2 transition-all',
                    idx === currentImageIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* 이미지 카운터 */}
          {product.images.length > 1 && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-white/10 text-white text-sm rounded-full">
              {currentImageIndex + 1} / {product.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
