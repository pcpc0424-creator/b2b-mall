import { useState } from 'react'
import { Product } from '../../types'
import { useStore, getPriceByTier } from '../../store'
import { NumberStepper, Badge, Button } from '../ui'
import { formatPrice, formatNumber } from '../../lib/utils'
import { cn } from '../../lib/utils'

interface ProductTableProps {
  products: Product[]
}

interface SelectedItem {
  product: Product
  quantity: number
}

export function ProductTable({ products }: ProductTableProps) {
  const { user, addToCart, addToQuote } = useStore()
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map())

  const tier = user?.tier || 'guest'

  const toggleSelect = (product: Product) => {
    const newSelected = new Map(selectedItems)
    if (newSelected.has(product.id)) {
      newSelected.delete(product.id)
    } else {
      newSelected.set(product.id, { product, quantity: product.minQuantity })
    }
    setSelectedItems(newSelected)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const newSelected = new Map(selectedItems)
    const item = newSelected.get(productId)
    if (item) {
      newSelected.set(productId, { ...item, quantity })
      setSelectedItems(newSelected)
    }
  }

  const selectAll = () => {
    if (selectedItems.size === products.length) {
      setSelectedItems(new Map())
    } else {
      const newSelected = new Map<string, SelectedItem>()
      products.forEach(p => {
        if (p.stockStatus !== 'out_of_stock') {
          newSelected.set(p.id, { product: p, quantity: p.minQuantity })
        }
      })
      setSelectedItems(newSelected)
    }
  }

  const getTotalQuantity = () => {
    return Array.from(selectedItems.values()).reduce((sum, item) => sum + item.quantity, 0)
  }

  const getTotalAmount = () => {
    return Array.from(selectedItems.values()).reduce((sum, item) => {
      return sum + getPriceByTier(item.product, tier) * item.quantity
    }, 0)
  }

  const handleAddToCart = () => {
    selectedItems.forEach(item => {
      addToCart(item.product, item.quantity)
    })
    setSelectedItems(new Map())
  }

  const handleAddToQuote = () => {
    selectedItems.forEach(item => {
      addToQuote(item.product, item.quantity)
    })
    setSelectedItems(new Map())
  }

  const stockStatusConfig = {
    available: { label: '충분', class: 'text-success' },
    low: { label: '부족', class: 'text-accent-600' },
    out_of_stock: { label: '품절', class: 'text-error' },
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.size === products.filter(p => p.stockStatus !== 'out_of_stock').length}
                  onChange={selectAll}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">상품명</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">단가</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">최소수량</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">재고</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">주문수량</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">소계</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((product) => {
              const isSelected = selectedItems.has(product.id)
              const selectedItem = selectedItems.get(product.id)
              const price = getPriceByTier(product, tier)
              const subtotal = isSelected && selectedItem ? price * selectedItem.quantity : 0
              const stockConfig = stockStatusConfig[product.stockStatus]

              return (
                <tr
                  key={product.id}
                  className={cn(
                    'transition-colors',
                    isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50',
                    product.stockStatus === 'out_of_stock' && 'opacity-50'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(product)}
                      disabled={product.stockStatus === 'out_of_stock'}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-neutral-600">{product.sku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{product.name}</p>
                        <p className="text-xs text-neutral-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-primary-600">{formatPrice(price)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-neutral-600">{product.minQuantity}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('text-sm font-medium', stockConfig.class)}>
                      {product.stockStatus === 'out_of_stock' ? stockConfig.label : formatNumber(product.stock)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      {isSelected && selectedItem ? (
                        <NumberStepper
                          value={selectedItem.quantity}
                          onChange={(q) => updateQuantity(product.id, q)}
                          min={product.minQuantity}
                          max={product.stock}
                          size="sm"
                        />
                      ) : (
                        <span className="text-sm text-neutral-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-neutral-900">
                      {isSelected ? formatPrice(subtotal) : '-'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-neutral-900 text-white px-3 md:px-6 py-3 md:py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
          <div className="flex items-center gap-3 md:gap-8 flex-wrap">
            <div>
              <span className="text-neutral-400 text-xs md:text-sm">선택</span>
              <span className="ml-1 md:ml-2 text-sm md:text-lg font-bold">{selectedItems.size}개</span>
            </div>
            <div>
              <span className="text-neutral-400 text-xs md:text-sm">수량</span>
              <span className="ml-1 md:ml-2 text-sm md:text-lg font-bold">{formatNumber(getTotalQuantity())}개</span>
            </div>
            <div>
              <span className="text-neutral-400 text-xs md:text-sm">금액</span>
              <span className="ml-1 md:ml-2 text-base md:text-xl font-bold text-primary-400">{formatPrice(getTotalAmount())}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToQuote}
              disabled={selectedItems.size === 0}
              className="flex-1 md:flex-none border-white text-white hover:bg-white hover:text-neutral-900 text-xs md:text-sm"
            >
              견적서
            </Button>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={selectedItems.size === 0}
              className="flex-1 md:flex-none bg-primary-500 hover:bg-primary-600 text-xs md:text-sm"
            >
              장바구니
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
