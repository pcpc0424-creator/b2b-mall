import { Category, Product, Promotion, User, SalesData, Notice, Review, Coupon } from '../types'

export const categories: Category[] = [
  {
    id: 1,
    name: "가공식품",
    icon: "Package",
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&h=300&fit=crop",
    subcategories: ["즉석식품", "면/통조림", "양념/소스", "음료/차", "과자/간식"]
  },
  {
    id: 2,
    name: "신선식품",
    icon: "Leaf",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    subcategories: ["과일", "채소", "육류", "수산물", "유제품/계란"]
  },
  {
    id: 3,
    name: "건강식품",
    icon: "Pill",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop",
    subcategories: ["홍삼/녹용/인삼", "비타민/미네랄", "영양제", "다이어트/이너뷰티", "건강환/즙/분말/음료"]
  },
  {
    id: 4,
    name: "뷰티",
    icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
    subcategories: ["스킨케어", "마스크팩", "헤어케어", "바디케어", "메이크업"]
  },
  {
    id: 5,
    name: "패션의류/잡화",
    icon: "Shirt",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=300&fit=crop",
    subcategories: ["남성의류", "여성의류", "신발", "가방", "액세서리"]
  },
  {
    id: 6,
    name: "생활/주방",
    icon: "ChefHat",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    subcategories: ["주방용품", "생활용품", "욕실용품", "청소용품", "수납/정리"]
  },
  {
    id: 7,
    name: "가전",
    icon: "Refrigerator",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    subcategories: ["주방가전", "생활가전", "계절가전", "뷰티가전", "건강가전"]
  },
  {
    id: 8,
    name: "디지털/PC",
    icon: "Monitor",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
    subcategories: ["컴퓨터", "모니터", "주변기기", "저장장치", "네트워크"]
  },
  {
    id: 9,
    name: "스포츠/레저",
    icon: "Dumbbell",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop",
    subcategories: ["운동용품", "등산/캠핑", "수영/수상", "자전거", "골프"]
  },
  {
    id: 10,
    name: "반려동물용품",
    icon: "PawPrint",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
    subcategories: ["강아지용품", "고양이용품", "사료/간식", "위생용품", "장난감"]
  }
]

