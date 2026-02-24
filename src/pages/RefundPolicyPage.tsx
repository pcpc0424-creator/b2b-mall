import { Link } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { Card } from '../components/ui'
import { Animated } from '../hooks'

export function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center">
          <Link to="/" className="hover:text-primary-600">홈</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-medium">교환/환불 정책</span>
        </nav>
      </Animated>

      {/* Header */}
      <Animated animation="fade-up" delay={100}>
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <RotateCcw className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">교환/환불 정책</h1>
            <p className="text-neutral-500">시행일: 2024년 2월 1일</p>
          </div>
        </div>
      </Animated>

      {/* Content */}
      <Animated animation="fade-up" delay={200}>
        <Card className="p-6 md:p-8">
          <div className="prose prose-neutral max-w-none">
            <p className="text-neutral-600 mb-6">
              가성비연구소(이하 "회사")는 고객님의 만족을 위해 다음과 같은 교환/환불 정책을 운영하고 있습니다.
              전자상거래 등에서의 소비자보호에 관한 법률에 따라 고객님의 권리를 보장해 드립니다.
            </p>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제1조 (교환/반품 신청 기간)
              </h2>
              <div className="bg-primary-50 rounded-lg p-4 mb-4">
                <p className="text-primary-800 font-medium">
                  상품 수령일로부터 7일 이내에 교환/반품 신청이 가능합니다.
                </p>
              </div>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li>단순 변심에 의한 교환/반품: 상품 수령 후 7일 이내</li>
                <li>상품 하자 또는 오배송: 상품 수령 후 30일 이내</li>
                <li>신청 방법: 고객센터 연락 또는 1:1 문의 게시판</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제2조 (교환/반품이 가능한 경우)
              </h2>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li>배송된 상품이 주문 내용과 다른 경우</li>
                <li>상품이 파손되거나 불량인 경우</li>
                <li>상품의 내용이 표시·광고 내용과 다른 경우</li>
                <li>단순 변심으로 인한 교환/반품 (미개봉 상품에 한함)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제3조 (교환/반품이 불가능한 경우)
              </h2>
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium">
                  아래의 경우에는 교환/반품이 제한될 수 있습니다.
                </p>
              </div>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li>고객님의 책임 있는 사유로 상품이 훼손된 경우 (단, 상품 확인을 위한 포장 훼손은 제외)</li>
                <li>고객님의 사용 또는 일부 소비로 상품의 가치가 현저히 감소한 경우</li>
                <li>시간이 지나 재판매가 곤란할 정도로 상품의 가치가 현저히 감소한 경우</li>
                <li>복제가 가능한 상품 등의 포장을 훼손한 경우</li>
                <li>주문에 따라 개별적으로 생산되는 상품 등의 경우</li>
                <li>B2B 대량 주문으로 특별 할인이 적용된 상품의 경우 (별도 협의 필요)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제4조 (교환/반품 배송비)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-100">
                      <th className="border border-neutral-200 px-4 py-2 text-left font-medium">구분</th>
                      <th className="border border-neutral-200 px-4 py-2 text-left font-medium">배송비 부담</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-600">
                    <tr>
                      <td className="border border-neutral-200 px-4 py-2">상품 불량/오배송</td>
                      <td className="border border-neutral-200 px-4 py-2 text-primary-600 font-medium">판매자 부담 (무료)</td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-200 px-4 py-2">단순 변심</td>
                      <td className="border border-neutral-200 px-4 py-2">구매자 부담 (왕복 배송비)</td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-200 px-4 py-2">사이즈/색상 교환</td>
                      <td className="border border-neutral-200 px-4 py-2">구매자 부담 (왕복 배송비)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-neutral-500 mt-3">
                * 배송비는 상품 및 배송 지역에 따라 달라질 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제5조 (환불 절차 및 기간)
              </h2>
              <ol className="list-decimal pl-5 text-neutral-600 space-y-3">
                <li>
                  <strong>반품 신청:</strong> 고객센터 또는 1:1 문의를 통해 반품 신청
                </li>
                <li>
                  <strong>상품 회수:</strong> 지정된 택배사를 통해 상품 회수 (회수 주소 별도 안내)
                </li>
                <li>
                  <strong>상품 검수:</strong> 반품 상품 도착 후 1~3 영업일 내 검수 진행
                </li>
                <li>
                  <strong>환불 처리:</strong> 검수 완료 후 3~5 영업일 내 환불 처리
                </li>
              </ol>
              <div className="bg-neutral-50 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-neutral-900 mb-2">결제 수단별 환불 방법</h3>
                <ul className="text-neutral-600 text-sm space-y-1">
                  <li>• 신용카드: 카드 결제 취소 (카드사 사정에 따라 3~7 영업일 소요)</li>
                  <li>• 계좌이체/무통장입금: 환불 계좌로 입금</li>
                  <li>• 간편결제: 해당 결제 수단으로 환불</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제6조 (B2B 대량 주문 교환/환불)
              </h2>
              <p className="text-neutral-600 mb-3">
                B2B 대량 주문의 경우, 아래와 같이 별도의 정책이 적용될 수 있습니다.
              </p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li>대량 주문 시 사전에 샘플 확인을 권장합니다.</li>
                <li>특별 할인이 적용된 대량 주문의 경우, 부분 환불 시 할인율이 조정될 수 있습니다.</li>
                <li>주문 제작 상품의 경우 제작 진행 후에는 교환/환불이 불가합니다.</li>
                <li>대량 주문 관련 교환/환불은 담당자와 별도 협의가 필요합니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제7조 (반품 시 유의사항)
              </h2>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li>상품의 택(Tag), 라벨 등을 제거하지 마세요.</li>
                <li>상품 및 구성품을 분실하지 않도록 주의해 주세요.</li>
                <li>반품 시 상품과 함께 받으신 모든 구성품을 함께 보내주세요.</li>
                <li>상품 포장은 배송 시 파손되지 않도록 안전하게 포장해 주세요.</li>
                <li>착불 발송 시 반품이 거부될 수 있습니다. (단, 상품 하자/오배송 제외)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제8조 (분쟁 해결)
              </h2>
              <p className="text-neutral-600 mb-3">
                교환/환불과 관련하여 분쟁이 발생한 경우, 회사와 고객은 원만한 해결을 위해 성실히 협의합니다.
                협의가 이루어지지 않을 경우, 전자상거래 등에서의 소비자보호에 관한 법률 및 관련 법령에 따라 처리합니다.
              </p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li>소비자상담센터: 1372 (공정거래위원회)</li>
                <li>전자거래분쟁조정위원회: www.ecmc.or.kr</li>
              </ul>
            </section>
          </div>
        </Card>
      </Animated>

      {/* Contact */}
      <Animated animation="fade-up" delay={300}>
        <div className="mt-8 p-6 bg-neutral-50 rounded-lg text-center">
          <p className="text-neutral-600 mb-2">교환/환불 관련 문의사항이 있으신가요?</p>
          <p className="text-sm text-neutral-500">
            이메일 <span className="font-bold text-primary-600">lee0608min@naver.com</span>
          </p>
        </div>
      </Animated>
    </div>
  )
}
