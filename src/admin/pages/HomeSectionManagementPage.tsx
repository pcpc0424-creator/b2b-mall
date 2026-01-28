import { useState, useMemo } from 'react'
import { Search, Plus, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react'
import {
  useProducts,
  useHomeSections,
  useAddHomeSection,
  useRemoveHomeSection,
  useReorderHomeSections,
} from '../../hooks/queries'
import { Button, Card, CardContent } from '../../components/ui'
import { cn } from '../../lib/utils'
import type { HomeSectionType } from '../types/admin'

const TABS: { key: HomeSectionType; label: string }[] = [
  { key: 'best', label: '베스트연구실' },
  { key: 'new', label: '신상품연구실' },
  { key: 'sale', label: '초특가연구실' },
]

const MAX_ITEMS = 10

export function HomeSectionManagementPage() {
  const { data: products = [] } = useProducts()
  const { data: sections = [], isLoading } = useHomeSections()
  const addMutation = useAddHomeSection()
  const removeMutation = useRemoveHomeSection()
  const reorderMutation = useReorderHomeSections()

  const [activeTab, setActiveTab] = useState<HomeSectionType>('best')
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2000)
  }

  // 현재 탭의 섹션 아이템 (순서 정렬)
  const currentItems = useMemo(
    () => sections
      .filter((s) => s.sectionType === activeTab)
      .sort((a, b) => a.displayOrder - b.displayOrder),
    [sections, activeTab]
  )

  // 현재 섹션에 등록된 product ID 세트
  const registeredIds = useMemo(
    () => new Set(currentItems.map((s) => s.productId)),
    [currentItems]
  )

  // 모달에서 보여줄 상품 목록 (이미 등록된 상품 제외)
  const availableProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          !registeredIds.has(p.id) &&
          (searchTerm === '' ||
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [products, registeredIds, searchTerm]
  )

  // 상품 추가
  const handleAdd = (productId: string) => {
    if (currentItems.length >= MAX_ITEMS) {
      showToast(`섹션당 최대 ${MAX_ITEMS}개까지 등록 가능합니다.`)
      return
    }
    const nextOrder = currentItems.length > 0
      ? Math.max(...currentItems.map((i) => i.displayOrder)) + 1
      : 0
    addMutation.mutate(
      { sectionType: activeTab, productId, displayOrder: nextOrder },
      {
        onSuccess: () => showToast('상품이 추가되었습니다.'),
        onError: () => showToast('상품 추가에 실패했습니다.'),
      }
    )
    setShowModal(false)
    setSearchTerm('')
  }

  // 상품 제거
  const handleRemove = (id: string) => {
    if (!confirm('이 상품을 섹션에서 제거하시겠습니까?')) return
    removeMutation.mutate(id, {
      onSuccess: () => showToast('상품이 제거되었습니다.'),
      onError: () => showToast('상품 제거에 실패했습니다.'),
    })
  }

  // 순서 이동
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= currentItems.length) return

    const updated = currentItems.map((item, i) => {
      if (i === index) return { id: item.id, displayOrder: currentItems[swapIndex].displayOrder }
      if (i === swapIndex) return { id: item.id, displayOrder: currentItems[index].displayOrder }
      return { id: item.id, displayOrder: item.displayOrder }
    })
    reorderMutation.mutate(updated)
  }

  // 상품 ID로 상품 정보 찾기
  const getProduct = (productId: string) => products.find((p) => p.id === productId)

  return (
    <div className="space-y-4">
      {/* 토스트 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-fade-in text-sm font-medium">
          {toastMessage}
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">홈 섹션 관리</h1>
        <Button
          size="sm"
          onClick={() => { setShowModal(true); setSearchTerm('') }}
          disabled={currentItems.length >= MAX_ITEMS}
        >
          <Plus className="w-4 h-4 mr-1" />상품 추가
        </Button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
        {TABS.map((tab) => {
          const count = sections.filter((s) => s.sectionType === tab.key).length
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.key
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              )}
            >
              {tab.label} ({count})
            </button>
          )
        })}
      </div>

      {/* 상품 목록 */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-neutral-400 text-sm">로딩 중...</div>
          ) : currentItems.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-sm">
              등록된 상품이 없습니다. "상품 추가" 버튼으로 상품을 등록하세요.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="py-2 px-3 text-left text-neutral-500 font-medium w-12">#</th>
                  <th className="py-2 px-3 text-left text-neutral-500 font-medium w-16">이미지</th>
                  <th className="py-2 px-3 text-left text-neutral-500 font-medium">상품명</th>
                  <th className="py-2 px-3 text-left text-neutral-500 font-medium w-28">SKU</th>
                  <th className="py-2 px-3 text-center text-neutral-500 font-medium w-24">순서</th>
                  <th className="py-2 px-3 text-center text-neutral-500 font-medium w-16">삭제</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => {
                  const product = getProduct(item.productId)
                  return (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-neutral-50">
                      <td className="py-2 px-3 text-neutral-500">{index + 1}</td>
                      <td className="py-2 px-3">
                        {product?.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 object-contain rounded border bg-white"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-neutral-100 rounded border flex items-center justify-center text-[10px] text-neutral-400">
                            없음
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <p className="font-medium text-neutral-900 truncate max-w-xs">
                          {product?.name || '(삭제된 상품)'}
                        </p>
                        <p className="text-[10px] text-neutral-400">{product?.brand}</p>
                      </td>
                      <td className="py-2 px-3 text-neutral-600 font-mono text-xs">
                        {product?.sku || '-'}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleMove(index, 'up')}
                            disabled={index === 0}
                            className={cn(
                              'p-1 rounded hover:bg-neutral-200 transition-colors',
                              index === 0 && 'opacity-30 cursor-not-allowed'
                            )}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMove(index, 'down')}
                            disabled={index === currentItems.length - 1}
                            className={cn(
                              'p-1 rounded hover:bg-neutral-200 transition-colors',
                              index === currentItems.length - 1 && 'opacity-30 cursor-not-allowed'
                            )}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-neutral-400">
        * 각 섹션에 최대 {MAX_ITEMS}개의 상품을 등록할 수 있습니다. 등록된 상품은 홈페이지 해당 섹션에 순서대로 표시됩니다.
      </p>

      {/* 상품 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-base font-bold text-neutral-900">상품 추가</h2>
              <button
                onClick={() => { setShowModal(false); setSearchTerm('') }}
                className="p-1 rounded hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* 검색 */}
            <div className="px-5 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="상품명 또는 SKU로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* 상품 목록 */}
            <div className="flex-1 overflow-y-auto">
              {availableProducts.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-sm">
                  {searchTerm ? '검색 결과가 없습니다.' : '추가 가능한 상품이 없습니다.'}
                </div>
              ) : (
                <div className="divide-y">
                  {availableProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleAdd(product.id)}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-neutral-50 transition-colors"
                    >
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 object-contain rounded border bg-white flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-neutral-100 rounded border flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-900 truncate">{product.name}</p>
                        <p className="text-xs text-neutral-400">{product.sku} · {product.brand}</p>
                      </div>
                      <Plus className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