export const products: Product[] = [
  {
    id: "p1",
    sku: "GF-001",
    name: "프리미엄 홍삼정과 선물세트",
    brand: "정관장",
    categoryId: 1,
    images: [
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop"
    ],
    prices: { retail: 89000, member: 80000, premium: 75000, vip: 69000 },
    minQuantity: 1,
    stock: 500,
    stockStatus: 'available',
    options: [
      { id: 'opt-1', name: '구성', values: ['기본구성', '추가구성', '프리미엄구성'] },
      { id: 'opt-2', name: '수량단위', values: ['개별', '박스(10개입)', '박스(20개입)'] }
    ]
  },
  {
    id: "p2",
    sku: "GF-002",
    name: "6년근 홍삼 농축액 세트",
    brand: "정관장",
    categoryId: 1,
    images: ["https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&h=600&fit=crop"],
    prices: { retail: 150000, member: 135000, premium: 127000, vip: 120000 },
    minQuantity: 1,
    stock: 320,
    stockStatus: 'available',
    options: [
      { id: 'opt-1', name: '용량', values: ['30ml x 10포', '30ml x 20포', '30ml x 30포'] },
      { id: 'opt-2', name: '포장', values: ['일반포장', '선물포장', '프리미엄포장'] }
    ]
  },
  {
    id: "p3",
    sku: "GF-003",
    name: "명품 견과류 선물세트",
    brand: "자연담음",
    categoryId: 1,
    images: ["https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&h=600&fit=crop"],
    prices: { retail: 45000, member: 40000, premium: 38000, vip: 35000 },
    minQuantity: 5,
    stock: 1200,
    stockStatus: 'available'
  },
  {
    id: "p4",
    sku: "BT-001",
    name: "프리미엄 스킨케어 4종 세트",
    brand: "아모레퍼시픽",
    categoryId: 3,
    images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop"],
    prices: { retail: 128000, member: 115000, premium: 108000, vip: 99000 },
    minQuantity: 3,
    stock: 85,
    stockStatus: 'low',
    options: [
      { id: 'opt-1', name: '피부타입', values: ['지성', '건성', '복합성', '민감성'] },
      { id: 'opt-2', name: '사이즈', values: ['기본', '대용량'] }
    ]
  },
  {
    id: "p5",
    sku: "BT-002",
    name: "고급 마스크팩 30매입",
    brand: "메디힐",
    categoryId: 3,
    images: ["https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop"],
    prices: { retail: 35000, member: 31500, premium: 29500, vip: 27000 },
    minQuantity: 10,
    stock: 2500,
    stockStatus: 'available'
  },
  {
    id: "p6",
    sku: "FD-001",
    name: "제주 감귤 선물세트 5kg",
    brand: "제주청과",
    categoryId: 4,
    images: ["https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=600&fit=crop"],
    prices: { retail: 55000, member: 49500, premium: 46000, vip: 42000 },
    minQuantity: 5,
    stock: 0,
    stockStatus: 'out_of_stock'
  },
  {
    id: "p7",
    sku: "HM-001",
    name: "스테인리스 냄비 3종 세트",
    brand: "해피콜",
    categoryId: 2,
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop"],
    prices: { retail: 189000, member: 170000, premium: 160000, vip: 149000 },
    minQuantity: 1,
    stock: 150,
    stockStatus: 'available'
  },
  {
    id: "p8",
    sku: "HF-001",
    name: "비타민C 1000mg 180정",
    brand: "뉴트리",
    categoryId: 5,
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop"],
    prices: { retail: 32000, member: 28800, premium: 27000, vip: 25000 },
    minQuantity: 10,
    stock: 3200,
    stockStatus: 'available'
  },
  {
    id: "p9",
    sku: "KD-001",
    name: "프리미엄 학용품 세트",
    brand: "모닝글로리",
    categoryId: 6,
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop"],
    prices: { retail: 25000, member: 22500, premium: 21000, vip: 19000 },
    minQuantity: 20,
    stock: 4500,
    stockStatus: 'available'
  },
  {
    id: "p10",
    sku: "PT-001",
    name: "프리미엄 강아지 사료 15kg",
    brand: "로얄캐닌",
    categoryId: 7,
    images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop"],
    prices: { retail: 89000, member: 80000, premium: 75000, vip: 69000 },
    minQuantity: 3,
    stock: 280,
    stockStatus: 'available'
  },
  {
    id: "p11",
    sku: "DG-001",
    name: "블루투스 이어폰 프로",
    brand: "삼성",
    categoryId: 8,
    images: ["https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=600&fit=crop"],
    prices: { retail: 199000, member: 179000, premium: 169000, vip: 155000 },
    minQuantity: 5,
    stock: 420,
    stockStatus: 'available'
  },
  {
    id: "p12",
    sku: "GF-004",
    name: "도라지정과 프리미엄 세트",
    brand: "한방명가",
    categoryId: 1,
    images: ["https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=600&h=600&fit=crop"],
    prices: { retail: 68000, member: 61000, premium: 57000, vip: 52000 },
    minQuantity: 3,
    stock: 180,
    stockStatus: 'available'
  },
]

export const promotions: Promotion[] = [
  {
    id: "promo1",
    title: "설 명절 대전",
    description: "명절 선물세트 최대 30% 할인",
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=400&fit=crop",
    discount: 30,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-10'),
    targetTiers: ['guest', 'member', 'premium', 'vip'],
    type: 'all',
    isActive: true
  },
  {
    id: "promo2",
    title: "VIP 전용 특가",
    description: "VIP 고객님을 위한 특별 할인",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop",
    discount: 40,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    targetTiers: ['vip'],
    type: 'exclusive',
    isActive: true
  },
  {
    id: "promo3",
    title: "타임특가 - 건강식품",
    description: "오늘만! 건강식품 50% 할인",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&h=400&fit=crop",
    discount: 50,
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-01-20'),
    targetTiers: ['member', 'premium', 'vip'],
    type: 'timesale',
    isActive: true
  },
  {
    id: "promo4",
    title: "우수회원 전용 혜택",
    description: "우수회원 이상 추가 15% 할인",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop",
    discount: 15,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    targetTiers: ['premium', 'vip'],
    type: 'exclusive',
    isActive: true
  }
]

export const mockUser: User = {
  id: "u1",
  name: "김정담",
  email: "jd.kim@email.com",
  tier: "vip",
  provider: "email",
  createdAt: new Date('2023-01-15'),
  lastLoginAt: new Date(),
  isActive: true,
  marketingConsent: true
}

export const mockSalesData: SalesData[] = [
  { date: '1월', amount: 12500000, orders: 45 },
  { date: '2월', amount: 15800000, orders: 52 },
  { date: '3월', amount: 18200000, orders: 61 },
  { date: '4월', amount: 14300000, orders: 48 },
  { date: '5월', amount: 21500000, orders: 73 },
  { date: '6월', amount: 19800000, orders: 65 },
]

