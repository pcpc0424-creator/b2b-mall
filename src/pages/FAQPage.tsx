import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Card } from '../components/ui'
import { Animated } from '../hooks'
import { cn } from '../lib/utils'

interface FAQ {
  id: string
  category: string
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    id: 'faq-1',
    category: '회원',
    question: '회원가입은 어떻게 하나요?',
    answer: '홈페이지 우측 상단의 "회원가입" 버튼을 클릭하시면 회원가입 페이지로 이동합니다. 사업자등록증 사본을 첨부하여 신청하시면 영업일 기준 1-2일 내에 승인 여부를 안내해 드립니다.'
  },
  {
    id: 'faq-2',
    category: '회원',
    question: '회원 등급은 어떻게 결정되나요?',
    answer: '회원 등급은 월간 구매 금액에 따라 자동으로 조정됩니다. Member(월 100만원 미만), VIP(월 100만원 이상), Wholesale(월 500만원 이상), Partner(월 1,000만원 이상)로 구분됩니다. 등급이 높을수록 더 많은 할인 혜택을 받으실 수 있습니다.'
  },
  {
    id: 'faq-3',
    category: '회원',
    question: '비밀번호를 잊어버렸어요.',
    answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하시면 가입 시 등록한 이메일로 비밀번호 재설정 링크가 발송됩니다. 이메일을 확인하시어 새 비밀번호를 설정해 주세요.'
  },
  {
    id: 'faq-4',
    category: '주문/결제',
    question: '최소 주문 수량이 있나요?',
    answer: '각 상품별로 최소 주문 수량이 다르게 설정되어 있습니다. 상품 상세 페이지에서 해당 상품의 최소 주문 수량을 확인하실 수 있습니다. B2B 특성상 일반적으로 개인 소비자용보다 최소 수량이 높게 설정되어 있습니다.'
  },
  {
    id: 'faq-5',
    category: '주문/결제',
    question: '결제 방법은 어떤 것이 있나요?',
    answer: '신용카드, 계좌이체, 가상계좌(무통장입금)를 지원합니다. 또한 정기 거래처의 경우 월말 정산 방식의 후불 결제도 가능합니다. 후불 결제 신청은 고객센터로 문의해 주세요.'
  },
  {
    id: 'faq-6',
    category: '주문/결제',
    question: '세금계산서 발행은 어떻게 하나요?',
    answer: '주문 완료 후 "마이페이지 > 주문내역"에서 세금계산서 발행을 신청하실 수 있습니다. 사업자등록증에 등록된 정보로 발행되며, 발행 후 등록된 이메일로 전송됩니다.'
  },
  {
    id: 'faq-7',
    category: '배송',
    question: '배송은 얼마나 걸리나요?',
    answer: '결제 완료 후 영업일 기준 1-3일 내 출고됩니다. 출고 후 1-2일 내 배송이 완료됩니다. 단, 도서산간 지역의 경우 1-2일 추가 소요될 수 있습니다. 대량 주문의 경우 별도 협의된 일정에 따릅니다.'
  },
  {
    id: 'faq-8',
    category: '배송',
    question: '배송비는 얼마인가요?',
    answer: '기본 배송비는 3,000원이며, 30만원 이상 구매 시 무료 배송됩니다. VIP 이상 등급 회원은 구매 금액과 관계없이 항상 무료 배송 혜택이 적용됩니다.'
  },
  {
    id: 'faq-9',
    category: '배송',
    question: '배송지를 변경하고 싶어요.',
    answer: '상품 출고 전까지는 "마이페이지 > 주문내역"에서 배송지 변경이 가능합니다. 이미 출고된 경우에는 고객센터로 연락 주시면 택배사를 통해 변경 가능 여부를 확인해 드립니다.'
  },
  {
    id: 'faq-10',
    category: '교환/반품',
    question: '교환/반품은 어떻게 하나요?',
    answer: '상품 수령 후 7일 이내에 "마이페이지 > 주문내역"에서 교환/반품 신청이 가능합니다. 단순 변심의 경우 왕복 배송비가 부과되며, 상품 하자의 경우 무료로 처리됩니다.'
  },
  {
    id: 'faq-11',
    category: '교환/반품',
    question: '교환/반품이 불가능한 경우가 있나요?',
    answer: '다음의 경우 교환/반품이 불가합니다: 1) 고객 책임으로 상품이 훼손된 경우, 2) 사용 또는 일부 소비로 가치가 감소한 경우, 3) 시간 경과로 재판매가 어려운 경우, 4) 식품 등 포장을 개봉한 경우.'
  },
  {
    id: 'faq-12',
    category: '기타',
    question: '견적서는 어떻게 받나요?',
    answer: '상품을 장바구니에 담은 후 "견적서 요청" 버튼을 클릭하시면 견적서를 다운로드하실 수 있습니다. 대량 주문이나 특별 할인 요청은 고객센터로 문의해 주시면 맞춤 견적을 제공해 드립니다.'
  },
  {
    id: 'faq-13',
    category: '기타',
    question: '파트너 제휴는 어떻게 신청하나요?',
    answer: '파트너 제휴를 원하시는 업체는 고객센터 또는 partner@b2bmall.co.kr로 문의해 주세요. 담당자가 확인 후 연락드리겠습니다. 제휴 시 특별 할인 및 마케팅 지원 혜택이 제공됩니다.'
  }
]

export function FAQPage() {
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

      {/* FAQ List */}
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

      {/* Contact Info */}
      <Animated animation="fade-up" delay={400}>
        <div className="mt-8 p-6 bg-neutral-50 rounded-lg text-center">
          <p className="text-neutral-600 mb-2">원하시는 답변을 찾지 못하셨나요?</p>
          <p className="text-sm text-neutral-500">
            고객센터 <span className="font-bold text-primary-600">1588-0000</span> (평일 09:00~18:00)
          </p>
        </div>
      </Animated>
    </div>
  )
}
