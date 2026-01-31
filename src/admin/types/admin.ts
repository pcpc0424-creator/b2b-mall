import { Product, UserTier, Promotion, SocialProvider } from '../../types'

// 관리자 사용자
export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'manager'
  permissions: AdminPermission[]
  createdAt: Date
  lastLoginAt?: Date
}

export type AdminPermission =
  | 'products:read' | 'products:write' | 'products:delete'
  | 'orders:read' | 'orders:write'
  | 'members:read' | 'members:write'
  | 'settings:read' | 'settings:write'

// 상품 옵션 (스마트스토어 스타일)
export interface ProductOptionAdmin {
  id: string
  name: string              // 옵션명 (사이즈, 색상 등)
  values: OptionValue[]
  required: boolean
  displayOrder: number
}

export interface OptionValue {
  id: string
  value: string             // 옵션값 (S, M, L 또는 빨강, 파랑)
  priceModifier: number     // 추가금액 (+0, +1000, -500)
  stockModifier?: number
  isDefault: boolean
  image?: string            // 옵션 이미지 (base64 또는 URL)
}

// 수량별 할인 설정
export interface QuantityDiscount {
  id: string
  quantity: number          // 구매 수량
  discountPercent: number   // 할인율 (%)
  discountPrice?: number    // 또는 고정 할인가
  label?: string            // 표시 라벨 (예: "최저가", "인기")
}

// 옵션 조합으로 생성된 변형 상품
export interface ProductVariant {
  id: string
  sku: string                         // 조합 SKU (GF-001-S-RED)
  optionCombination: Record<string, string>  // { "사이즈": "S", "색상": "빨강" }
  price: number
  stock: number
  isActive: boolean
  images?: string[]
}

// 상품별 배송비 설정
export interface ProductShipping {
  type: 'free' | 'paid' | 'conditional'  // 무료배송, 유료배송, 조건부무료
  fee?: number                            // 배송비 (유료일 때)
  freeCondition?: number                  // 조건부무료 기준금액
  bundleShipping?: boolean                // 묶음배송 가능 여부
}

// 관리자용 확장 상품
export interface AdminProduct extends Product {
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  adminOptions?: ProductOptionAdmin[]
  variants?: ProductVariant[]
  shipping?: ProductShipping              // 상품별 배송비 설정
  description?: string                    // 상품 상세 설명 (HTML)
  detailImages?: string[]                 // 상세 페이지 이미지들
  showOptionImages?: boolean              // 옵션 이미지 표시 여부
  quantityDiscounts?: QuantityDiscount[]  // 수량별 할인 설정
}

// 배송비 설정
export interface ShippingSettings {
  id: string
  name: string
  type: 'free' | 'flat' | 'tiered' | 'regional'
  isDefault: boolean
  baseFee: number
  freeShippingThreshold?: number
  tiers?: ShippingTier[]
  regions?: RegionalShipping[]
  createdAt: Date
  updatedAt: Date
}

export interface ShippingTier {
  id: string
  minAmount: number
  maxAmount: number
  fee: number
}

export interface RegionalShipping {
  id: string
  region: string
  fee: number
}

// 주문 관련
export type OrderStatus =
  | 'pending'           // 주문접수
  | 'confirmed'         // 주문확인
  | 'preparing'         // 상품준비중
  | 'shipped'           // 배송중
  | 'delivered'         // 배송완료
  | 'cancelled'         // 취소
  | 'refunded'          // 환불

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user: OrderUser
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  totalAmount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  shippingAddress: ShippingAddress
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productSku: string
  variantId?: string
  selectedOptions?: Record<string, string>
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface OrderUser {
  id: string
  name: string
  email: string
  company?: string
  tier: UserTier
}

export interface ShippingAddress {
  recipient: string
  phone: string
  postalCode: string
  address1: string
  address2?: string
}

// 회원 관리
export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'pending_approval' | 'withdrawn'

