import { useState } from 'react'
import { Upload, Download, FileText, AlertCircle, Check, Trash2, ShoppingCart } from 'lucide-react'
import { useStore, getPriceByTier } from '../store'
import { products } from '../data'
import { Product } from '../types'
import { Button, Tabs, Badge, Card, CardContent, NumberStepper } from '../components/ui'
import { formatPrice, cn } from '../lib/utils'
import { Animated } from '../hooks'

interface QuickOrderItem {
  sku: string
  quantity: number
  product?: Product
  error?: string
}

export function QuickOrderPage() {
  const { user, addToCart, addToQuote } = useStore()
  const [skuInput, setSkuInput] = useState('')
  const [orderItems, setOrderItems] = useState<QuickOrderItem[]>([])
  const [dragActive, setDragActive] = useState(false)

  const tier = user?.tier || 'guest'

  // Parse SKU input
  const handleSkuInputChange = (value: string) => {
    setSkuInput(value)

    const lines = value.trim().split('\n').filter(line => line.trim())
    const items: QuickOrderItem[] = lines.map(line => {
      const parts = line.split(/[\t,\s]+/).filter(p => p)
      const sku = parts[0]?.toUpperCase() || ''
      const quantity = parseInt(parts[1], 10) || 1

      const product = products.find(p => p.sku === sku)

      if (!sku) {
        return { sku: '', quantity: 0 }
      }

      if (!product) {
        return { sku, quantity, error: 'SKU를 찾을 수 없습니다' }
      }

      if (product.stockStatus === 'out_of_stock') {
        return { sku, quantity, product, error: '품절된 상품입니다' }
      }

      if (quantity < product.minQuantity) {
        return { sku, quantity, product, error: `최소 주문수량: ${product.minQuantity}개` }
      }

      if (quantity > product.stock) {
        return { sku, quantity, product, error: `재고 부족 (재고: ${product.stock}개)` }
      }

      return { sku, quantity, product }
    }).filter(item => item.sku)

    setOrderItems(items)
  }

  // CSV Upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      handleSkuInputChange(content)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  // Update quantity
  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...orderItems]
    const item = newItems[index]
    if (item.product) {
      if (quantity < item.product.minQuantity) {
        item.error = `최소 주문수량: ${item.product.minQuantity}개`
      } else if (quantity > item.product.stock) {
        item.error = `재고 부족 (재고: ${item.product.stock}개)`
      } else {
        item.error = undefined
      }
    }
    item.quantity = quantity
    setOrderItems(newItems)
  }

  // Remove item
  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  // Calculate totals
  const validItems = orderItems.filter(item => item.product && !item.error)
  const totalQuantity = validItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = validItems.reduce((sum, item) => {
    return sum + (item.product ? getPriceByTier(item.product, tier) * item.quantity : 0)
  }, 0)

  // Add to cart
  const handleAddToCart = () => {
    validItems.forEach(item => {
      if (item.product) {
        addToCart(item.product, item.quantity)
      }
    })
    setOrderItems([])
    setSkuInput('')
  }

  // Add to quote
  const handleAddToQuote = () => {
    validItems.forEach(item => {
      if (item.product) {
        addToQuote(item.product, item.quantity)
      }
    })
  }

  // Download template
  const downloadTemplate = () => {
    const content = 'SKU,수량\nGF-001,10\nGF-002,5\nBT-001,20'
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'quick_order_template.csv'
    link.click()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <Animated animation="fade-up">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">빠른 주문</h1>
          <p className="text-neutral-500 mt-1">SKU 코드로 대량 주문을 빠르게 처리하세요</p>
        </div>
      </Animated>

      <Animated animation="fade-up" delay={100}>
      <Tabs
        tabs={[
          {
            id: 'sku',
            label: 'SKU 직접 입력',
            content: (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Area */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-neutral-900">SKU 입력</h3>
                      <span className="text-xs text-neutral-500">형식: SKU, 수량 (줄바꿈으로 구분)</span>
                    </div>
                    <textarea
                      value={skuInput}
                      onChange={(e) => handleSkuInputChange(e.target.value)}
                      placeholder="GF-001, 10&#10;GF-002, 5&#10;BT-001, 20"
                      className="w-full h-64 p-4 border border-neutral-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-neutral-500">
                        입력된 SKU: <span className="font-medium text-neutral-900">{orderItems.length}개</span>
                        {orderItems.filter(i => i.error).length > 0 && (
                          <span className="ml-2 text-error">
                            (오류: {orderItems.filter(i => i.error).length}개)
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSkuInput(''); setOrderItems([]) }}
                      >
                        초기화
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium text-neutral-900 mb-4">주문 미리보기</h3>
                    <div className="overflow-auto max-h-64 border border-neutral-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-neutral-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">SKU</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">상품명</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500">단가</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500">수량</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500">소계</th>
                            <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {orderItems.map((item, index) => (
                            <tr
                              key={index}
                              className={cn(
                                item.error ? 'bg-red-50' : ''
                              )}
                            >
                              <td className="px-3 py-2 font-mono text-xs">{item.sku}</td>
                              <td className="px-3 py-2">
                                {item.product ? (
                                  <span className="text-neutral-900">{item.product.name}</span>
                                ) : (
                                  <span className="text-error flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {item.error}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {item.product && formatPrice(getPriceByTier(item.product, tier))}
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex justify-center">
                                  {item.product ? (
                                    <NumberStepper
                                      value={item.quantity}
                                      onChange={(q) => updateItemQuantity(index, q)}
                                      min={1}
                                      max={item.product.stock}
                                      size="sm"
                                    />
                                  ) : (
                                    <span className="text-neutral-400">{item.quantity}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-right font-medium">
                                {item.product && !item.error
                                  ? formatPrice(getPriceByTier(item.product, tier) * item.quantity)
                                  : '-'
                                }
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => removeItem(index)}
                                  className="text-neutral-400 hover:text-error"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {orderItems.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-3 py-8 text-center text-neutral-500">
                                SKU를 입력하면 여기에 표시됩니다
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary */}
                    <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-600">유효한 상품</span>
                        <span className="font-medium">{validItems.length}개</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-600">총 수량</span>
                        <span className="font-medium">{totalQuantity}개</span>
                      </div>
                      <div className="flex justify-between text-lg border-t border-neutral-200 pt-2 mt-2">
                        <span className="font-medium">총 금액</span>
                        <span className="font-bold text-primary-600">{formatPrice(totalAmount)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleAddToQuote}
                        disabled={validItems.length === 0}
                        className="flex-1"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        견적에 담기
                      </Button>
                      <Button
                        onClick={handleAddToCart}
                        disabled={validItems.length === 0}
                        className="flex-1"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        장바구니 담기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ),
          },
          {
            id: 'csv',
            label: 'CSV 업로드',
            content: (
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardContent className="p-8">
                    {/* Template Download */}
                    <div className="mb-6 flex justify-end">
                      <Button variant="outline" size="sm" onClick={downloadTemplate}>
                        <Download className="w-4 h-4 mr-2" />
                        템플릿 다운로드
                      </Button>
                    </div>

                    {/* Drop Zone */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={cn(
                        'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
                        dragActive
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      )}
                    >
                      <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                      <p className="text-neutral-600 mb-2">CSV 또는 TXT 파일을 드래그하세요</p>
                      <p className="text-sm text-neutral-500 mb-4">또는</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".csv,.txt"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        />
                        <Button variant="outline">파일 선택</Button>
                      </label>
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                      <h4 className="font-medium text-neutral-900 mb-2">파일 형식 안내</h4>
                      <ul className="text-sm text-neutral-600 space-y-1">
                        <li>• 첫 번째 열: SKU 코드</li>
                        <li>• 두 번째 열: 주문 수량</li>
                        <li>• 구분자: 쉼표(,) 또는 탭</li>
                        <li>• 인코딩: UTF-8 권장</li>
                      </ul>
                    </div>

                    {/* Preview Table (when file is loaded) */}
                    {orderItems.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium text-neutral-900 mb-3">업로드 결과</h4>
                        <div className="overflow-auto max-h-64 border border-neutral-200 rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="bg-neutral-50 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">상태</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">SKU</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">상품명</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500">수량</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">메시지</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {orderItems.map((item, index) => (
                                <tr
                                  key={index}
                                  className={item.error ? 'bg-red-50' : ''}
                                >
                                  <td className="px-3 py-2">
                                    {item.error ? (
                                      <AlertCircle className="w-4 h-4 text-error" />
                                    ) : (
                                      <Check className="w-4 h-4 text-success" />
                                    )}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-xs">{item.sku}</td>
                                  <td className="px-3 py-2">{item.product?.name || '-'}</td>
                                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                                  <td className="px-3 py-2 text-xs text-error">{item.error || ''}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex gap-3">
                          <Button
                            variant="outline"
                            onClick={handleAddToQuote}
                            disabled={validItems.length === 0}
                            className="flex-1"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            견적에 담기
                          </Button>
                          <Button
                            onClick={handleAddToCart}
                            disabled={validItems.length === 0}
                            className="flex-1"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            장바구니 담기
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ),
          },
          {
            id: 'pricelist',
            label: '단가표 다운로드',
            content: (
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardContent className="p-8">
                    <h3 className="font-medium text-neutral-900 mb-6 text-center">등급별 단가표 다운로드</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <button className="p-6 border-2 border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
                        <Badge variant="default" className="mb-3">일반</Badge>
                        <p className="font-medium text-neutral-900">일반 단가표</p>
                        <p className="text-sm text-neutral-500 mt-1">소매 가격 기준</p>
                        <div className="mt-4 flex justify-center gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Excel
                          </Button>
                        </div>
                      </button>

                      <button className="p-6 border-2 border-neutral-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors text-center">
                        <Badge variant="warning" className="mb-3">VIP</Badge>
                        <p className="font-medium text-neutral-900">VIP 단가표</p>
                        <p className="text-sm text-neutral-500 mt-1">VIP 회원 전용</p>
                        <div className="mt-4 flex justify-center gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Excel
                          </Button>
                        </div>
                      </button>

                      <button className="p-6 border-2 border-neutral-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                        <Badge variant="primary" className="mb-3">도매</Badge>
                        <p className="font-medium text-neutral-900">도매 단가표</p>
                        <p className="text-sm text-neutral-500 mt-1">도매 회원 전용</p>
                        <div className="mt-4 flex justify-center gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Excel
                          </Button>
                        </div>
                      </button>

                      <button className="p-6 border-2 border-neutral-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center">
                        <Badge className="mb-3 bg-purple-100 text-purple-700">파트너</Badge>
                        <p className="font-medium text-neutral-900">파트너 단가표</p>
                        <p className="text-sm text-neutral-500 mt-1">파트너 전용</p>
                        <div className="mt-4 flex justify-center gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Excel
                          </Button>
                        </div>
                      </button>
                    </div>

                    <p className="text-xs text-neutral-500 text-center mt-6">
                      * 단가표는 로그인 후 본인 등급에 맞는 파일만 다운로드 가능합니다
                    </p>
                  </CardContent>
                </Card>
              </div>
            ),
          },
        ]}
      />
      </Animated>
    </div>
  )
}
