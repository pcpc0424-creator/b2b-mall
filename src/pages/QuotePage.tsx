import { useState } from 'react'
import { Download, Save, ShoppingCart, Trash2, FileText, Calendar, Building } from 'lucide-react'
import { useStore, getTierLabel } from '../store'
import { Button, NumberStepper, Card, CardContent, Input } from '../components/ui'
import { formatPrice, formatNumber, cn } from '../lib/utils'

export function QuotePage() {
  const { user, quoteItems, updateQuoteQuantity, removeFromQuote, clearQuote, getQuoteTotal, addToCart } = useStore()
  const [memo, setMemo] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const today = new Date()
  const deliveryDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // +7 days

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleConvertToOrder = () => {
    quoteItems.forEach(item => {
      addToCart(item.product, item.quantity)
    })
    clearQuote()
  }

  const totalQuantity = quoteItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = getQuoteTotal()

  if (quoteItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <FileText className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">견적함이 비어있습니다</h1>
        <p className="text-neutral-500 mb-6">상품을 견적함에 담아주세요</p>
        <Button onClick={() => window.location.href = '/products'}>
          상품 둘러보기
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">견적서 생성</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quote Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-medium text-neutral-900">견적 상품 ({quoteItems.length}개)</h2>
                <Button variant="ghost" size="sm" onClick={clearQuote} className="text-error hover:text-error hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-1" />
                  전체 삭제
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">상품</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500">단가</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500">수량</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500">소계</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {quoteItems.map((item) => (
                      <tr key={item.product.id}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div>
                              <p className="font-medium text-neutral-900">{item.product.name}</p>
                              <p className="text-xs text-neutral-500">SKU: {item.product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-medium">{formatPrice(item.unitPrice)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <NumberStepper
                              value={item.quantity}
                              onChange={(q) => updateQuoteQuantity(item.product.id, q)}
                              min={item.product.minQuantity}
                              max={item.product.stock}
                              size="sm"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-bold text-primary-600">{formatPrice(item.subtotal)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => removeFromQuote(item.product.id)}
                            className="text-neutral-400 hover:text-error transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Additional Info */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">예상 배송일:</span>
                  <span className="font-medium">{formatDate(deliveryDate)}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">메모</label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="견적서에 추가할 메모를 입력하세요"
                    className="w-full border border-neutral-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Actions */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-neutral-900 mb-4">견적 요약</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">상품 수</span>
                  <span className="font-medium">{quoteItems.length}개 품목</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">총 수량</span>
                  <span className="font-medium">{formatNumber(totalQuantity)}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">적용 등급</span>
                  <span className="font-medium">{getTierLabel(user?.tier || 'guest')}</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">총 금액</span>
                    <span className="text-2xl font-bold text-primary-600">{formatPrice(totalAmount)}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 text-right">VAT 별도</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={() => setShowPreview(true)}>
              <FileText className="w-5 h-5 mr-2" />
              견적서 미리보기
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />
                저장하기
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                PDF 다운로드
              </Button>
            </div>
            <Button variant="secondary" className="w-full" onClick={handleConvertToOrder}>
              <ShoppingCart className="w-5 h-5 mr-2" />
              주문으로 전환
            </Button>
          </div>
        </div>
      </div>

      {/* Quote Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            {/* Preview Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">견적서 미리보기</h2>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  PDF 다운로드
                </Button>
                <button onClick={() => setShowPreview(false)} className="text-neutral-400 hover:text-neutral-600">
                  ✕
                </button>
              </div>
            </div>

            {/* Quote Document */}
            <div className="p-8">
              {/* Quote Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-neutral-900">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">견 적 서</h1>
                <p className="text-sm text-neutral-500">QUOTATION</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-bold text-neutral-600 mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    수신
                  </h3>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="font-medium text-neutral-900">{user?.company || '회사명'}</p>
                    <p className="text-sm text-neutral-600 mt-1">{user?.name || '담당자명'} 님 귀하</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-600 mb-3">발신</h3>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="font-bold text-primary-600 text-lg">정담B2B</p>
                    <p className="text-sm text-neutral-600 mt-1">서울특별시 강남구 테헤란로 123</p>
                    <p className="text-sm text-neutral-600">Tel: 1588-0000</p>
                  </div>
                </div>
              </div>

              {/* Quote Info */}
              <div className="flex justify-between mb-6 text-sm">
                <div>
                  <span className="text-neutral-500">견적번호:</span>
                  <span className="font-mono font-medium ml-2">QT-{Date.now().toString().slice(-8)}</span>
                </div>
                <div>
                  <span className="text-neutral-500">견적일자:</span>
                  <span className="font-medium ml-2">{formatDate(today)}</span>
                </div>
                <div>
                  <span className="text-neutral-500">유효기간:</span>
                  <span className="font-medium ml-2">견적일로부터 30일</span>
                </div>
              </div>

              {/* Products Table */}
              <table className="w-full text-sm mb-6 border-collapse border border-neutral-300">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-300 px-3 py-2 text-left">No.</th>
                    <th className="border border-neutral-300 px-3 py-2 text-left">품목</th>
                    <th className="border border-neutral-300 px-3 py-2 text-left">SKU</th>
                    <th className="border border-neutral-300 px-3 py-2 text-right">단가</th>
                    <th className="border border-neutral-300 px-3 py-2 text-center">수량</th>
                    <th className="border border-neutral-300 px-3 py-2 text-right">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteItems.map((item, index) => (
                    <tr key={item.product.id}>
                      <td className="border border-neutral-300 px-3 py-2 text-center">{index + 1}</td>
                      <td className="border border-neutral-300 px-3 py-2">{item.product.name}</td>
                      <td className="border border-neutral-300 px-3 py-2 font-mono text-xs">{item.product.sku}</td>
                      <td className="border border-neutral-300 px-3 py-2 text-right">{formatPrice(item.unitPrice)}</td>
                      <td className="border border-neutral-300 px-3 py-2 text-center">{item.quantity}</td>
                      <td className="border border-neutral-300 px-3 py-2 text-right font-medium">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-50">
                    <td colSpan={4} className="border border-neutral-300 px-3 py-2 text-right font-medium">
                      공급가액
                    </td>
                    <td className="border border-neutral-300 px-3 py-2 text-center font-medium">{totalQuantity}</td>
                    <td className="border border-neutral-300 px-3 py-2 text-right font-bold">{formatPrice(totalAmount)}</td>
                  </tr>
                  <tr className="bg-neutral-50">
                    <td colSpan={5} className="border border-neutral-300 px-3 py-2 text-right font-medium">
                      부가세 (10%)
                    </td>
                    <td className="border border-neutral-300 px-3 py-2 text-right font-medium">{formatPrice(Math.round(totalAmount * 0.1))}</td>
                  </tr>
                  <tr className="bg-primary-50">
                    <td colSpan={5} className="border border-neutral-300 px-3 py-3 text-right font-bold text-lg">
                      합계
                    </td>
                    <td className="border border-neutral-300 px-3 py-3 text-right font-bold text-lg text-primary-600">
                      {formatPrice(Math.round(totalAmount * 1.1))}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Memo */}
              {memo && (
                <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">비고</h4>
                  <p className="text-sm text-neutral-600 whitespace-pre-wrap">{memo}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-neutral-200 text-center text-xs text-neutral-500">
                <p>본 견적서는 전자문서로 작성되었으며, 별도의 날인이 필요하지 않습니다.</p>
                <p className="mt-1">문의사항: contact@joengdam.co.kr | 1588-0000</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
