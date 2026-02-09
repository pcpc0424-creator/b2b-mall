-- 장바구니 테이블 생성
-- 브라우저 간 장바구니 동기화를 위해 서버에 저장

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_options JSONB,  -- Record<string, string> 형태의 옵션
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 같은 사용자, 같은 상품, 같은 옵션 조합은 하나만 존재
  UNIQUE(user_id, product_id, selected_options)
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- RLS 정책 설정
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 장바구니만 조회 가능
CREATE POLICY "Users can view own cart" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 장바구니에만 추가 가능
CREATE POLICY "Users can insert own cart" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 장바구니만 수정 가능
CREATE POLICY "Users can update own cart" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 장바구니만 삭제 가능
CREATE POLICY "Users can delete own cart" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_updated_at();

-- 코멘트 추가
COMMENT ON TABLE cart_items IS '사용자 장바구니 (브라우저 간 동기화)';
COMMENT ON COLUMN cart_items.user_id IS '사용자 ID (auth.users 참조)';
COMMENT ON COLUMN cart_items.product_id IS '상품 ID';
COMMENT ON COLUMN cart_items.quantity IS '수량';
COMMENT ON COLUMN cart_items.selected_options IS '선택된 옵션 (JSON)';
