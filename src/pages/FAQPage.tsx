import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react'
import { Card } from '../components/ui'
import { Animated } from '../hooks'
import { useFAQs } from '../hooks/queries'
import { cn } from '../lib/utils'

export function FAQPage() {
  const { data: faqs = [], isLoading } = useFAQs()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const categories = ['전체', '회원', '주문/결제', '배송', '교환/반품', '기타']

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === '전체' || faq.category === selectedCategory
    const matchesSearch = searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center">
          <Link to="/" className="hover:text-primary-600">홈</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-medium">자주 묻는 질문</span>
        </nav>
      </Animated>

      {/* Header */}
      <Animated animation="fade-up" delay={100}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">자주 묻는 질문</h1>
          <p className="text-neutral-500">궁금하신 내용을 빠르게 찾아보세요</p>
        </div>
      </Animated>

      {/* Search */}
      <Animated animation="fade-up" delay={150}>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="질문을 검색해 보세요"
            className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </Animated>

      {/* Category Filter */}
      <Animated animation="fade-up" delay={200}>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </Animated>

      {/* 로딩 */}
      {isLoading && (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-500">FAQ를 불러오는 중...</p>
        </div>
      )}

      {/* FAQ List */}
      {!isLoading && (
      <Animated animation="fade-up" delay={300}>
        <Card className="overflow-hidden divide-y divide-neutral-100">
          {filteredFAQs.map((faq) => {
            const isExpanded = expandedId === faq.id

            return (
              <div key={faq.id}>
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full px-6 py-4 flex items-start gap-4 text-left hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded flex-shrink-0">
                    {faq.category}
                  </span>
                  <span className="flex-1 text-sm font-medium text-neutral-900">
                    {faq.question}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-6 pb-4 bg-neutral-50">
                    <p className="text-sm text-neutral-600 leading-relaxed pl-16">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}

          {filteredFAQs.length === 0 && (
            <div className="py-12 text-center">
              <HelpCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">검색 결과가 없습니다.</p>
            </div>
          )}
        </Card>
      </Animated>
      )}

      {/* Contact Info */}
      <Animated animation="fade-up" delay={400}>
        <div className="mt-8 p-6 bg-neutral-50 rounded-lg text-center">
          <p className="text-neutral-600 mb-2">원하시는 답변을 찾지 못하셨나요?</p>
          <p className="text-sm text-neutral-500">
            이메일 <span className="font-bold text-primary-600">lee0608min@naver.com</span>
          </p>
        </div>
      </Animated>
    </div>
  )
}
