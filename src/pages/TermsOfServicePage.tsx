import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { Card } from '../components/ui'
import { Animated } from '../hooks'

export function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center">
          <Link to="/" className="hover:text-primary-600">홈</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-medium">이용약관</span>
        </nav>
      </Animated>

      {/* Header */}
      <Animated animation="fade-up" delay={100}>
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">이용약관</h1>
            <p className="text-neutral-500">시행일: 2024년 2월 1일</p>
          </div>
        </div>
      </Animated>

      {/* Content */}
      <Animated animation="fade-up" delay={200}>
        <Card className="p-6 md:p-8">
          <div className="prose prose-neutral max-w-none">
            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제1조 (목적)
              </h2>
              <p className="text-neutral-600">
                이 약관은 가성비연구소(이하 "회사")가 운영하는 인터넷 쇼핑몰(이하 "몰")에서 제공하는
                인터넷 관련 서비스(이하 "서비스")를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을
                규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제2조 (정의)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li><strong>"몰"</strong>이란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 또는 용역을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.</li>
                <li><strong>"이용자"</strong>란 "몰"에 접속하여 이 약관에 따라 "몰"이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                <li><strong>"회원"</strong>이란 "몰"에 회원등록을 한 자로서, 계속적으로 "몰"이 제공하는 서비스를 이용할 수 있는 자를 말합니다.</li>
                <li><strong>"비회원"</strong>이란 회원에 가입하지 않고 "몰"이 제공하는 서비스를 이용하는 자를 말합니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제3조 (약관의 명시와 개정)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>"몰"은 이 약관의 내용과 상호 및 대표자 성명, 영업소 소재지 주소, 전화번호, 이메일주소, 사업자등록번호, 통신판매업 신고번호 등을 이용자가 쉽게 알 수 있도록 "몰"의 초기 서비스화면에 게시합니다.</li>
                <li>"몰"은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」 등 관련 법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
                <li>"몰"이 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 "몰"의 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제4조 (서비스의 제공 및 변경)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>"몰"은 다음과 같은 업무를 수행합니다.
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>재화 또는 용역에 대한 정보 제공 및 구매계약의 체결</li>
                    <li>구매계약이 체결된 재화 또는 용역의 배송</li>
                    <li>기타 "몰"이 정하는 업무</li>
                  </ul>
                </li>
                <li>"몰"은 재화 또는 용역의 품절 또는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 재화 또는 용역의 내용을 변경할 수 있습니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제5조 (서비스의 중단)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>"몰"은 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
                <li>"몰"은 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, "몰"이 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제6조 (회원가입)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>이용자는 "몰"이 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.</li>
                <li>"몰"은 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>가입신청자가 이 약관 제7조 제3항에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                    <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                    <li>기타 회원으로 등록하는 것이 "몰"의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                  </ul>
                </li>
                <li>회원가입계약의 성립 시기는 "몰"의 승낙이 회원에게 도달한 시점으로 합니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제7조 (회원 탈퇴 및 자격 상실 등)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>회원은 "몰"에 언제든지 탈퇴를 요청할 수 있으며 "몰"은 즉시 회원탈퇴를 처리합니다.</li>
                <li>회원이 다음 각 호의 사유에 해당하는 경우, "몰"은 회원자격을 제한 및 정지시킬 수 있습니다.
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                    <li>"몰"을 이용하여 구입한 재화 등의 대금, 기타 "몰" 이용에 관련하여 회원이 부담하는 채무를 기일에 지급하지 않는 경우</li>
                    <li>다른 사람의 "몰" 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
                    <li>"몰"을 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제8조 (회원에 대한 통지)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>"몰"이 회원에 대한 통지를 하는 경우, 회원이 "몰"과 미리 약정하여 지정한 이메일 주소로 할 수 있습니다.</li>
                <li>"몰"은 불특정다수 회원에 대한 통지의 경우 1주일이상 "몰" 게시판에 게시함으로서 개별 통지에 갈음할 수 있습니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제9조 (구매신청)
              </h2>
              <p className="text-neutral-600 mb-3">"몰" 이용자는 "몰"상에서 다음 또는 이와 유사한 방법에 의하여 구매를 신청하며, "몰"은 이용자가 구매신청을 함에 있어서 다음의 각 내용을 알기 쉽게 제공하여야 합니다.</p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-1">
                <li>재화 등의 검색 및 선택</li>
                <li>받는 사람의 성명, 주소, 전화번호 입력</li>
                <li>약관내용, 청약철회권이 제한되는 서비스, 배송료 등의 비용부담과 관련한 내용에 대한 확인</li>
                <li>이 약관에 동의하고 위 사항을 확인하거나 거부하는 표시</li>
                <li>재화 등의 구매신청 및 이에 관한 확인 또는 "몰"의 확인에 대한 동의</li>
                <li>결제방법의 선택</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제10조 (계약의 성립)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>"몰"은 제9조와 같은 구매신청에 대하여 다음 각 호에 해당하면 승낙하지 않을 수 있습니다.
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>신청 내용에 허위, 기재누락, 오기가 있는 경우</li>
                    <li>기타 구매신청에 승낙하는 것이 "몰" 기술상 현저히 지장이 있다고 판단하는 경우</li>
                  </ul>
                </li>
                <li>"몰"의 승낙이 제12조 제1항의 수신확인통지형태로 이용자에게 도달한 시점에 계약이 성립한 것으로 봅니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제11조 (지급방법)
              </h2>
              <p className="text-neutral-600 mb-3">"몰"에서 구매한 재화 또는 용역에 대한 대금지급방법은 다음 각 호의 방법 중 가용한 방법으로 할 수 있습니다.</p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-1">
                <li>신용카드 결제</li>
                <li>실시간 계좌이체</li>
                <li>가상계좌 입금</li>
                <li>기타 전자적 지급 방법에 의한 대금 지급 등</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제12조 (수신확인통지, 구매신청 변경 및 취소)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>"몰"은 이용자의 구매신청이 있는 경우 이용자에게 수신확인통지를 합니다.</li>
                <li>수신확인통지를 받은 이용자는 의사표시의 불일치 등이 있는 경우에는 수신확인통지를 받은 후 즉시 구매신청 변경 및 취소를 요청할 수 있고 "몰"은 배송 전에 이용자의 요청이 있는 경우에는 지체 없이 그 요청에 따라 처리하여야 합니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제13조 (배송)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>"몰"은 이용자가 구매한 재화에 대해 배송수단, 수단별 배송비용 부담자, 수단별 배송기간 등을 명시합니다.</li>
                <li>"몰"은 이용자와 재화의 공급시기에 관하여 별도의 약정이 없는 이상, 이용자가 청약을 한 날부터 7일 이내에 재화 등을 배송할 수 있도록 주문제작, 포장 등 기타의 필요한 조치를 취합니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제14조 (환급)
              </h2>
              <p className="text-neutral-600">
                "몰"은 이용자가 구매 신청한 재화 등이 품절 등의 사유로 인도 또는 제공을 할 수 없을 때에는
                지체 없이 그 사유를 이용자에게 통지하고 사전에 재화 등의 대금을 받은 경우에는 대금을 받은 날부터
                3영업일 이내에 환급하거나 환급에 필요한 조치를 취합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제15조 (청약철회 등)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>"몰"과 재화 등의 구매에 관한 계약을 체결한 이용자는 「전자상거래 등에서의 소비자보호에 관한 법률」 제13조 제2항에 따른 계약내용에 관한 서면을 받은 날(그 서면을 받은 때보다 재화 등의 공급이 늦게 이루어진 경우에는 재화 등을 공급받거나 재화 등의 공급이 시작된 날을 말합니다)부터 7일 이내에는 청약의 철회를 할 수 있습니다.</li>
                <li>이용자는 재화 등을 배송 받은 경우 다음 각 호의 1에 해당하는 경우에는 반품 및 교환을 할 수 없습니다.
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>이용자에게 책임 있는 사유로 재화 등이 멸실 또는 훼손된 경우</li>
                    <li>이용자의 사용 또는 일부 소비에 의하여 재화 등의 가치가 현저히 감소한 경우</li>
                    <li>시간의 경과에 의하여 재판매가 곤란할 정도로 재화 등의 가치가 현저히 감소한 경우</li>
                    <li>복제가 가능한 재화 등의 포장을 훼손한 경우</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제16조 (개인정보보호)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>"몰"은 이용자의 개인정보 수집시 서비스제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다.</li>
                <li>"몰"은 이용자의 개인정보를 수집·이용하는 때에는 당해 이용자에게 그 목적을 고지하고 동의를 받습니다.</li>
                <li>"몰"은 수집된 개인정보를 목적외의 용도로 이용할 수 없으며, 새로운 이용목적이 발생한 경우 또는 제3자에게 제공하는 경우에는 이용·제공단계에서 당해 이용자에게 그 목적을 고지하고 동의를 받습니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제17조 (회사의 의무)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>"몰"은 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로 재화·용역을 제공하는데 최선을 다하여야 합니다.</li>
                <li>"몰"은 이용자가 안전하게 인터넷 서비스를 이용할 수 있도록 이용자의 개인정보(신용정보 포함) 보호를 위한 보안 시스템을 갖추어야 합니다.</li>
                <li>"몰"은 이용자가 원하지 않는 영리목적의 광고성 이메일을 발송하지 않습니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제18조 (회원의 의무)
              </h2>
              <p className="text-neutral-600 mb-3">이용자는 다음 행위를 하여서는 안 됩니다.</p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-1">
                <li>신청 또는 변경시 허위 내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>"몰"에 게시된 정보의 변경</li>
                <li>"몰"이 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>"몰" 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>"몰" 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 "몰"에 공개 또는 게시하는 행위</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제19조 (분쟁해결)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>"몰"은 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
                <li>"몰"은 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 즉시 통보해 드립니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                제20조 (재판권 및 준거법)
              </h2>
              <ul className="list-decimal pl-5 text-neutral-600 space-y-2">
                <li>"몰"과 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.</li>
                <li>"몰"과 이용자 간에 제기된 전자상거래 소송에는 대한민국법을 적용합니다.</li>
              </ul>
            </section>

            <div className="mt-8 pt-6 border-t border-neutral-200">
              <p className="text-neutral-500 text-sm">
                <strong>부칙</strong><br />
                이 약관은 2024년 2월 1일부터 시행합니다.
              </p>
            </div>
          </div>
        </Card>
      </Animated>

      {/* Contact */}
      <Animated animation="fade-up" delay={300}>
        <div className="mt-8 p-6 bg-neutral-50 rounded-lg text-center">
          <p className="text-neutral-600 mb-2">이용약관에 대해 궁금하신 점이 있으신가요?</p>
          <p className="text-sm text-neutral-500">
            이메일 <span className="font-bold text-primary-600">lee0608min@naver.com</span>
          </p>
        </div>
      </Animated>
    </div>
  )
}
