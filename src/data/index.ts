import { Category, Product, Promotion, User, SalesData } from '../types'

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
    images: ["https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=600&h=600&fit=crop"],
    prices: { retail: 89000, member: 79000, vip: 71000, wholesale: 62000, partner: 55000 },
    minQuantity: 1,
    stock: 500,
    stockStatus: 'available'
  },
  {
    id: "p2",
    sku: "GF-002",
    name: "6년근 홍삼 농축액 세트",
    brand: "정관장",
    categoryId: 1,
    images: ["https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&h=600&fit=crop"],
    prices: { retail: 150000, member: 135000, vip: 120000, wholesale: 105000, partner: 90000 },
    minQuantity: 1,
    stock: 320,
    stockStatus: 'available'
  },
  {
    id: "p3",
    sku: "GF-003",
    name: "명품 견과류 선물세트",
    brand: "자연담음",
    categoryId: 1,
    images: ["https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&h=600&fit=crop"],
    prices: { retail: 45000, member: 40000, vip: 36000, wholesale: 31500, partner: 27000 },
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
    prices: { retail: 128000, member: 115000, vip: 102000, wholesale: 89000, partner: 77000 },
    minQuantity: 3,
    stock: 85,
    stockStatus: 'low'
  },
  {
    id: "p5",
    sku: "BT-002",
    name: "고급 마스크팩 30매입",
    brand: "메디힐",
    categoryId: 3,
    images: ["https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop"],
    prices: { retail: 35000, member: 31500, vip: 28000, wholesale: 24500, partner: 21000 },
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
    prices: { retail: 55000, member: 49500, vip: 44000, wholesale: 38500, partner: 33000 },
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
    prices: { retail: 189000, member: 170000, vip: 151000, wholesale: 132000, partner: 113000 },
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
    prices: { retail: 32000, member: 28800, vip: 25600, wholesale: 22400, partner: 19200 },
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
    prices: { retail: 25000, member: 22500, vip: 20000, wholesale: 17500, partner: 15000 },
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
    prices: { retail: 89000, member: 80100, vip: 71200, wholesale: 62300, partner: 53400 },
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
    prices: { retail: 199000, member: 179000, vip: 159000, wholesale: 139000, partner: 119000 },
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
    prices: { retail: 68000, member: 61200, vip: 54400, wholesale: 47600, partner: 40800 },
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
    targetTiers: ['guest', 'member', 'vip', 'wholesale', 'partner'],
    type: 'all'
  },
  {
    id: "promo2",
    title: "VIP 전용 특가",
    description: "VIP 고객님을 위한 특별 할인",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop",
    discount: 40,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    targetTiers: ['vip', 'wholesale', 'partner'],
    type: 'exclusive'
  },
  {
    id: "promo3",
    title: "타임특가 - 건강식품",
    description: "오늘만! 건강식품 50% 할인",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&h=400&fit=crop",
    discount: 50,
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-01-20'),
    targetTiers: ['member', 'vip', 'wholesale', 'partner'],
    type: 'timesale'
  },
  {
    id: "promo4",
    title: "파트너 전용 대량구매 혜택",
    description: "100개 이상 주문 시 추가 15% 할인",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop",
    discount: 15,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    targetTiers: ['partner'],
    type: 'exclusive'
  }
]

export const mockUser: User = {
  id: "u1",
  name: "김정담",
  email: "jd.kim@company.com",
  tier: "vip",
  company: "정담상사"
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
