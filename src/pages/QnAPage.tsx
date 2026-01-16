import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, ChevronDown, ChevronUp, Search, Lock, CheckCircle } from 'lucide-react'
import { Badge, Card, Button } from '../components/ui'
import { Animated } from '../hooks'
import { cn } from '../lib/utils'

interface QnA {
  id: string
  productName: string
  productImage: string
  question: string
  answer?: string
  author: string
  createdAt: Date
  isPrivate: boolean
  isAnswered: boolean
}

const qnas: QnA[] = [
  {
    id: 'qna-1',
    productName: '프리미엄 홍삼정과 선물세트',
    productImage: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=100&h=100&fit=crop',
    question: '유통기한이 어떻게 되나요?',
    answer: '안녕하세요. 해당 상품의 유통기한은 제조일로부터 2년입니다. 현재 출고되는 상품은 2025년 12월까지입니다. 감사합니다.',
    author: '김**',
    createdAt: new Date('2024-01-14'),
    isPrivate: false,
    isAnswered: true
  },
  {
    id: 'qna-2',
    productName: '6년근 홍삼 농축액 세트',
    productImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&h=100&fit=crop',
    question: '100박스 대량 주문 시 추가 할인이 가능한가요?',
    answer: '안녕하세요. 대량 주문에 대한 추가 할인은 담당자 협의가 필요합니다. 고객센터(1588-0000) 또는 이메일(sales@b2bmall.co.kr)로 문의해 주시면 맞춤 견적을 보내드리겠습니다. 감사합니다.',
    author: '박**',
    createdAt: new Date('2024-01-13'),
    isPrivate: false,
    isAnswered: true
  },
  {
    id: 'qna-3',
    productName: '명품 견과류 선물세트',
    productImage: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=100&h=100&fit=crop',
    question: '포장 상태로 배송되나요? 선물용으로 사용하려고 합니다.',
    answer: '네, 고급 선물포장 상태로 배송됩니다. 추가 요청사항이 있으시면 주문 시 메모에 남겨주세요.',
    author: '이**',
    createdAt: new Date('2024-01-12'),
    isPrivate: false,
    isAnswered: true
  },
  {
    id: 'qna-4',
    productName: '프리미엄 스킨케어 4종 세트',
    productImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop',
    question: '민감성 피부에도 사용 가능한가요?',
    author: '최**',
    createdAt: new Date('2024-01-11'),
    isPrivate: false,
    isAnswered: false
  },
  {
    id: 'qna-5',
    productName: '비타민C 1000mg 180정',
    productImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop',
    question: '결제 관련 문의드립니다.',
    author: '정**',
    createdAt: new Date('2024-01-10'),
    isPrivate: true,
    isAnswered: true
  },
  {
    id: 'qna-6',
    productName: '스테인리스 냄비 3종 세트',
    productImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
    question: '인덕션에서 사용 가능한가요?',
    answer: '네, 해당 제품은 인덕션 포함 모든 열원에서 사용 가능합니다. IH 인덕션 호환 제품입니다.',
    author: '한**',
    createdAt: new Date('2024-01-09'),
    isPrivate: false,
    isAnswered: true
  }
]

export function QnAPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'answered' | 'waiting'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">상품 Q&A</h1>
          <p className="text-neutral-500">상품에 대해 궁금한 점을 질문해 보세요</p>
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

      {/* Q&A List */}
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
    </div>
  )
}
