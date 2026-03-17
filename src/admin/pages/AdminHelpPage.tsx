import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Package,
  Megaphone,
  ShoppingCart,
  Users,
  Bell,
  HelpCircle,
  MessageCircle,
  Star,
  Ticket,
  LayoutGrid,
  Image,
  MessageSquare,
  Crown,
  Truck,
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui'
import { cn } from '../../lib/utils'

interface Section {
  id: string
  title: string
  icon: React.ElementType
  content: React.ReactNode
}

const sections: Section[] = [
  {
    id: 'dashboard',
    title: '대시보드',
    icon: LayoutDashboard,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin</code></p>
        <p>실시간 쇼핑몰 현황을 한눈에 확인할 수 있습니다.</p>
        <h4 className="font-semibold mt-4">표시 정보</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>총 상품, 총 회원, 총 주문, 총 매출</li>
          <li>오늘 주문, 오늘 매출</li>
          <li>대기 주문, 재고부족 상품</li>
          <li>활성 프로모션, 활성 회원</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'products',
    title: '상품 관리',
    icon: Package,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/products</code></p>
        <h4 className="font-semibold">주요 기능</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>상품 목록 조회 및 검색 (상품명, SKU)</li>
          <li>카테고리, 재고 상태별 필터링</li>
          <li>새 상품 등록 / 상품 수정 / 삭제</li>
          <li>이미지 업로드 (드래그 앤 드롭)</li>
          <li>옵션, 변형(variants), 수량별 할인 설정</li>
        </ul>
        <h4 className="font-semibold mt-4">재고 상태</h4>
        <ul className="text-sm space-y-1">
          <li>🟢 <strong>충분:</strong> 재고 여유</li>
          <li>🟡 <strong>부족:</strong> 재고 부족 경고</li>
          <li>🔴 <strong>품절:</strong> 재고 없음</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'promotions',
    title: '프로모션 관리',
    icon: Megaphone,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/promotions</code></p>
        <h4 className="font-semibold">주요 기능</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>프로모션 목록 조회</li>
          <li>새 프로모션 생성 / 수정 / 삭제</li>
          <li>활성/비활성 토글</li>
          <li>대상 등급 및 기간 설정</li>
          <li>적용 상품 선택</li>
        </ul>
        <h4 className="font-semibold mt-4">프로모션 유형</h4>
        <ul className="text-sm space-y-1">
          <li><strong>전체:</strong> 모든 등급 대상</li>
          <li><strong>타임특가:</strong> 시간 제한 특가</li>
          <li><strong>전용:</strong> 특정 등급 전용</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'orders',
    title: '주문 관리',
    icon: ShoppingCart,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/orders</code></p>
        <h4 className="font-semibold">주요 기능</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>주문 목록 조회 및 검색</li>
          <li>주문 상태 변경</li>
          <li>운송장 정보 입력 (택배사, 운송장번호)</li>
          <li>환불 처리</li>
        </ul>
        <h4 className="font-semibold mt-4">주문 상태</h4>
        <div className="text-sm space-y-1">
          <p><strong>대기</strong> → <strong>확인</strong> → <strong>준비</strong> → <strong>배송</strong> → <strong>완료</strong></p>
          <p>취소됨 / 환불됨</p>
        </div>
        <h4 className="font-semibold mt-4">환불 처리</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>주문 상세에서 "환불 처리" 버튼 클릭</li>
          <li>확인 후 토스페이먼츠 API로 자동 환불</li>
          <li>주문 상태가 "환불"로 변경됨</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'members',
    title: '회원 관리',
    icon: Users,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/members</code></p>
        <h4 className="font-semibold">주요 기능</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>회원 목록 조회 및 검색</li>
          <li>등급, 상태별 필터링</li>
          <li>회원 등급 변경</li>
          <li>회원 상태 변경 (활성/비활성/정지)</li>
          <li>가입 승인 처리</li>
          <li>탈퇴 회원 관리 및 복구</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'notices',
    title: '공지사항 관리',
    icon: Bell,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/notices</code></p>
        <h4 className="font-semibold">주요 기능</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>공지사항 목록 조회</li>
          <li>새 공지사항 작성 / 수정 / 삭제</li>
          <li>분류 설정 (공지/이벤트/업데이트/중요)</li>
          <li>중요 공지 상단 고정</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'faqs',
    title: 'FAQ 관리',
    icon: HelpCircle,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/faqs</code></p>
        <h4 className="font-semibold">주요 기능</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>FAQ 목록 조회</li>
          <li>새 FAQ 작성 / 수정 / 삭제</li>
          <li>카테고리 설정 (회원/주문·결제/배송/교환·반품/기타)</li>
          <li>정렬 순서 및 활성화 설정</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'qna',
    title: 'Q&A 관리',
    icon: MessageCircle,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/qna</code></p>
        <h4 className="font-semibold">주요 기능</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>고객 문의 목록 조회</li>
          <li>답변대기 / 답변완료 필터링</li>
          <li>답변 작성 및 수정</li>
          <li>문의 삭제</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'reviews',
    title: '리뷰 관리',
    icon: Star,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/reviews</code></p>
        <h4 className="font-semibold">주요 기능</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>리뷰 목록 조회</li>
          <li>별점, 답글 상태 필터링</li>
          <li>관리자 답글 작성 / 수정 / 삭제</li>
          <li>리뷰 삭제</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'coupons',
    title: '쿠폰 관리',
    icon: Ticket,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/coupons</code></p>

        <h4 className="font-semibold">쿠폰 목록 아이콘</h4>
        <div className="bg-neutral-50 rounded-lg p-3 text-sm space-y-2">
          <p>📋 <strong>목록:</strong> 발급 현황 보기</p>
          <p>✈️ <strong>발급:</strong> 회원에게 쿠폰 발급</p>
          <p>✏️ <strong>수정:</strong> 쿠폰 정보 수정</p>
          <p>🗑️ <strong>삭제:</strong> 쿠폰 삭제</p>
          <p>👁️ <strong>눈:</strong> 활성/비활성 토글</p>
        </div>

        <h4 className="font-semibold mt-4">쿠폰 발급하기</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>쿠폰 목록에서 <strong>발급 아이콘(✈️)</strong> 클릭</li>
          <li>전체 발급: "전체 회원에게 발급" 버튼 클릭</li>
          <li>선택 발급: 회원 검색 → 체크박스 선택 → "N명에게 발급"</li>
        </ol>
        <p className="text-sm text-blue-600 mt-2">💡 이미 보유한 회원은 중복 발급되지 않습니다.</p>

        <h4 className="font-semibold mt-4">발급 현황 확인하기</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>쿠폰 목록에서 <strong>목록 아이콘(📋)</strong> 클릭</li>
          <li>총 발급, 사용완료, 미사용 현황 확인</li>
          <li>회원별 발급일, 사용 상태 확인</li>
        </ol>

        <h4 className="font-semibold mt-4">쿠폰 회수하기</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>발급 현황에서 회수할 회원 찾기</li>
          <li><strong>회수 아이콘(⊗)</strong> 클릭</li>
          <li>확인 후 쿠폰 회수 완료</li>
        </ol>
        <p className="text-sm text-red-600 mt-2">⚠️ 이미 사용된 쿠폰은 회수할 수 없습니다.</p>
      </div>
    ),
  },
  {
    id: 'home-sections',
    title: '홈 섹션 관리',
    icon: LayoutGrid,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/home-sections</code></p>
        <p>홈페이지의 상품 섹션에 표시될 상품을 관리합니다.</p>
        <h4 className="font-semibold">섹션 종류</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>베스트연구실:</strong> 인기 상품</li>
          <li><strong>신상품연구실:</strong> 신상품</li>
          <li><strong>초특가연구실:</strong> 특가 상품</li>
        </ul>
        <h4 className="font-semibold mt-4">기능</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>상품 추가 (검색 후 선택)</li>
          <li>순서 변경 (▲/▼ 버튼)</li>
          <li>상품 제거</li>
        </ul>
        <p className="text-sm text-amber-600 mt-2">⚠️ 각 섹션에 최대 10개 상품만 등록 가능</p>
      </div>
    ),
  },
  {
    id: 'banner',
    title: '배너 이미지',
    icon: Image,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/settings/banner</code></p>
        <p>홈페이지 상단 배너 이미지를 설정합니다.</p>
        <h4 className="font-semibold">설정 항목</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>배너 표시 ON/OFF</li>
          <li>배너 높이 설정</li>
          <li>이미지 업로드 또는 URL 입력</li>
          <li>대체 텍스트 (접근성)</li>
          <li>클릭 링크</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'modals',
    title: '팝업 모달',
    icon: MessageSquare,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/settings/modals</code></p>
        <h4 className="font-semibold">주요 기능</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>팝업 모달 생성 / 수정 / 삭제</li>
          <li>표시 페이지 선택</li>
          <li>세션당 1회만 표시 옵션</li>
          <li>로그인 회원 전용 옵션</li>
          <li>우선순위 설정</li>
          <li>버튼 텍스트 및 링크 설정</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'tiers',
    title: '등급 설정',
    icon: Crown,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/settings/tiers</code></p>
        <h4 className="font-semibold">자동 등급 시스템</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>자동 등급 시스템 ON/OFF</li>
          <li>자동 승급/강등 설정</li>
          <li>평가 기간 설정 (월간/분기/연간/누적)</li>
        </ul>
        <h4 className="font-semibold mt-4">등급별 설정</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>최소 구매 금액</li>
          <li>할인율, 적립률</li>
          <li>무료배송 여부</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'shipping',
    title: '배송비 설정',
    icon: Truck,
    content: (
      <div className="space-y-4">
        <p><strong>경로:</strong> <code>/admin/settings/shipping</code></p>
        <h4 className="font-semibold">기본 설정</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>기본 배송비</li>
          <li>무료배송 ON/OFF</li>
          <li>무료배송 기준 금액</li>
        </ul>
        <h4 className="font-semibold mt-4">구간별 설정</h4>
        <p className="text-sm">주문 금액에 따라 다른 배송비 적용</p>
        <h4 className="font-semibold mt-4">지역별 설정</h4>
        <p className="text-sm">지역에 따라 추가 배송비 적용</p>
      </div>
    ),
  },
]