export interface MemberListItem {
  id: string
  name: string
  email: string
  company?: string
  businessNumber?: string
  tier: UserTier
  status: MemberStatus
  totalOrders: number
  totalSpent: number
  createdAt: Date
  lastOrderAt?: Date
  provider?: SocialProvider  // 가입 경로 (카카오, 네이버, 구글, 이메일)
}

export interface TierChangeHistory {
  id: string
  userId: string
  previousTier: UserTier
  newTier: UserTier
  reason: string
  changedBy: string
  changedAt: Date
}

// 대시보드 통계
export interface AdminDashboardStats {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  lowStockProducts: number
  newMembers: number
  recentOrders: Order[]
}

// 페이지네이션 & 필터
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ProductFilters {
  search?: string
  categoryId?: number
  stockStatus?: 'available' | 'low' | 'out_of_stock'
  isActive?: boolean
}

export interface OrderFilters {
  search?: string
  status?: OrderStatus
  dateFrom?: Date
  dateTo?: Date
  userId?: string
}

export interface MemberFilters {
  search?: string
  tier?: UserTier
  status?: MemberStatus
  dateFrom?: Date
  dateTo?: Date
}

// 관리자용 확장 프로모션
export interface AdminPromotion extends Promotion {
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

export interface PromotionFilters {
  search?: string
  type?: 'all' | 'timesale' | 'exclusive'
  isActive?: boolean
}

// 팝업 모달 설정
export type ModalTargetPage =
  | 'home'           // 메인 페이지
  | 'products'       // 상품 목록
  | 'product-detail' // 상품 상세
  | 'cart'           // 장바구니
  | 'login'          // 로그인
  | 'register'       // 회원가입
  | 'all'            // 전체 페이지

export interface PopupModal {
  id: string
  title: string                    // 모달 제목
  content: string                  // 모달 내용 (HTML 지원)
  image?: string                   // 이미지 URL 또는 base64
  isActive: boolean                // 활성화 여부
  targetPages: ModalTargetPage[]   // 표시할 페이지들
  showOnce: boolean                // 한 번만 표시 (세션당)
  showToLoggedInOnly: boolean      // 로그인 회원에게만 표시
  buttonText?: string              // 버튼 텍스트 (없으면 닫기만)
  buttonLink?: string              // 버튼 클릭 시 이동할 링크
  startDate?: Date                 // 시작일 (없으면 즉시)
  endDate?: Date                   // 종료일 (없으면 무기한)
  priority: number                 // 우선순위 (높을수록 먼저 표시)
  createdAt: Date
  updatedAt: Date
}

// 회원 등급 설정
export interface TierThreshold {
  tier: UserTier
  minPurchaseAmount: number  // 누적 구매 금액 기준
  discountRate: number       // 할인율 (%)
  pointRate: number          // 적립률 (%)
  freeShipping: boolean      // 무료 배송 여부
}

export interface TierSettings {
  isEnabled: boolean                    // 자동 등급 시스템 활성화 여부
  autoUpgrade: boolean                  // 자동 등급 승급 활성화
  autoDowngrade: boolean                // 자동 등급 강등 활성화
  evaluationPeriod: 'monthly' | 'quarterly' | 'yearly' | 'cumulative'  // 평가 기간
  thresholds: TierThreshold[]           // 등급별 기준
  updatedAt: Date
}

// 홈 섹션 관리
export type HomeSectionType = 'best' | 'new' | 'sale'

export interface HomeSection {
  id: string
  sectionType: HomeSectionType
  productId: string
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

// 사이트 설정 (배너 등)
export interface SiteSettings {
  topBanner: {
    image: string            // 이미지 URL 또는 base64
    alt: string              // 대체 텍스트
    link?: string            // 클릭 시 이동할 링크
    isActive: boolean        // 배너 표시 여부
    height?: number          // 배너 높이 (px), 0이면 auto
  }
  updatedAt: Date
}