export const promotionItems = [
  {
    category: "기획전",
    items: [
      { name: "도라지정과 세트", subItems: [] },
      { name: "정통고 세트", subItems: ["정통고 세트", "착즙 세트", "청 세트"] },
      { name: "착즙청 세트", subItems: [] },
      { name: "견과 세트", subItems: [] },
      { name: "기획전 인후단(30구)", subItems: [] }
    ]
  }
]

export const notices: Notice[] = [
  {
    id: 'notice-1',
    title: '[중요] 2024년 설 명절 배송 안내',
    content: '설 명절을 맞이하여 배송 일정을 안내드립니다. 1월 25일 이전 주문 건에 한해 명절 전 배송이 가능합니다. 1월 26일 ~ 2월 12일 기간 중 주문 건은 2월 13일부터 순차 배송됩니다.',
    category: 'important',
    isImportant: true,
    createdAt: new Date('2024-01-15'),
    viewCount: 1523
  },
  {
    id: 'notice-2',
    title: '신규 회원 가입 이벤트 안내',
    content: '신규 회원 가입 시 첫 구매 10% 할인 쿠폰을 드립니다. 이벤트 기간: 2024년 1월 1일 ~ 2024년 12월 31일',
    category: 'event',
    isImportant: false,
    createdAt: new Date('2024-01-10'),
    viewCount: 892
  },
  {
    id: 'notice-3',
    title: '시스템 정기 점검 안내 (1/20)',
    content: '서비스 품질 향상을 위해 시스템 정기 점검을 실시합니다. 점검 시간: 2024년 1월 20일 02:00 ~ 06:00 (4시간). 점검 시간 동안 서비스 이용이 제한될 수 있습니다.',
    category: 'notice',
    isImportant: false,
    createdAt: new Date('2024-01-08'),
    viewCount: 456
  },
  {
    id: 'notice-4',
    title: '모바일 앱 업데이트 안내 (v2.5.0)',
    content: '모바일 앱이 업데이트되었습니다. 주요 변경사항: 결제 프로세스 개선, 상품 검색 기능 강화, UI/UX 개선. 앱스토어에서 최신 버전으로 업데이트해 주세요.',
    category: 'update',
    isImportant: false,
    createdAt: new Date('2024-01-05'),
    viewCount: 678
  },
  {
    id: 'notice-5',
    title: '[중요] 개인정보 처리방침 변경 안내',
    content: '개인정보 보호법 개정에 따라 개인정보 처리방침이 변경되었습니다. 시행일: 2024년 2월 1일. 자세한 내용은 개인정보 처리방침 페이지에서 확인해 주세요.',
    category: 'important',
    isImportant: true,
    createdAt: new Date('2024-01-03'),
    viewCount: 1102
  },
  {
    id: 'notice-6',
    title: 'VIP 고객 전용 특별 혜택 안내',
    content: 'VIP 등급 고객님께 특별 혜택을 드립니다. 전 상품 추가 5% 할인, 무료 배송, 전용 고객센터 운영. 자세한 내용은 마이페이지에서 확인하세요.',
    category: 'event',
    isImportant: false,
    createdAt: new Date('2024-01-01'),
    viewCount: 534
  },
  {
    id: 'notice-7',
    title: '2024년 새해 복 많이 받으세요!',
    content: '2024년 갑진년 새해가 밝았습니다. 새해에도 변함없는 사랑 부탁드리며, 항상 좋은 상품과 서비스로 보답하겠습니다. 새해 복 많이 받으세요!',
    category: 'notice',
    isImportant: false,
    createdAt: new Date('2024-01-01'),
    viewCount: 789
  }
]

