import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Company Info */}
          <div>
            <h2 className="text-lg font-bold text-white mb-2">가성비연구소</h2>
            <p className="text-sm text-neutral-400">
              전문 도매 쇼핑몰<br />
              대량 주문, 견적서 발행, 등급별 할인 혜택
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-1 text-sm md:text-right">
            <div className="flex items-center gap-2 md:justify-end">
              <Phone className="w-4 h-4 text-primary-400" />
              <span>1588-0000</span>
            </div>
            <div className="flex items-center gap-2 md:justify-end">
              <Mail className="w-4 h-4 text-primary-400" />
              <span>contact@joengdam.co.kr</span>
            </div>
            <div className="flex items-center gap-2 md:justify-end">
              <MapPin className="w-4 h-4 text-primary-400" />
              <span>서울특별시 강남구 테헤란로 123</span>
            </div>
          </div>
        </div>

        {/* Policy Links */}
        <div className="border-t border-neutral-800 mt-6 pt-4 flex flex-wrap gap-4 text-sm">
          <Link to="/terms-of-service" className="text-neutral-400 hover:text-white transition-colors">
            이용약관
          </Link>
          <Link to="/privacy-policy" className="text-neutral-400 hover:text-white transition-colors">
            개인정보 처리방침
          </Link>
        </div>

        {/* Business Info */}
        <div className="border-t border-neutral-800 mt-4 pt-4">
          <div className="text-xs text-neutral-500 space-y-1">
            <p>
              <span className="text-neutral-400">상호명:</span> 정담 |{' '}
              <span className="text-neutral-400">대표:</span> 김선애 |{' '}
              <span className="text-neutral-400">사업자등록번호:</span> 597-06-02858
            </p>
            <p>
              <span className="text-neutral-400">사업장소재지:</span> 경기도 남양주시 진건읍 진관로387번길 48 |{' '}
              <span className="text-neutral-400">이메일:</span> lee0608min@naver.com
            </p>
            <p className="text-neutral-600 mt-2">
              © 2023 정담. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
