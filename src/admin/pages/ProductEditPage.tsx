import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Plus, X, GripVertical, Trash2, Upload, Image as ImageIcon, Bold, Italic, List, Link as LinkIcon, AlignLeft, AlignCenter } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct, useCategories } from '../../hooks/queries'
import { uploadBase64Image } from '../../services/storage'
import { Button, Card, CardContent, Input, Badge } from '../../components/ui'
import { formatPrice, cn } from '../../lib/utils'
import { ProductOptionAdmin, OptionValue, ProductVariant, ProductShipping, QuantityDiscount } from '../types/admin'

export function ProductEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: products = [] } = useProducts()
  const { data: categories = [] } = useCategories()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const isNew = !id || id === 'new'

  // 기본 상품 정보
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: '',
    categoryId: 1,
    subcategory: '',
    retailPrice: 0,
    memberPrice: 0,
    premiumPrice: 0,
    vipPrice: 0,
    stock: 0,
    minQuantity: 1,
    maxQuantity: 0,  // 0이면 제한 없음
    isActive: true,
  })

  // 배송비 설정
  const [shipping, setShipping] = useState<ProductShipping>({
    type: 'paid',
    fee: 3000,
    freeCondition: 50000,
    bundleShipping: true,
  })

  // 옵션 상태
  const [options, setOptions] = useState<ProductOptionAdmin[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])

  // 이미지 상태
  const [images, setImages] = useState<string[]>([])
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 상세 설명
  const [description, setDescription] = useState('')
  const [detailImages, setDetailImages] = useState<string[]>([])
  const detailFileInputRef = useRef<HTMLInputElement>(null)

  // 옵션 이미지 표시 여부
  const [showOptionImages, setShowOptionImages] = useState(false)

  // 토스트 알림
  const [toastMessage, setToastMessage] = useState('')

  // 수량별 할인 설정
  const [quantityDiscounts, setQuantityDiscounts] = useState<QuantityDiscount[]>([])
  const [enableQuantityDiscount, setEnableQuantityDiscount] = useState(false)

  // 기존 상품 로드
  useEffect(() => {
    if (!isNew && id) {
      const adminProduct = products.find(p => p.id === id)
      const existingProduct = adminProduct

      if (existingProduct) {
        setFormData({
          name: existingProduct.name,
          sku: existingProduct.sku,
          brand: existingProduct.brand,
          categoryId: existingProduct.categoryId,
          subcategory: existingProduct.subcategory || '',
          retailPrice: existingProduct.prices.retail,
          memberPrice: existingProduct.prices.member,
          premiumPrice: existingProduct.prices.premium,
          vipPrice: existingProduct.prices.vip,
          stock: existingProduct.stock,
          minQuantity: existingProduct.minQuantity,
          maxQuantity: existingProduct.maxQuantity || 0,
          isActive: true,
        })

        // AdminProduct의 shipping 정보 로드
        if (adminProduct?.shipping) {
          setShipping(adminProduct.shipping)
        }

        // 옵션 로드 - adminOptions 우선, 없으면 기본 options 변환
        if (adminProduct?.adminOptions && adminProduct.adminOptions.length > 0) {
          setOptions(adminProduct.adminOptions)
        } else if (existingProduct.options && existingProduct.options.length > 0) {
          // 기본 options를 ProductOptionAdmin 형식으로 변환
          const convertedOptions: ProductOptionAdmin[] = existingProduct.options.map((opt, idx) => ({
            id: opt.id,
            name: opt.name,
            values: opt.values.map((val, vidx) => ({
              id: `val_${opt.id}_${vidx}`,
              value: val,
              priceModifier: 0,
              isDefault: vidx === 0,
            })),
            required: false, // 기본값: 선택 사항
            displayOrder: idx,
          }))
          setOptions(convertedOptions)
        }

        // 변형 로드
        if (adminProduct?.variants) {
          setVariants(adminProduct.variants)
        }

        // 이미지 로드
        if (existingProduct.images && existingProduct.images.length > 0) {
          setImages(existingProduct.images)
        }

        // 상세 설명 로드
        if (adminProduct?.description) {
          setDescription(adminProduct.description)
        }
        if (adminProduct?.detailImages) {
          setDetailImages(adminProduct.detailImages)
        }

        // 옵션 이미지 표시 여부 로드
        if (adminProduct?.showOptionImages !== undefined) {
          setShowOptionImages(adminProduct.showOptionImages)
        }

        // 수량별 할인 로드
        if (adminProduct?.quantityDiscounts && adminProduct.quantityDiscounts.length > 0) {
          setQuantityDiscounts(adminProduct.quantityDiscounts)
          setEnableQuantityDiscount(true)
        }
      }
    }
  }, [id, isNew, products])

  // 옵션 추가
  const handleAddOption = () => {
    const newOption: ProductOptionAdmin = {
      id: `opt_${Date.now()}`,
      name: '',
      values: [],
      required: false, // 기본값: 선택 사항 (하나만 선택해도 됨)
      displayOrder: options.length,
    }
    setOptions([...options, newOption])
  }

  // 옵션 삭제
  const handleRemoveOption = (optionId: string) => {
    setOptions(options.filter(opt => opt.id !== optionId))
    setVariants([]) // 옵션 변경 시 변형 초기화
  }

  // 옵션명 변경
  const handleOptionNameChange = (optionId: string, name: string) => {
    setOptions(options.map(opt =>
      opt.id === optionId ? { ...opt, name } : opt
    ))
  }

  // 옵션 필수 여부 변경
  const handleOptionRequiredChange = (optionId: string, required: boolean) => {
    setOptions(options.map(opt =>
      opt.id === optionId ? { ...opt, required } : opt
    ))
  }

  // 옵션값 추가
  const handleAddOptionValue = (optionId: string, value: string) => {
    const trimmedValue = value.trim()
    if (!trimmedValue) return

    setOptions(prev => {
      // 최신 state에서 중복 체크
      const targetOption = prev.find(opt => opt.id === optionId)
      if (targetOption?.values.some(v => v.value === trimmedValue)) {
        return prev // 이미 존재하는 값이면 변경 없음
      }

      const newValue: OptionValue = {
        id: `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        value: trimmedValue,
        priceModifier: 0,
        isDefault: false,
      }

      return prev.map(opt =>
        opt.id === optionId
          ? { ...opt, values: [...opt.values, newValue] }
          : opt
      )
    })
    setVariants([]) // 옵션 변경 시 변형 초기화
  }

  // 옵션값 삭제
  const handleRemoveOptionValue = (optionId: string, valueId: string) => {
    setOptions(options.map(opt =>
      opt.id === optionId
        ? { ...opt, values: opt.values.filter(v => v.id !== valueId) }
        : opt
    ))
    setVariants([])
  }

  // 옵션값 가격 변경
  const handlePriceModifierChange = (optionId: string, valueId: string, modifier: number) => {
    setOptions(options.map(opt =>
      opt.id === optionId
        ? {
            ...opt,
            values: opt.values.map(v =>
              v.id === valueId ? { ...v, priceModifier: modifier } : v
            )
          }
        : opt
    ))
  }

  // 옵션 조합 생성
  const generateVariants = () => {
    if (options.length === 0 || options.some(opt => opt.values.length === 0)) {
      alert('모든 옵션에 최소 1개 이상의 값을 입력해주세요.')
      return
    }

    const generateCombinations = (
      optionIndex: number,
      current: Record<string, OptionValue>
    ): Record<string, OptionValue>[] => {
      if (optionIndex >= options.length) {
        return [current]
      }

      const option = options[optionIndex]
      const combinations: Record<string, OptionValue>[] = []

      for (const value of option.values) {
        combinations.push(
          ...generateCombinations(optionIndex + 1, {
            ...current,
            [option.name]: value,
          })
        )
      }

      return combinations
    }

    const combinations = generateCombinations(0, {})

    const newVariants: ProductVariant[] = combinations.map((combo, index) => {
      const priceModifier = Object.values(combo).reduce(
        (sum, val) => sum + val.priceModifier,
        0
      )
      const skuSuffix = Object.values(combo)
        .map(v => v.value.substring(0, 2).toUpperCase())
        .join('-')

      return {
        id: `var_${index}`,
        sku: `${formData.sku || 'NEW'}-${skuSuffix}`,
        optionCombination: Object.fromEntries(
          Object.entries(combo).map(([k, v]) => [k, v.value])
        ),
        price: formData.retailPrice + priceModifier,
        stock: 0,
        isActive: true,
      }
    })

    setVariants(newVariants)
  }

  // 변형 재고 변경
  const handleVariantStockChange = (variantId: string, stock: number) => {
    setVariants(variants.map(v =>
      v.id === variantId ? { ...v, stock } : v
    ))
  }

  // 변형 활성화 토글
  const handleVariantActiveToggle = (variantId: string) => {
    setVariants(variants.map(v =>
      v.id === variantId ? { ...v, isActive: !v.isActive } : v
    ))
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = useCallback((files: FileList | null, isDetail: boolean = false) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (isDetail) {
          setDetailImages(prev => [...prev, result])
        } else {
          setImages(prev => [...prev, result])
        }
      }
      reader.readAsDataURL(file)
    })
  }, [])

  // 이미지 드래그 앤 드롭
  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingImage(true)
  }

  const handleImageDragLeave = () => {
    setIsDraggingImage(false)
  }

  const handleImageDrop = (e: React.DragEvent, isDetail: boolean = false) => {
    e.preventDefault()
    setIsDraggingImage(false)
    handleImageUpload(e.dataTransfer.files, isDetail)
  }

  // 이미지 삭제
  const handleRemoveImage = (index: number, isDetail: boolean = false) => {
    if (isDetail) {
      setDetailImages(prev => prev.filter((_, i) => i !== index))
    } else {
      setImages(prev => prev.filter((_, i) => i !== index))
    }
  }

  // 이미지 순서 변경
  const handleMoveImage = (index: number, direction: 'up' | 'down', isDetail: boolean = false) => {
    const targetImages = isDetail ? detailImages : images
    const setTargetImages = isDetail ? setDetailImages : setImages

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= targetImages.length) return

    const newImages = [...targetImages]
    const temp = newImages[index]
    newImages[index] = newImages[newIndex]
    newImages[newIndex] = temp
    setTargetImages(newImages)
  }

  // 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 필수 필드 검증
    if (!formData.name.trim()) {
      alert('상품명을 입력해주세요.')
      return
    }
    if (!formData.sku.trim()) {
      alert('SKU를 입력해주세요.')
      return
    }
    if (formData.retailPrice <= 0) {
      alert('정상가를 입력해주세요.')
      return
    }

    try {
      // base64 이미지를 Supabase Storage에 업로드
      const uploadedImages = (await Promise.all(
        images.map(img => uploadBase64Image('product-images', img))
      )).filter(url => url !== '')
      const uploadedDetailImages = (await Promise.all(
        detailImages.map(img => uploadBase64Image('product-images', img))
      )).filter(url => url !== '')

      // 옵션값 이미지 업로드
      const uploadedOptions = await Promise.all(
        options.map(async (opt) => ({
          ...opt,
          values: await Promise.all(
            opt.values.map(async (v) => ({
              ...v,
              image: v.image ? await uploadBase64Image('product-images', v.image) : v.image,
            }))
          ),
        }))
      )

      const productData = {
        id: isNew ? `p_${Date.now()}` : id!,
        sku: formData.sku,
        name: formData.name,
        brand: formData.brand,
        categoryId: formData.categoryId,
        subcategory: formData.subcategory || undefined,
        images: uploadedImages.length > 0 ? uploadedImages : ['https://picsum.photos/seed/new/400/400'],
        prices: {
          retail: formData.retailPrice,
          member: formData.memberPrice || formData.retailPrice,
          premium: formData.premiumPrice || formData.retailPrice,
          vip: formData.vipPrice || formData.retailPrice,
        },
        minQuantity: formData.minQuantity,
        maxQuantity: formData.maxQuantity > 0 ? formData.maxQuantity : undefined,
        stock: formData.stock,
        stockStatus: (formData.stock > 10 ? 'available' : formData.stock > 0 ? 'low' : 'out_of_stock') as 'available' | 'low' | 'out_of_stock',
        isActive: formData.isActive,
        adminOptions: uploadedOptions,
        variants: variants,
        shipping: shipping,
        description: description,
        detailImages: uploadedDetailImages,
        showOptionImages: showOptionImages,
        quantityDiscounts: enableQuantityDiscount ? quantityDiscounts : [],
        createdAt: isNew ? new Date() : new Date(),
        updatedAt: new Date(),
      }

      // React Query mutation으로 DB에 저장
      if (isNew) {
        await createMutation.mutateAsync(productData)
        setToastMessage('상품이 등록되었습니다.')
        setTimeout(() => navigate('/admin/products'), 1500)
      } else {
        await updateMutation.mutateAsync({ id: id!, updates: productData })
        setToastMessage('상품이 수정되었습니다.')
        setTimeout(() => navigate('/admin/products'), 1500)
      }
    } catch (err) {
      console.error('상품 저장 실패:', err)
      setToastMessage('상품 저장에 실패했습니다. 다시 시도해주세요.')
      setTimeout(() => setToastMessage(''), 3000)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 토스트 알림 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-fade-in text-sm font-medium">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')} className="p-2">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 truncate">
            {isNew ? '상품 등록' : '상품 수정'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 sm:mt-1 truncate">
            {isNew ? '새로운 상품을 등록합니다' : formData.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-3 sm:mb-4">기본 정보</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                  상품명 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                  브랜드
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                  카테고리 *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value), subcategory: '' })}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                  세부 카테고리
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">선택 안함</option>
                  {(categories.find(cat => cat.id === formData.categoryId)?.subcategories || []).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 상품 이미지 */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-3 sm:mb-4">상품 이미지</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mb-4">첫 번째 이미지가 대표 이미지로 사용됩니다. 드래그하여 순서를 변경할 수 있습니다.</p>

            {/* 이미지 업로드 영역 */}
            <div
              onDragOver={handleImageDragOver}
              onDragLeave={handleImageDragLeave}
              onDrop={(e) => handleImageDrop(e, false)}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
                isDraggingImage ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files, false)}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <p className="text-sm text-neutral-600 mb-1">클릭하여 이미지를 선택하거나</p>
              <p className="text-sm text-neutral-600">이미지를 이곳에 드래그 앤 드롭하세요</p>
              <p className="text-xs text-neutral-400 mt-2">PNG, JPG, GIF (최대 5MB)</p>
            </div>

            {/* 업로드된 이미지 목록 */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className={cn(
                      'aspect-square rounded-lg overflow-hidden border-2',
                      index === 0 ? 'border-primary-500' : 'border-neutral-200'
                    )}>
                      <img src={img} alt={`상품 이미지 ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {index === 0 && (
                      <span className="absolute top-1 left-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded">
                        대표
                      </span>
                    )}
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, 'up', false)}
                          className="p-1 bg-white rounded shadow hover:bg-neutral-100"
                          title="앞으로 이동"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index, false)}
                        className="p-1 bg-red-500 text-white rounded shadow hover:bg-red-600"
                        title="삭제"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 가격 정보 */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-3 sm:mb-4">가격 정보</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                  정상가 (비회원) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.retailPrice}
                  onChange={(e) => setFormData({ ...formData, retailPrice: parseInt(e.target.value) || 0 })}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                  일반회원가
                </label>
                <input
                  type="number"
                  value={formData.memberPrice}
                  onChange={(e) => setFormData({ ...formData, memberPrice: parseInt(e.target.value) || 0 })}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                  우수회원가
                </label>
                <input
                  type="number"
                  value={formData.premiumPrice}
                  onChange={(e) => setFormData({ ...formData, premiumPrice: parseInt(e.target.value) || 0 })}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                  VIP회원가
                </label>
                <input
                  type="number"
                  value={formData.vipPrice}
                  onChange={(e) => setFormData({ ...formData, vipPrice: parseInt(e.target.value) || 0 })}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 재고 정보 */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-3 sm:mb-4">재고 정보</h2>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                  재고 수량
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                  최소 구매수량
                </label>
                <input
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 1 })}
                  onFocus={(e) => e.target.select()}
                  min={1}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                  최대 구매수량 <span className="text-neutral-400 font-normal">(0 = 제한없음)</span>
                </label>
                <input
                  type="number"
                  value={formData.maxQuantity}
                  onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) || 0 })}
                  onFocus={(e) => e.target.select()}
                  min={0}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 배송비 설정 */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-3 sm:mb-4">배송비 설정</h2>

            <div className="space-y-4">
              {/* 배송비 타입 선택 */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShipping({ ...shipping, type: 'free' })}
                  className={cn(
                    'px-4 py-2 text-sm rounded-lg border transition-colors',
                    shipping.type === 'free'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                  )}
                >
                  무료배송
                </button>
                <button
                  type="button"
                  onClick={() => setShipping({ ...shipping, type: 'paid' })}
                  className={cn(
                    'px-4 py-2 text-sm rounded-lg border transition-colors',
                    shipping.type === 'paid'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                  )}
                >
                  유료배송
                </button>
                <button
                  type="button"
                  onClick={() => setShipping({ ...shipping, type: 'conditional' })}
                  className={cn(
                    'px-4 py-2 text-sm rounded-lg border transition-colors',
                    shipping.type === 'conditional'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                  )}
                >
                  조건부 무료
                </button>
              </div>

              {/* 유료배송일 때 배송비 입력 */}
              {shipping.type === 'paid' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-neutral-700">배송비</label>
                  <input
                    type="number"
                    value={shipping.fee || 0}
                    onChange={(e) => setShipping({ ...shipping, fee: parseInt(e.target.value) || 0 })}
                    onFocus={(e) => e.target.select()}
                    className="w-28 px-3 py-2 text-sm border border-neutral-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-500">원</span>
                </div>
              )}

              {/* 조건부 무료일 때 */}
              {shipping.type === 'conditional' && (
                <div className="space-y-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-700">기본 배송비</label>
                    <input
                      type="number"
                      value={shipping.fee || 0}
                      onChange={(e) => setShipping({ ...shipping, fee: parseInt(e.target.value) || 0 })}
                      onFocus={(e) => e.target.select()}
                      className="w-28 px-3 py-2 text-sm border border-neutral-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-500">원</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-700">무료배송 기준</label>
                    <input
                      type="number"
                      value={shipping.freeCondition || 0}
                      onChange={(e) => setShipping({ ...shipping, freeCondition: parseInt(e.target.value) || 0 })}
                      onFocus={(e) => e.target.select()}
                      className="w-28 px-3 py-2 text-sm border border-neutral-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-500">원 이상 무료</span>
                  </div>
                </div>
              )}

              {/* 묶음배송 설정 */}
              {shipping.type !== 'free' && (
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">묶음배송</p>
                    <p className="text-xs text-neutral-500 mt-0.5">같은 묶음배송 상품끼리 배송비 1건으로 합산</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShipping({ ...shipping, bundleShipping: true })}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        shipping.bundleShipping
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                      )}
                    >
                      가능
                    </button>
                    <button
                      type="button"
                      onClick={() => setShipping({ ...shipping, bundleShipping: false })}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        !shipping.bundleShipping
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                      )}
                    >
                      불가
                    </button>
                  </div>
                </div>
              )}

              {/* 미리보기 */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 {shipping.type === 'free' && '이 상품은 무료배송입니다.'}
                  {shipping.type === 'paid' && `배송비 ${formatPrice(shipping.fee || 0)}이 부과됩니다.`}
                  {shipping.type === 'conditional' && `${formatPrice(shipping.freeCondition || 0)} 이상 구매 시 무료배송, 미만 시 ${formatPrice(shipping.fee || 0)}`}
                  {shipping.type !== 'free' && shipping.bundleShipping && ' (묶음배송 가능)'}
                  {shipping.type !== 'free' && !shipping.bundleShipping && ' (묶음배송 불가)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 상품 상세 설명 */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-3 sm:mb-4">상품 상세 설명</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mb-4">상품 상세 페이지에 표시될 설명을 작성하세요.</p>

            {/* 간단한 툴바 */}
            <div className="flex flex-wrap gap-1 p-2 bg-neutral-50 border border-neutral-200 rounded-t-lg">
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement
                  const start = textarea.selectionStart
                  const end = textarea.selectionEnd
                  const selectedText = description.substring(start, end)
                  const newText = description.substring(0, start) + `<b>${selectedText}</b>` + description.substring(end)
                  setDescription(newText)
                }}
                className="p-2 hover:bg-neutral-200 rounded"
                title="굵게"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement
                  const start = textarea.selectionStart
                  const end = textarea.selectionEnd
                  const selectedText = description.substring(start, end)
                  const newText = description.substring(0, start) + `<i>${selectedText}</i>` + description.substring(end)
                  setDescription(newText)
                }}
                className="p-2 hover:bg-neutral-200 rounded"
                title="기울임"
              >
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-neutral-300 mx-1 self-center" />
              <button
                type="button"
                onClick={() => {
                  setDescription(prev => prev + '\n<ul>\n  <li>항목 1</li>\n  <li>항목 2</li>\n</ul>')
                }}
                className="p-2 hover:bg-neutral-200 rounded"
                title="목록"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDescription(prev => prev + '\n<p style="text-align: center;">가운데 정렬 텍스트</p>')
                }}
                className="p-2 hover:bg-neutral-200 rounded"
                title="가운데 정렬"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-neutral-300 mx-1 self-center" />
              <button
                type="button"
                onClick={() => detailFileInputRef.current?.click()}
                className="p-2 hover:bg-neutral-200 rounded"
                title="이미지 추가"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                ref={detailFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files, true)}
                className="hidden"
              />
            </div>

            {/* 설명 텍스트 영역 */}
            <textarea
              id="description-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상품에 대한 상세 설명을 입력하세요. HTML 태그를 사용할 수 있습니다.&#10;&#10;예시:&#10;<h3>상품 특징</h3>&#10;<p>프리미엄 품질의 상품입니다.</p>&#10;<ul>&#10;  <li>특징 1</li>&#10;  <li>특징 2</li>&#10;</ul>"
              rows={10}
              className="w-full px-4 py-3 border border-neutral-200 border-t-0 rounded-b-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            {/* 상세 이미지 업로드 */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">상세 페이지 이미지</h3>
              <p className="text-xs text-neutral-500 mb-3">상세 페이지에 순서대로 표시될 이미지를 업로드하세요.</p>

              <div
                onDragOver={handleImageDragOver}
                onDragLeave={handleImageDragLeave}
                onDrop={(e) => handleImageDrop(e, true)}
                className={cn(
                  'border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer',
                  isDraggingImage ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'
                )}
                onClick={() => detailFileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-600">상세 이미지 추가</p>
              </div>

              {/* 상세 이미지 목록 */}
              {detailImages.length > 0 && (
                <div className="mt-4 space-y-3">
                  {detailImages.map((img, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center text-xs font-medium text-neutral-600">
                        {index + 1}
                      </span>
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-neutral-200">
                        <img src={img} alt={`상세 이미지 ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-600 truncate">상세 이미지 {index + 1}</p>
                        <div className="flex gap-2 mt-2">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(index, 'up', true)}
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              ↑ 위로
                            </button>
                          )}
                          {index < detailImages.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(index, 'down', true)}
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              ↓ 아래로
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, true)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 미리보기 */}
            {(description || detailImages.length > 0) && (
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">미리보기</h3>
                <div className="p-4 bg-white border border-neutral-200 rounded-lg max-h-96 overflow-y-auto">
                  {description && (
                    <div
                      className="prose prose-sm max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  )}
                  {detailImages.map((img, index) => (
                    <img key={index} src={img} alt={`상세 이미지 ${index + 1}`} className="w-full mb-4 rounded" />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 상품 옵션 */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start sm:items-center justify-between gap-2 mb-3 sm:mb-4">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">상품 옵션</h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 sm:mt-1">
                  사이즈, 색상 등 옵션 설정
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="flex-shrink-0">
                <Plus className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">옵션 추가</span>
              </Button>
            </div>

            {/* 옵션 이미지 표시 설정 */}
            {options.length > 0 && (
              <div className="flex items-center justify-between p-3 mb-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">옵션 이미지 표시</p>
                  <p className="text-xs text-blue-700 mt-0.5">상세페이지에서 옵션을 이미지로 표시합니다</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOptionImages(!showOptionImages)}
                  className={cn(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                    showOptionImages ? 'bg-primary-600' : 'bg-neutral-200'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      showOptionImages ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            )}

            {/* 옵션 목록 */}
            <div className="space-y-3 sm:space-y-4">
              {options.map((option, index) => (
                <OptionItem
                  key={option.id}
                  option={option}
                  index={index}
                  showOptionImages={showOptionImages}
                  onNameChange={(name) => handleOptionNameChange(option.id, name)}
                  onRequiredChange={(required) => handleOptionRequiredChange(option.id, required)}
                  onShowImagesChange={(showImages) => {
                    setOptions(options.map(opt =>
                      opt.id === option.id ? { ...opt, showImages } : opt
                    ))
                  }}
                  onAddValue={(value) => handleAddOptionValue(option.id, value)}
                  onRemoveValue={(valueId) => handleRemoveOptionValue(option.id, valueId)}
                  onPriceModifierChange={(valueId, modifier) =>
                    handlePriceModifierChange(option.id, valueId, modifier)
                  }
                  onImageChange={(valueId, image) => {
                    setOptions(options.map(opt =>
                      opt.id === option.id
                        ? {
                            ...opt,
                            values: opt.values.map(v =>
                              v.id === valueId ? { ...v, image } : v
                            )
                          }
                        : opt
                    ))
                  }}
                  onRemove={() => handleRemoveOption(option.id)}
                />
              ))}
            </div>

            {options.length === 0 && (
              <div className="text-center py-6 sm:py-8 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200">
                <p className="text-neutral-500 text-sm">등록된 옵션이 없습니다</p>
                <Button type="button" variant="primary" size="sm" className="mt-3" onClick={handleAddOption}>
                  <Plus className="w-4 h-4 mr-1" />
                  첫 옵션 추가하기
                </Button>
              </div>
            )}

            {/* 옵션 조합 생성 버튼 */}
            {options.length > 0 && options.every(o => o.name && o.values.length > 0) && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">옵션 조합</p>
                    <p className="text-xs text-neutral-500">
                      총 {options.reduce((acc, opt) => acc * (opt.values.length || 1), 1)}개의 조합이 생성됩니다
                    </p>
                  </div>
                  <Button type="button" size="sm" onClick={generateVariants}>
                    조합 생성
                  </Button>
                </div>
              </div>
            )}

            {/* 생성된 변형 - Mobile Cards */}
            {variants.length > 0 && (
              <div className="mt-4">
                <div className="lg:hidden space-y-3">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={cn(
                        'bg-neutral-50 rounded-lg p-3',
                        !variant.isActive && 'opacity-50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={variant.isActive}
                            onChange={() => handleVariantActiveToggle(variant.id)}
                            className="w-4 h-4 rounded border-neutral-300"
                          />
                          <span className="font-mono text-xs text-neutral-600">{variant.sku}</span>
                        </div>
                        <span className="text-sm font-medium text-neutral-900">
                          {formatPrice(variant.price)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {Object.entries(variant.optionCombination).map(([key, val]) => (
                          <Badge key={key} variant="default" size="sm">
                            {key}: {val}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">재고</span>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleVariantStockChange(variant.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-sm border border-neutral-200 rounded text-center"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 생성된 변형 - Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50">
                        <th className="text-left px-4 py-3 font-medium text-neutral-600">활성</th>
                        <th className="text-left px-4 py-3 font-medium text-neutral-600">SKU</th>
                        <th className="text-left px-4 py-3 font-medium text-neutral-600">옵션</th>
                        <th className="text-right px-4 py-3 font-medium text-neutral-600">가격</th>
                        <th className="text-center px-4 py-3 font-medium text-neutral-600">재고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant) => (
                        <tr
                          key={variant.id}
                          className={cn(
                            'border-b border-neutral-100',
                            !variant.isActive && 'opacity-50'
                          )}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={variant.isActive}
                              onChange={() => handleVariantActiveToggle(variant.id)}
                              className="w-4 h-4 rounded border-neutral-300"
                            />
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-neutral-600">
                            {variant.sku}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(variant.optionCombination).map(([key, val]) => (
                                <Badge key={key} variant="default" size="sm">
                                  {key}: {val}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatPrice(variant.price)}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => handleVariantStockChange(variant.id, parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-neutral-200 rounded text-center"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 수량별 할인 설정 */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">수량별 할인 설정</h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  구매 수량에 따른 할인율을 설정합니다
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnableQuantityDiscount(!enableQuantityDiscount)}
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                  enableQuantityDiscount ? 'bg-primary-600' : 'bg-neutral-200'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    enableQuantityDiscount ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            {enableQuantityDiscount && (
              <div className="space-y-4">
                {/* 할인 항목 목록 */}
                <div className="space-y-3">
                  {quantityDiscounts.map((discount, idx) => (
                    <div key={discount.id} className="flex items-center gap-2 sm:gap-3 p-3 bg-neutral-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">수량</label>
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={discount.quantity}
                              onChange={(e) => {
                                const newDiscounts = [...quantityDiscounts]
                                newDiscounts[idx].quantity = parseInt(e.target.value) || 1
                                setQuantityDiscounts(newDiscounts)
                              }}
                              min="1"
                              className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded text-center"
                            />
                            <span className="text-sm text-neutral-500 ml-1">개</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">할인율</label>
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={discount.discountPercent}
                              onChange={(e) => {
                                const newDiscounts = [...quantityDiscounts]
                                newDiscounts[idx].discountPercent = parseInt(e.target.value) || 0
                                setQuantityDiscounts(newDiscounts)
                              }}
                              min="0"
                              max="100"
                              className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded text-center"
                            />
                            <span className="text-sm text-neutral-500 ml-1">%</span>
                          </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs text-neutral-500 mb-1">라벨 (선택)</label>
                          <input
                            type="text"
                            value={discount.label || ''}
                            onChange={(e) => {
                              const newDiscounts = [...quantityDiscounts]
                              newDiscounts[idx].label = e.target.value
                              setQuantityDiscounts(newDiscounts)
                            }}
                            placeholder="예: 최저가"
                            className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded"
                          />
                        </div>
                        <div className="hidden sm:flex items-end">
                          <p className="text-sm text-primary-600 font-medium">
                            개당 {formatPrice(Math.round(formData.retailPrice * (1 - discount.discountPercent / 100)))}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setQuantityDiscounts(quantityDiscounts.filter(d => d.id !== discount.id))
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 항목 추가 버튼 */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDiscount: QuantityDiscount = {
                      id: `qd_${Date.now()}`,
                      quantity: quantityDiscounts.length > 0
                        ? quantityDiscounts[quantityDiscounts.length - 1].quantity * 2
                        : 1,
                      discountPercent: 0,
                    }
                    setQuantityDiscounts([...quantityDiscounts, newDiscount])
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  수량 할인 추가
                </Button>

                {/* 미리보기 */}
                {quantityDiscounts.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">미리보기</p>
                    <div className="space-y-1">
                      {quantityDiscounts.map(d => (
                        <p key={d.id} className="text-sm text-blue-700">
                          {d.quantity}개 구매 시: {formatPrice(Math.round(formData.retailPrice * (1 - d.discountPercent / 100)))}
                          <span className="text-blue-500 ml-2">({d.discountPercent}% 할인)</span>
                          {d.label && <Badge variant="success" size="sm" className="ml-2">{d.label}</Badge>}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!enableQuantityDiscount && (
              <div className="text-center py-6 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200">
                <p className="text-neutral-500 text-sm">수량별 할인을 사용하려면 위 토글을 켜세요</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')} className="w-full sm:w-auto">
            취소
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending
              ? '저장 중...'
              : isNew ? '상품 등록' : '변경사항 저장'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// 옵션 아이템 컴포넌트
interface OptionItemProps {
  option: ProductOptionAdmin
  index: number
  showOptionImages: boolean
  onNameChange: (name: string) => void
  onRequiredChange: (required: boolean) => void
  onShowImagesChange: (showImages: boolean) => void
  onAddValue: (value: string) => void
  onRemoveValue: (valueId: string) => void
  onPriceModifierChange: (valueId: string, modifier: number) => void
  onImageChange: (valueId: string, image: string) => void
  onRemove: () => void
}

function OptionItem({
  option,
  index,
  showOptionImages,
  onNameChange,
  onRequiredChange,
  onShowImagesChange,
  onAddValue,
  onRemoveValue,
  onPriceModifierChange,
  onImageChange,
  onRemove,
}: OptionItemProps) {
  // 개별 옵션의 이미지 표시 여부 (옵션별 설정 우선, 없으면 글로벌 설정)
  const optionShowImages = option.showImages !== undefined ? option.showImages : showOptionImages
  const [newValue, setNewValue] = useState('')
  const lastAddTime = useRef(0)

  const handleAddValue = () => {
    // 300ms 이내 중복 호출 방지
    const now = Date.now()
    if (now - lastAddTime.current < 300) {
      return
    }
    lastAddTime.current = now

    const trimmed = newValue.trim()
    if (!trimmed) return

    onAddValue(trimmed)
    setNewValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleAddValue()
    }
  }

  return (
    <div className="border border-neutral-200 rounded-lg">
      {/* 옵션 헤더 */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-neutral-100 bg-neutral-50">
        <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300 cursor-grab flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium text-neutral-500 flex-shrink-0">옵션 {index + 1}</span>
        <input
          type="text"
          value={option.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="옵션명 (예: 사이즈)"
          className="flex-1 min-w-0 px-2 sm:px-3 py-1 sm:py-1.5 border border-neutral-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {/* 필수 체크박스 */}
        <label className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
          <input
            type="checkbox"
            checked={option.required}
            onChange={(e) => onRequiredChange(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-xs sm:text-sm text-neutral-600">필수</span>
        </label>
        {/* 이미지 표시 토글 */}
        <label className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
          <input
            type="checkbox"
            checked={optionShowImages}
            onChange={(e) => onShowImagesChange(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-xs sm:text-sm text-neutral-600 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            <span className="hidden sm:inline">이미지</span>
          </span>
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-neutral-400 hover:text-error flex-shrink-0 p-1.5"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* 옵션값 */}
      <div className="p-3 sm:p-4">
        <div className={cn(
          'gap-2 mb-3 sm:mb-4',
          optionShowImages ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'flex flex-wrap'
        )}>
          {option.values.map((value) => (
            <OptionValueTag
              key={value.id}
              value={value}
              showImage={optionShowImages}
              onRemove={() => onRemoveValue(value.id)}
              onPriceChange={(modifier) => onPriceModifierChange(value.id, modifier)}
              onImageChange={(image) => onImageChange(value.id, image)}
            />
          ))}
        </div>

        {/* 옵션값 추가 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="옵션값 입력 후 Enter"
            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-neutral-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddValue} className="flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// 옵션값 태그 컴포넌트
interface OptionValueTagProps {
  value: OptionValue
  showImage: boolean
  onRemove: () => void
  onPriceChange: (modifier: number) => void
  onImageChange: (image: string) => void
}

function OptionValueTag({ value, showImage, onRemove, onPriceChange, onImageChange }: OptionValueTagProps) {
  const [showPriceInput, setShowPriceInput] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      onImageChange(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 이미지 표시 모드
  if (showImage) {
    return (
      <div className="relative border border-neutral-200 rounded-lg p-2 bg-white">
        {/* 이미지 영역 */}
        <div
          onClick={() => imageInputRef.current?.click()}
          className="aspect-square mb-2 rounded-md overflow-hidden bg-neutral-100 cursor-pointer hover:bg-neutral-200 transition-colors flex items-center justify-center"
        >
          {value.image ? (
            <img src={value.image} alt={value.value} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-2">
              <ImageIcon className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
              <p className="text-xs text-neutral-500">이미지 추가</p>
            </div>
          )}
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* 옵션명 */}
        <p className="text-sm font-medium text-neutral-900 text-center truncate">{value.value}</p>

        {/* 가격 조정 */}
        {value.priceModifier !== 0 && (
          <p className={cn(
            'text-xs text-center mt-1',
            value.priceModifier > 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {value.priceModifier > 0 ? '+' : ''}{formatPrice(value.priceModifier)}
          </p>
        )}

        {/* 버튼 영역 */}
        <div className="flex justify-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => setShowPriceInput(!showPriceInput)}
            className="text-xs text-primary-600 hover:text-primary-800"
          >
            가격
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-500 hover:text-red-700"
          >
            삭제
          </button>
        </div>

        {showPriceInput && (
          <div className="mt-2">
            <input
              type="number"
              value={value.priceModifier}
              onChange={(e) => onPriceChange(parseInt(e.target.value) || 0)}
              onBlur={() => setShowPriceInput(false)}
              className="w-full text-xs px-2 py-1 border rounded text-center"
              placeholder="추가금액"
              autoFocus
            />
          </div>
        )}
      </div>
    )
  }

  // 기본 태그 모드
  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm bg-primary-50 text-primary-700 border border-primary-200">
      <span>{value.value}</span>

      {value.priceModifier !== 0 && (
        <span className={cn(
          'text-xs font-medium',
          value.priceModifier > 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {value.priceModifier > 0 ? '+' : ''}{formatPrice(value.priceModifier)}
        </span>
      )}

      {showPriceInput ? (
        <input
          type="number"
          value={value.priceModifier}
          onChange={(e) => onPriceChange(parseInt(e.target.value) || 0)}
          onBlur={() => setShowPriceInput(false)}
          className="w-16 sm:w-20 text-xs px-1 py-0.5 border rounded"
          autoFocus
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowPriceInput(true)}
          className="text-xs text-primary-500 hover:text-primary-700"
        >
          가격
        </button>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="text-primary-400 hover:text-error transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}
