import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, ChevronDown, ChevronUp, Search, Lock, CheckCircle, Loader2, Plus, X } from 'lucide-react'
import { Badge, Card, Button } from '../components/ui'
import { Animated } from '../hooks'
import { useQnAs, useCreateQnA, useProducts } from '../hooks/queries'
import { useStore } from '../store'
import { cn } from '../lib/utils'

export function QnAPage() {
  const { data: qnas = [], isLoading } = useQnAs()
  const { data: products = [] } = useProducts()
  const createQnA = useCreateQnA()
  const { user } = useStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'answered' | 'waiting'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 문의 작성 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [question, setQuestion] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filters = [
    { id: 'all', label: '전체' },
    { id: 'answered', label: '답변완료' },
    { id: 'waiting', label: '답변대기' }
  ]

  const filteredQnAs = qnas.filter(qna => {
    const matchesFilter = filter === 'all' ||
      (filter === 'answered' && qna.isAnswered) ||
      (filter === 'waiting' && !qna.isAnswered)
    const matchesSearch = searchTerm === '' ||
      qna.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qna.question.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // 상품 검색 필터
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  const selectedProduct = products.find(p => p.id === selectedProductId)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const handleOpenModal = () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProductId('')
    setQuestion('')
    setIsPrivate(false)
    setProductSearch('')
  }

  const handleSubmit = async () => {
    if (!selectedProductId) {
      alert('상품을 선택해주세요.')
      return
    }
    if (!question.trim()) {
      alert('문의 내용을 입력해주세요.')
      return
    }
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    setIsSubmitting(true)
    try {
      await createQnA.mutateAsync({
        productId: selectedProductId,
        productName: selectedProduct?.name || '',
        productImage: selectedProduct?.images?.[0] || '',
        question: question.trim(),
        author: user.name || user.email,
        userId: user.id,
        isPrivate,
      })
      alert('문의가 등록되었습니다.')
      handleCloseModal()
    } catch {
      alert('문의 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center">
          <Link to="/" className="hover:text-primary-600">홈</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-medium">상품 Q&A</span>
        </nav>
      </Animated>

      {/* Header */}
      <Animated animation="fade-up" delay={100}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">상품 Q&A</h1>
            <p className="text-neutral-500">상품에 대해 궁금한 점을 질문해 보세요</p>
          </div>
          <Button onClick={handleOpenModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            문의하기
          </Button>
        </div>
      </Animated>

      {/* Search & Filter */}
      <Animated animation="fade-up" delay={150}>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="상품명 또는 질문 검색"
              className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as 'all' | 'answered' | 'waiting')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  filter === f.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Animated>

      {/* 로딩 */}
      {isLoading && (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-500">Q&A를 불러오는 중...</p>
        </div>
      )}

      {/* Q&A List */}
      {!isLoading && (
      <Animated animation="fade-up" delay={200}>
        <Card className="overflow-hidden divide-y divide-neutral-100">
          {filteredQnAs.map((qna) => {
            const isExpanded = expandedId === qna.id

            return (
              <div key={qna.id}>
                <button
                  onClick={() => !qna.isPrivate && toggleExpand(qna.id)}
                  disabled={qna.isPrivate}
                  className={cn(
                    'w-full p-4 flex items-start gap-4 text-left transition-colors',
                    qna.isPrivate ? 'cursor-not-allowed' : 'hover:bg-neutral-50'
                  )}
                >
                  <img
                    src={qna.productImage}
                    alt={qna.productName}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={qna.isAnswered ? 'success' : 'secondary'}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        {qna.isAnswered ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            답변완료
                          </>
                        ) : '답변대기'}
                      </Badge>
                      {qna.isPrivate && (
                        <Badge variant="secondary" size="sm" className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          비공개
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mb-1">{qna.productName}</p>
                    <p className={cn(
                      'text-sm',
                      qna.isPrivate ? 'text-neutral-400' : 'text-neutral-900'
                    )}>
                      {qna.isPrivate ? '비공개 문의입니다.' : qna.question}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                      <span>{qna.author}</span>
                      <span>{formatDate(qna.createdAt)}</span>
                    </div>
                  </div>
                  {!qna.isPrivate && (
                    isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    )
                  )}
                </button>

                {isExpanded && qna.answer && (
                  <div className="px-4 pb-4 bg-primary-50 mx-4 mb-4 rounded-lg">
                    <div className="py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="primary" size="sm">판매자 답변</Badge>
                      </div>
                      <p className="text-sm text-neutral-700 leading-relaxed">
                        {qna.answer}
                      </p>
                    </div>
                  </div>
                )}

                {isExpanded && !qna.answer && (
                  <div className="px-4 pb-4 bg-neutral-50 mx-4 mb-4 rounded-lg">
                    <div className="py-4 text-center text-sm text-neutral-500">
                      아직 답변이 등록되지 않았습니다.
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {filteredQnAs.length === 0 && (
            <div className="py-12 text-center">
              <MessageCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">등록된 Q&A가 없습니다.</p>
            </div>
          )}
        </Card>
      </Animated>
      )}

      {/* Notice */}
      <Animated animation="fade-up" delay={300}>
        <div className="mt-8 p-6 bg-neutral-50 rounded-lg">
          <h3 className="font-medium text-neutral-900 mb-2">Q&A 이용 안내</h3>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>• 상품과 관련 없는 문의는 답변이 지연되거나 삭제될 수 있습니다.</li>
            <li>• 개인정보(연락처, 주소 등)는 비공개 문의를 이용해 주세요.</li>
            <li>• 답변은 영업일 기준 1-2일 내 등록됩니다.</li>
          </ul>
        </div>
      </Animated>

      {/* 문의 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">상품 문의하기</h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 상품 선택 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  상품 선택 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="상품명을 검색하세요"
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                />
                {productSearch && !selectedProductId && (
                  <div className="border border-neutral-200 rounded-lg max-h-48 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.slice(0, 10).map(product => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSelectedProductId(product.id)
                            setProductSearch(product.name)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-3"
                        >
                          <img
                            src={product.images?.[0]}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <span className="text-sm text-neutral-900 truncate">{product.name}</span>
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-neutral-500">검색 결과가 없습니다.</p>
                    )}
                  </div>
                )}
                {selectedProduct && (
                  <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                    <img
                      src={selectedProduct.images?.[0]}
                      alt={selectedProduct.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <span className="text-sm font-medium text-neutral-900 flex-1">{selectedProduct.name}</span>
                    <button
                      onClick={() => {
                        setSelectedProductId('')
                        setProductSearch('')
                      }}
                      className="text-neutral-500 hover:text-neutral-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 문의 내용 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  문의 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="궁금한 점을 자세히 적어주세요"
                  rows={5}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {/* 비공개 설정 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">비공개 문의</span>
                <span className="text-xs text-neutral-500">(개인정보가 포함된 경우 체크해주세요)</span>
              </label>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 flex gap-3">
              <Button variant="secondary" onClick={handleCloseModal} className="flex-1">
                취소
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    등록 중...
                  </>
                ) : (
                  '문의 등록'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
