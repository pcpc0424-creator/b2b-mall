import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { useAdminStore } from '../store/adminStore'
import { useProducts, useDeleteProduct, useCategories } from '../../hooks/queries'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import { formatPrice } from '../../lib/utils'

export function ProductManagementPage() {
  const { data: products = [], isLoading } = useProducts()
  const { data: categories = [] } = useCategories()
  const deleteMutation = useDeleteProduct()
  const { selectedProductIds, setSelectedProductIds } = useAdminStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [subcategoryFilter, setSubcategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState('')

  const selectedCategory = categoryFilter !== 'all' ? categories.find(cat => cat.id === parseInt(categoryFilter)) : null
  const subcategories = selectedCategory?.subcategories || []

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.categoryId === parseInt(categoryFilter)
    const matchesSubcategory = subcategoryFilter === 'all' || product.subcategory === subcategoryFilter
    const matchesStock = stockFilter === 'all' || product.stockStatus === stockFilter
    return matchesSearch && matchesCategory && matchesSubcategory && matchesStock
  })

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds([...selectedProductIds, productId])
    } else {
      setSelectedProductIds(selectedProductIds.filter(id => id !== productId))
    }
  }

  const handleDelete = (productId: string) => {
    if (confirm('삭제하시겠습니까?')) {
      deleteMutation.mutate(productId, {
        onSuccess: () => {
          setToastMessage('상품이 삭제되었습니다.')
          setTimeout(() => setToastMessage(''), 2000)
        },
        onError: () => {
          setToastMessage('상품 삭제에 실패했습니다.')
          setTimeout(() => setToastMessage(''), 3000)
        },
      })
    }
  }

  const stockStatusConfig = {
    available: { label: '충분', variant: 'success' as const },
    low: { label: '부족', variant: 'warning' as const },
    out_of_stock: { label: '품절', variant: 'error' as const },
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-neutral-900">상품 관리</h1>
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
      {/* 토스트 알림 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-fade-in text-sm font-medium">
          {toastMessage}
        </div>
      )}

      {/* Header - 한 줄 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-neutral-900">상품 관리</h1>
          <span className="text-sm text-neutral-500">{filteredProducts.length}개</span>
        </div>
        <Link to="/admin/products/new">
          <Button size="sm"><Plus className="w-4 h-4 mr-1" />등록</Button>
        </Link>
      </div>

      {/* Filters - 한 줄 */}
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
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setSubcategoryFilter('all') }}
          className="px-2 py-2 text-sm border border-neutral-200 rounded-lg"
        >
          <option value="all">카테고리</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        {subcategories.length > 0 && (
          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
            className="px-2 py-2 text-sm border border-neutral-200 rounded-lg"
          >
            <option value="all">세부 카테고리</option>
            {subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        )}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-2 py-2 text-sm border border-neutral-200 rounded-lg"
        >
          <option value="all">재고</option>
          <option value="available">충분</option>
          <option value="low">부족</option>
          <option value="out_of_stock">품절</option>
        </select>
      </div>

      {/* Products List */}
      {isLoading && (
        <div className="text-center py-12 text-neutral-500">로딩 중...</div>
      )}
      <div className="space-y-2">
        {filteredProducts.map((product) => {
          const stockConfig = stockStatusConfig[product.stockStatus]
          return (
            <Card key={product.id}>
              <CardContent className="p-3 overflow-hidden">
                {/* 한 줄: 이미지 + 상품정보 + 가격 + 재고상태 */}
                <div className="flex items-center gap-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-neutral-900 truncate block">{product.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-neutral-400 line-through">{formatPrice(product.prices.retail)}</span>
                      <span className="text-sm font-bold text-neutral-900">{formatPrice(product.prices.member)}</span>
                      <Badge variant={stockConfig.variant} size="sm">{stockConfig.label}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link to={`/admin/products/${product.id}/edit`}>
                      <Button variant="ghost" size="sm" className="p-1.5"><Edit className="w-4 h-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="p-1.5 text-error" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-neutral-500">검색 결과가 없습니다.</div>
      )}
    </div>
  )
}
