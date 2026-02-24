import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Company Info */}
          <div>
            <h2 className="text-lg font-bold text-white mb-2">가성비연구소</h2>
            <p className="text-sm text-neutral-400">
              전문 도매 쇼핑몰
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-1 text-sm md:text-right">
            <div className="flex items-center gap-2 md:justify-end">
              <Phone className="w-4 h-4 text-primary-400" />
              <span>010-8921-8376</span>
            </div>
            <div className="flex items-center gap-2 md:justify-end">
              <Mail className="w-4 h-4 text-primary-400" />
              <span>lee0608min@naver.com</span>
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
          <Link to="/refund-policy" className="text-neutral-400 hover:text-white transition-colors">
            교환/환불 정책
          </Link>
          <Link to="/shipping-policy" className="text-neutral-400 hover:text-white transition-colors">
            배송 안내
          </Link>
        </div>

        {/* Business Info */}
        <div className="border-t border-neutral-800 mt-4 pt-4">
          <div className="text-xs text-neutral-500 space-y-1">
            <p>
              <span className="text-neutral-400">상호명:</span> 가성비연구소 |{' '}
              <span className="text-neutral-400">대표:</span> 김선애 |{' '}
              <span className="text-neutral-400">사업자등록번호:</span> 597-06-02858
            </p>
            <p>
              <span className="text-neutral-400">사업장소재지:</span> 경기도 남양주시 진건읍 진관로387번길 48
            </p>
            <p>
              <span className="text-neutral-400">연락처:</span> 010-8921-8376 |{' '}
              <span className="text-neutral-400">이메일:</span> lee0608min@naver.com
            </p>
            <p className="text-neutral-600 mt-2">
              © 2026 가성비연구소. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
