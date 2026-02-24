import { Link } from 'react-router-dom'
import { Truck } from 'lucide-react'
import { Card } from '../components/ui'
import { Animated } from '../hooks'

export function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center">
          <Link to="/" className="hover:text-primary-600">홈</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-medium">배송 안내</span>
        </nav>
      </Animated>

      {/* Header */}
      <Animated animation="fade-up" delay={100}>
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <Truck className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">배송 안내</h1>
            <p className="text-neutral-500">시행일: 2024년 2월 1일</p>
          </div>
        </div>
      </Animated>

      {/* Content */}
      <Animated animation="fade-up" delay={200}>
        <Card className="p-6 md:p-8">
          <div className="prose prose-neutral max-w-none">
            <p className="text-neutral-600 mb-6">
              가성비연구소는 고객님께 신속하고 안전한 배송 서비스를 제공하기 위해 최선을 다하고 있습니다.
            </p>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제1조 (배송 기간)
              </h2>
              <div className="bg-primary-50 rounded-lg p-4 mb-4">
                <p className="text-primary-800 font-medium">
                  일반 배송: 결제 완료 후 2~5 영업일 이내 배송
                </p>
              </div>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li><strong>당일 발송:</strong> 평일 오후 2시 이전 결제 완료 시 (재고 보유 상품에 한함)</li>
                <li><strong>일반 배송:</strong> 결제 완료 후 2~5 영업일</li>
                <li><strong>대량 주문:</strong> 수량에 따라 3~7 영업일 (별도 안내)</li>
                <li><strong>도서/산간 지역:</strong> 일반 배송 + 1~2 영업일 추가 소요</li>
              </ul>
              <p className="text-sm text-neutral-500 mt-3">
                * 주말, 공휴일은 영업일에서 제외됩니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제2조 (배송비 안내)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-100">
                      <th className="border border-neutral-200 px-4 py-2 text-left font-medium">구분</th>
                      <th className="border border-neutral-200 px-4 py-2 text-left font-medium">배송비</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-600">
                    <tr>
                      <td className="border border-neutral-200 px-4 py-2">기본 배송비</td>
                      <td className="border border-neutral-200 px-4 py-2">3,000원</td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-200 px-4 py-2">무료 배송 기준</td>
                      <td className="border border-neutral-200 px-4 py-2 text-primary-600 font-medium">50,000원 이상 구매 시 무료</td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-200 px-4 py-2">도서/산간 지역</td>
                      <td className="border border-neutral-200 px-4 py-2">추가 배송비 발생 (지역별 상이)</td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-200 px-4 py-2">제주도</td>
                      <td className="border border-neutral-200 px-4 py-2">추가 3,000원</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-neutral-500 mt-3">
                * B2B 회원 등급에 따라 무료 배송 기준이 달라질 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제3조 (배송 방법)
              </h2>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li><strong>택배 배송:</strong> CJ대한통운, 로젠택배 등 (상품에 따라 상이)</li>
                <li><strong>화물 배송:</strong> 대량 주문 또는 부피가 큰 상품의 경우</li>
                <li><strong>직접 수령:</strong> 사전 협의 후 방문 수령 가능</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제4조 (배송 조회)
              </h2>
              <p className="text-neutral-600 mb-3">
                상품 발송 시 등록하신 연락처로 송장번호가 발송됩니다.
              </p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li>마이페이지 → 주문내역에서 배송 조회 가능</li>
                <li>택배사 홈페이지에서 송장번호로 직접 조회 가능</li>
                <li>배송 관련 문의: lee0608min@naver.com</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제5조 (배송 지연 안내)
              </h2>
              <p className="text-neutral-600 mb-3">
                아래의 경우 배송이 지연될 수 있습니다.
              </p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li>재고 부족으로 인한 상품 입고 대기</li>
                <li>천재지변, 기상악화 등 불가항력적인 상황</li>
                <li>명절, 연휴 등 택배사 물량 폭주 시기</li>
                <li>주소 오류 또는 수령인 부재</li>
              </ul>
              <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                <p className="text-yellow-800 text-sm">
                  배송 지연이 예상되는 경우, 사전에 고객님께 개별 안내드립니다.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제6조 (B2B 대량 주문 배송)
              </h2>
              <p className="text-neutral-600 mb-3">
                B2B 대량 주문의 경우, 별도의 배송 정책이 적용됩니다.
              </p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li>주문 수량에 따라 배송 기간이 조정될 수 있습니다.</li>
                <li>화물 배송이 필요한 경우 별도 협의가 필요합니다.</li>
                <li>정기 배송 계약이 가능합니다. (담당자 문의)</li>
                <li>대량 주문 시 배송비 할인 혜택이 제공될 수 있습니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제7조 (수령 시 유의사항)
              </h2>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li>상품 수령 시 외관 상태를 반드시 확인해 주세요.</li>
                <li>파손이나 이상이 있는 경우, 수령 거부 후 고객센터로 연락해 주세요.</li>
                <li>부재 시 경비실 또는 문 앞 배송을 원하시면 주문 시 요청사항에 기재해 주세요.</li>
                <li>상품 수령 후 7일 이내 이상 여부를 확인해 주세요.</li>
              </ul>
            </section>
          </div>
        </Card>
      </Animated>

      {/* Contact */}
      <Animated animation="fade-up" delay={300}>
        <div className="mt-8 p-6 bg-neutral-50 rounded-lg text-center">
          <p className="text-neutral-600 mb-2">배송 관련 문의사항이 있으신가요?</p>
          <p className="text-sm text-neutral-500">
            이메일 <span className="font-bold text-primary-600">lee0608min@naver.com</span>
          </p>
        </div>
      </Animated>
    </div>
  )
}
