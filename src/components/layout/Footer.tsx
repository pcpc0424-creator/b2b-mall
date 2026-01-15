import { Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">가성비연구소</h2>
            <p className="text-sm text-neutral-400 mb-4">
              전문 도매 쇼핑몰<br />
              대량 주문, 견적서 발행, 등급별 할인 혜택
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>1588-0000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>contact@joengdam.co.kr</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>서울특별시 강남구 테헤란로 123</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4">이용 안내</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">회원가입 안내</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">등급 혜택 안내</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">주문/배송 안내</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">교환/반품 안내</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">세금계산서 발행</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4">고객 서비스</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">공지사항</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">자주 묻는 질문</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">1:1 문의</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">대량 주문 문의</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">파트너 제휴 문의</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-neutral-500">
              <p>상호: (주)정담 | 대표자: 홍길동 | 사업자등록번호: 123-45-67890</p>
              <p>통신판매업신고: 제2024-서울강남-0000호</p>
            </div>
            <div className="flex gap-4 text-xs text-neutral-500">
              <a href="#" className="hover:text-neutral-300">이용약관</a>
              <a href="#" className="hover:text-neutral-300 font-bold">개인정보처리방침</a>
              <a href="#" className="hover:text-neutral-300">사업자정보확인</a>
            </div>
          </div>
          <p className="text-center text-xs text-neutral-600 mt-4">
            © 2024 가성비연구소. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
