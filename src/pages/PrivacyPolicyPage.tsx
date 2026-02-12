import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { Card } from '../components/ui'
import { Animated } from '../hooks'

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center">
          <Link to="/" className="hover:text-primary-600">홈</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-medium">개인정보 처리방침</span>
        </nav>
      </Animated>

      {/* Header */}
      <Animated animation="fade-up" delay={100}>
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">개인정보 처리방침</h1>
            <p className="text-neutral-500">시행일: 2024년 2월 1일</p>
          </div>
        </div>
      </Animated>

      {/* Content */}
      <Animated animation="fade-up" delay={200}>
        <Card className="p-6 md:p-8">
          <div className="prose prose-neutral max-w-none">
            <p className="text-neutral-600 mb-6">
              가성비연구소(이하 "회사")는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고
              개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.
            </p>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제1조 (개인정보의 수집 및 이용 목적)
              </h2>
              <p className="text-neutral-600 mb-3">회사는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li><strong>회원 가입 및 관리:</strong> 회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정 이용 방지, 가입 의사 확인, 연령확인, 불만처리 등 민원처리</li>
                <li><strong>재화 또는 서비스 제공:</strong> 물품배송, 서비스 제공, 계약서·청구서 발송, 본인인증, 구매 및 요금 결제, 요금추심</li>
                <li><strong>마케팅 및 광고에의 활용:</strong> 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제2조 (수집하는 개인정보 항목)
              </h2>
              <p className="text-neutral-600 mb-3">회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>

              <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-neutral-900 mb-2">필수 수집 항목</h3>
                <p className="text-neutral-600">이메일, 비밀번호, 이름, 연락처</p>
              </div>

              <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-neutral-900 mb-2">선택 수집 항목</h3>
                <p className="text-neutral-600">배송지 주소, 회사명, 사업자등록번호</p>
              </div>

              <div className="bg-neutral-50 rounded-lg p-4">
                <h3 className="font-medium text-neutral-900 mb-2">자동 수집 항목</h3>
                <p className="text-neutral-600">IP주소, 쿠키, 방문 일시, 서비스 이용 기록, 불량 이용 기록</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제3조 (개인정보의 보유 및 이용기간)
              </h2>
              <p className="text-neutral-600 mb-3">
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은
                개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간까지)</li>
                <li><strong>계약 또는 청약철회 등에 관한 기록:</strong> 5년 (전자상거래법)</li>
                <li><strong>대금결제 및 재화 등의 공급에 관한 기록:</strong> 5년 (전자상거래법)</li>
                <li><strong>소비자 불만 또는 분쟁처리에 관한 기록:</strong> 3년 (전자상거래법)</li>
                <li><strong>웹사이트 방문기록:</strong> 3개월 (통신비밀보호법)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제4조 (개인정보의 제3자 제공)
              </h2>
              <p className="text-neutral-600 mb-3">
                회사는 원칙적으로 이용자의 개인정보를 제1조에서 명시한 목적 범위 내에서 처리하며,
                이용자의 사전 동의 없이는 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.
              </p>
              <p className="text-neutral-600">다만, 아래의 경우에는 예외로 합니다:</p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2 mt-2">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제5조 (개인정보 처리의 위탁)
              </h2>
              <p className="text-neutral-600 mb-3">
                회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-100">
                      <th className="border border-neutral-200 px-4 py-2 text-left font-medium">수탁업체</th>
                      <th className="border border-neutral-200 px-4 py-2 text-left font-medium">위탁 업무 내용</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-600">
                    <tr>
                      <td className="border border-neutral-200 px-4 py-2">택배사</td>
                      <td className="border border-neutral-200 px-4 py-2">상품 배송</td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-200 px-4 py-2">PG사(결제대행사)</td>
                      <td className="border border-neutral-200 px-4 py-2">결제 처리</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제6조 (정보주체의 권리·의무 및 행사방법)
              </h2>
              <p className="text-neutral-600 mb-3">이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리정지 요구</li>
              </ul>
              <p className="text-neutral-600 mt-3">
                위 권리 행사는 회사에 대해 서면, 전화, 이메일 등을 통하여 하실 수 있으며
                회사는 이에 대해 지체 없이 조치하겠습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제7조 (개인정보의 파기)
              </h2>
              <p className="text-neutral-600 mb-3">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
                지체없이 해당 개인정보를 파기합니다.
              </p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li><strong>전자적 파일 형태:</strong> 복원이 불가능한 방법으로 영구 삭제</li>
                <li><strong>종이에 출력된 개인정보:</strong> 분쇄기로 분쇄하거나 소각</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제8조 (개인정보의 안전성 확보 조치)
              </h2>
              <p className="text-neutral-600 mb-3">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                <li><strong>관리적 조치:</strong> 내부관리계획 수립·시행, 정기적 직원 교육</li>
                <li><strong>기술적 조치:</strong> 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
                <li><strong>물리적 조치:</strong> 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제9조 (개인정보 보호책임자)
              </h2>
              <p className="text-neutral-600 mb-3">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의
                불만처리 및 피해구제를 처리하기 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-neutral-600"><strong>개인정보 보호책임자</strong></p>
                <p className="text-neutral-600">이메일: privacy@gasungbi.com</p>
                <p className="text-neutral-600">고객센터: 1588-0000</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제10조 (개인정보 처리방침의 변경)
              </h2>
              <p className="text-neutral-600">
                이 개인정보 처리방침은 2024년 2월 1일부터 적용됩니다.
                법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터
                공지사항을 통하여 고지할 것입니다.
              </p>
            </section>
          </div>
        </Card>
      </Animated>

      {/* Contact */}
      <Animated animation="fade-up" delay={300}>
        <div className="mt-8 p-6 bg-neutral-50 rounded-lg text-center">
          <p className="text-neutral-600 mb-2">개인정보 관련 문의사항이 있으신가요?</p>
          <p className="text-sm text-neutral-500">
            고객센터 <span className="font-bold text-primary-600">1588-0000</span> (평일 09:00~18:00)
          </p>
        </div>
      </Animated>
    </div>
  )
}
