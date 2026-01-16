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
      </div>
    </footer>
  )
}