export const reviews: Review[] = [
  {
    id: 'review-1',
    productId: 'p1',
    author: '김**',
    rating: 5,
    title: '명절 선물로 최고입니다',
    content: '부모님께 드렸는데 너무 좋아하셨어요. 포장도 고급스럽고 품질도 훌륭합니다. 다음에도 재구매 예정입니다.',
    createdAt: new Date('2024-01-12'),
    helpful: 15,
    verified: true
  },
  {
    id: 'review-2',
    productId: 'p1',
    author: '이**',
    rating: 4,
    title: '품질은 좋은데 가격이 조금...',
    content: '품질은 확실히 좋습니다. 다만 가격이 조금 부담되네요. 그래도 선물용으로는 추천합니다.',
    createdAt: new Date('2024-01-10'),
    helpful: 8,
    verified: true
  },
  {
    id: 'review-3',
    productId: 'p1',
    author: '박**',
    rating: 5,
    title: '재구매 3번째!',
    content: '매번 만족스럽습니다. 거래처 선물용으로 대량 구매했는데 반응이 좋아요. 포장 상태도 완벽하게 배송됐습니다.',
    createdAt: new Date('2024-01-08'),
    helpful: 22,
    verified: true
  },
  {
    id: 'review-4',
    productId: 'p2',
    author: '최**',
    rating: 5,
    title: '어머니가 좋아하세요',
    content: '건강을 위해 어머니께 선물했습니다. 매일 드시는데 컨디션이 좋아지셨다고 하네요.',
    createdAt: new Date('2024-01-11'),
    helpful: 12,
    verified: true
  },
  {
    id: 'review-5',
    productId: 'p2',
    author: '정**',
    rating: 4,
    title: '효과가 있는 것 같아요',
    content: '한 달 정도 복용했는데 피로감이 줄어든 느낌입니다. 꾸준히 먹어볼 예정이에요.',
    createdAt: new Date('2024-01-05'),
    helpful: 6,
    verified: true
  },
  {
    id: 'review-6',
    productId: 'p3',
    author: '한**',
    rating: 5,
    title: '견과류 신선해요',
    content: '견과류가 정말 신선하고 맛있습니다. 포장도 예쁘고 선물하기 딱 좋아요.',
    createdAt: new Date('2024-01-09'),
    helpful: 9,
    verified: true
  },
  {
    id: 'review-7',
    productId: 'p4',
    author: '윤**',
    rating: 5,
    title: '피부가 촉촉해졌어요',
    content: '사용한 지 2주 정도 됐는데 피부결이 좋아진 게 느껴집니다. 향도 은은하고 좋아요.',
    createdAt: new Date('2024-01-13'),
    helpful: 18,
    verified: true
  },
  {
    id: 'review-8',
    productId: 'p4',
    author: '서**',
    rating: 3,
    title: '보통이에요',
    content: '기대했던 것보다는 평범한 것 같아요. 그래도 나쁘지 않습니다.',
    createdAt: new Date('2024-01-07'),
    helpful: 3,
    verified: true
  },
  {
    id: 'review-9',
    productId: 'p5',
    author: '강**',
    rating: 5,
    title: '매장에서 쓰기 좋아요',
    content: '에스테틱 매장 운영 중인데 고객분들 반응이 좋습니다. 대량 구매 시 가격도 합리적이에요.',
    createdAt: new Date('2024-01-14'),
    helpful: 25,
    verified: true
  },
  {
    id: 'review-10',
    productId: 'p7',
    author: '임**',
    rating: 5,
    title: '요리하기 편해요',
    content: '열전도가 좋아서 요리가 잘 됩니다. 세척도 편하고 디자인도 깔끔해요.',
    createdAt: new Date('2024-01-06'),
    helpful: 11,
    verified: true
  }
]

// 샘플 쿠폰 데이터
export const sampleCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'WELCOME10',
    name: '신규가입 10% 할인',
    description: '신규 회원 가입 감사 쿠폰',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 30000,
    maxDiscountAmount: 10000,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isUsed: false
  },
  {
    id: 'coupon-2',
    code: 'SPRING5',
    name: '봄맞이 5% 할인',
    description: '봄 시즌 특별 할인 쿠폰',
    discountType: 'percent',
    discountValue: 5,
    minOrderAmount: 50000,
    maxDiscountAmount: 5000,
    validFrom: new Date('2024-03-01'),
    validUntil: new Date('2025-05-31'),
    isUsed: false
  },
  {
    id: 'coupon-3',
    code: 'VIP15',
    name: 'VIP 전용 15% 할인',
    description: 'VIP 고객 전용 특별 할인 쿠폰',
    discountType: 'percent',
    discountValue: 15,
    minOrderAmount: 100000,
    maxDiscountAmount: 30000,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isUsed: false
  },
  {
    id: 'coupon-4',
    code: 'FLAT5000',
    name: '5,000원 할인',
    description: '3만원 이상 구매 시 5,000원 할인',
    discountType: 'fixed',
    discountValue: 5000,
    minOrderAmount: 30000,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isUsed: false
  },
  {
    id: 'coupon-5',
    code: 'MEGA20',
    name: '메가 20% 할인',
    description: '기간 한정 최대 20% 할인 (최대 5만원)',
    discountType: 'percent',
    discountValue: 20,
    minOrderAmount: 150000,
    maxDiscountAmount: 50000,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-06-30'),
    isUsed: false
  },
  {
    id: 'coupon-6',
    code: 'USED10',
    name: '[사용완료] 첫구매 10% 할인',
    description: '첫 구매 감사 쿠폰 (이미 사용됨)',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 20000,
    maxDiscountAmount: 8000,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isUsed: true,
    usedAt: new Date('2024-01-15')
  }
]
