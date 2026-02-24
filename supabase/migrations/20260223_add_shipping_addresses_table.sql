-- 배송지 관리 테이블
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,              -- 배송지 이름 (집, 회사 등)
  recipient TEXT NOT NULL,         -- 수령인
  phone TEXT NOT NULL,             -- 연락처
  postal_code TEXT NOT NULL,       -- 우편번호
  address1 TEXT NOT NULL,          -- 기본 주소
  address2 TEXT,                   -- 상세 주소
  notes TEXT,                      -- 배송 메모
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_shipping_addresses_user_id ON shipping_addresses(user_id);

-- RLS 비활성화 (supabasePublic 사용)
ALTER TABLE shipping_addresses DISABLE ROW LEVEL SECURITY;