export function AdminHelpPage() {
  const [openSections, setOpenSections] = useState<string[]>(['coupons'])

  const toggleSection = (id: string) => {
    setOpenSections(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    )
  }

  const expandAll = () => {
    setOpenSections(sections.map(s => s.id))
  }

  const collapseAll = () => {
    setOpenSections([])
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-neutral-900">관리자 사용 설명서</h1>
        <p className="text-sm text-neutral-500 mt-1">각 메뉴의 기능과 사용 방법을 확인하세요</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={expandAll}
          className="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
        >
          전체 펼치기
        </button>
        <button
          onClick={collapseAll}
          className="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
        >
          전체 접기
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <Card key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors rounded-t-lg"
            >
              <div className="flex items-center gap-3">
                <section.icon className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-neutral-900">{section.title}</span>
              </div>
              {openSections.includes(section.id) ? (
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              )}
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all duration-200',
                openSections.includes(section.id) ? 'max-h-[1000px]' : 'max-h-0'
              )}
            >
              <CardContent className="pt-0 pb-4 px-4 border-t">
                <div className="pt-4 text-neutral-700">
                  {section.content}
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 p-4 bg-neutral-50 rounded-lg text-center">
        <p className="text-sm text-neutral-600">
          문의: <a href="mailto:lee0608min@naver.com" className="text-primary-600 hover:underline">lee0608min@naver.com</a>
        </p>
      </div>
    </div>
  )
}
