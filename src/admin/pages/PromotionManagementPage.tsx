import { useState, useRef } from 'react'
import { Search, Edit, Trash2, Plus, X, Upload, Image as ImageIcon, Package, Check } from 'lucide-react'
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion, useTogglePromotionActive, useProducts } from '../../hooks/queries'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import { AdminPromotion } from '../types/admin'
import { UserTier, Product } from '../../types'
import { uploadImage } from '../../services/storage'
import { cn } from '../../lib/utils'

const typeLabels = {
  all: '전체',
  timesale: '타임특가',
  exclusive: '전용',
}

const tierLabels: Record<UserTier, string> = {
  guest: '비회원',
  member: '일반회원',
  premium: '우수회원',
  vip: 'VIP회원',
}

export function PromotionManagementPage() {
  const { data: promotions = [], isLoading } = usePromotions()
  const { data: products = [] } = useProducts()
  const createMutation = useCreatePromotion()
  const updateMutation = useUpdatePromotion()
  const deleteMutation = useDeletePromotion()
  const toggleMutation = useTogglePromotionActive()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [editingPromo, setEditingPromo] = useState<AdminPromotion | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState('')

  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promo.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || promo.type === typeFilter
    const matchesActive = activeFilter === 'all' ||
                         (activeFilter === 'active' && promo.isActive) ||
                         (activeFilter === 'inactive' && !promo.isActive)
    return matchesSearch && matchesType && matchesActive
  })

  const handleDelete = (promoId: string) => {
    if (confirm('프로모션을 삭제하시겠습니까?')) {
      deleteMutation.mutate(promoId)
    }
  }

  const handleEdit = (promo: AdminPromotion) => {
    setEditingPromo({ ...promo })
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    const newPromo: AdminPromotion = {
      id: `promo-${Date.now()}`,
      title: '',
      description: '',
      image: '',
      discount: 10,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      targetTiers: ['guest', 'member', 'premium', 'vip'],
      type: 'all',
      isActive: false,
      productIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setEditingPromo(newPromo)
    setIsModalOpen(true)
  }

  // 상품 선택/해제 토글
  const toggleProductSelection = (productId: string) => {
    if (!editingPromo) return
    const currentIds = editingPromo.productIds || []
    const newIds = currentIds.includes(productId)
      ? currentIds.filter(id => id !== productId)
      : [...currentIds, productId]
    setEditingPromo({ ...editingPromo, productIds: newIds })
  }

  // 상품 검색 필터링
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(productSearchTerm.toLowerCase())
  )

  const handleSave = () => {
    if (!editingPromo) return

    if (!editingPromo.title.trim()) {
      alert('프로모션 제목을 입력해주세요.')
      return
    }

    const existingPromo = promotions.find(p => p.id === editingPromo.id)
    if (existingPromo) {
      updateMutation.mutate({ id: editingPromo.id, updates: editingPromo })
    } else {
      createMutation.mutate(editingPromo)
    }
    setIsModalOpen(false)
    setEditingPromo(null)
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = async (file: File) => {
    if (!editingPromo) return
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    setIsUploading(true)
    try {
      const url = await uploadImage('promotions', file)
      setEditingPromo({ ...editingPromo, image: url })
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-neutral-900">프로모션 관리</h1>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-3"><div className="h-16 bg-neutral-100 animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-neutral-900">프로모션 관리</h1>
          <span className="text-sm text-neutral-500">{filteredPromotions.length}개</span>
        </div>
        <Button size="sm" onClick={handleAddNew}><Plus className="w-4 h-4 mr-1" />등록</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2 py-2 text-sm border border-neutral-200 rounded-lg"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2 py-2 text-sm border border-neutral-200 rounded-lg"
        >
          <option value="all">유형</option>
          <option value="all">전체</option>
          <option value="timesale">타임특가</option>
          <option value="exclusive">전용</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-2 py-2 text-sm border border-neutral-200 rounded-lg"
        >
          <option value="all">상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
      </div>

      {/* Promotions List */}
      {isLoading && (
        <div className="text-center py-12 text-neutral-500">로딩 중...</div>
      )}
      <div className="space-y-2">
        {filteredPromotions.map((promo) => (
          <Card key={promo.id}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900 truncate">{promo.title}</span>
                    <Badge variant={promo.type === 'timesale' ? 'warning' : promo.type === 'exclusive' ? 'primary' : 'secondary'} size="sm">
                      {typeLabels[promo.type]}
                    </Badge>
                    {(promo.productIds?.length || 0) > 0 && (
                      <Badge variant="default" size="sm" className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {promo.productIds?.length}개 상품
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                    <span>{promo.discount}% 할인</span>
                    <span>·</span>
                    <span>{formatDate(promo.startDate)} ~ {formatDate(promo.endDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleMutation.mutate({ id: promo.id, currentActive: promo.isActive })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      promo.isActive ? 'bg-primary-600' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                        promo.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <Button variant="ghost" size="sm" className="p-1.5" onClick={() => handleEdit(promo)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 text-error" onClick={() => handleDelete(promo.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="text-center py-12 text-neutral-500">프로모션이 없습니다.</div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingPromo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">
                {promotions.find(p => p.id === editingPromo.id) ? '프로모션 수정' : '프로모션 등록'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">제목</label>
                <input
                  type="text"
                  value={editingPromo.title}
                  onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  placeholder="프로모션 제목"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">설명</label>
                <textarea
                  value={editingPromo.description}
                  onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg resize-none"
                  rows={2}
                  placeholder="프로모션 설명"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">이미지</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {editingPromo.image ? (
                  <div className="relative">
                    <img
                      src={editingPromo.image}
                      alt="프로모션 이미지"
                      className="w-full h-40 object-cover rounded-lg border border-neutral-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        변경
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingPromo({ ...editingPromo, image: '' })}
                      >
                        <X className="w-4 h-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-sm text-neutral-500">업로드 중...</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-neutral-400 mb-2" />
                        <p className="text-sm text-neutral-600 font-medium">클릭하거나 이미지를 드래그하세요</p>
                        <p className="text-xs text-neutral-400 mt-1">PNG, JPG, GIF (최대 5MB)</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">할인율 (%)</label>
                  <input
                    type="number"
                    value={editingPromo.discount}
                    onChange={(e) => setEditingPromo({ ...editingPromo, discount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">유형</label>
                  <select
                    value={editingPromo.type}
                    onChange={(e) => setEditingPromo({ ...editingPromo, type: e.target.value as 'all' | 'timesale' | 'exclusive' })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  >
                    <option value="all">전체</option>
                    <option value="timesale">타임특가</option>
                    <option value="exclusive">전용</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">시작일</label>
                  <input
                    type="date"
                    value={new Date(editingPromo.startDate).toISOString().split('T')[0]}
                    onChange={(e) => setEditingPromo({ ...editingPromo, startDate: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">종료일</label>
                  <input
                    type="date"
                    value={new Date(editingPromo.endDate).toISOString().split('T')[0]}
                    onChange={(e) => setEditingPromo({ ...editingPromo, endDate: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">대상 등급</label>
                <div className="flex flex-wrap gap-2">
                  {(['guest', 'member', 'premium', 'vip'] as UserTier[]).map((tier) => (
                    <label key={tier} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPromo.targetTiers.includes(tier)}
                        onChange={(e) => {
                          const newTiers = e.target.checked
                            ? [...editingPromo.targetTiers, tier]
                            : editingPromo.targetTiers.filter(t => t !== tier)
                          setEditingPromo({ ...editingPromo, targetTiers: newTiers })
                        }}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm">{tierLabels[tier]}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* 상품 선택 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">적용 상품</label>
                <div className="border border-neutral-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-600">
                      {(editingPromo.productIds?.length || 0) > 0
                        ? `${editingPromo.productIds?.length}개 상품 선택됨`
                        : '선택된 상품 없음'}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setProductSearchTerm('')
                        setIsProductSelectOpen(true)
                      }}
                    >
                      <Package className="w-4 h-4 mr-1" />
                      상품 선택
                    </Button>
                  </div>
                  {(editingPromo.productIds?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {editingPromo.productIds?.map(productId => {
                        const product = products.find(p => p.id === productId)
                        return product ? (
                          <span
                            key={productId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                          >
                            {product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name}
                            <button
                              type="button"
                              onClick={() => toggleProductSelection(productId)}
                              className="hover:text-primary-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingPromo.isActive}
                  onChange={(e) => setEditingPromo({ ...editingPromo, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">활성화</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>취소</Button>
              <Button onClick={handleSave}>저장</Button>
            </div>
          </div>
        </div>
      )}

      {/* 상품 선택 모달 */}
      {isProductSelectOpen && editingPromo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">상품 선택</h3>
              <button onClick={() => setIsProductSelectOpen(false)} className="p-1 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="상품명 또는 SKU로 검색"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-neutral-500">
                <span>{editingPromo.productIds?.length || 0}개 선택됨</span>
                {(editingPromo.productIds?.length || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setEditingPromo({ ...editingPromo, productIds: [] })}
                    className="text-red-500 hover:text-red-600"
                  >
                    전체 해제
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">상품이 없습니다.</div>
              ) : (
                <div className="space-y-1">
                  {filteredProducts.map(product => {
                    const isSelected = editingPromo.productIds?.includes(product.id)
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleProductSelection(product.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                          isSelected
                            ? 'bg-primary-50 border-2 border-primary-500'
                            : 'hover:bg-neutral-50 border-2 border-transparent'
                        )}
                      >
                        <div className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                          isSelected
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'border-neutral-300'
                        )}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-neutral-100 flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-neutral-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">{product.name}</p>
                          <p className="text-xs text-neutral-500">SKU: {product.sku || '-'}</p>
                        </div>
                        <span className="text-sm font-medium text-neutral-700 flex-shrink-0">
                          {product.prices?.retail?.toLocaleString()}원
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t">
              <Button variant="ghost" onClick={() => setIsProductSelectOpen(false)}>닫기</Button>
              <Button onClick={() => setIsProductSelectOpen(false)}>
                {editingPromo.productIds?.length || 0}개 상품 선택 완료
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
