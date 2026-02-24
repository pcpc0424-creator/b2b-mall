-- Q&A 테이블 생성
CREATE TABLE IF NOT EXISTS qna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  question TEXT NOT NULL,
  answer TEXT,
  author TEXT NOT NULL,
  user_id UUID REFERENCES members(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  answered_at TIMESTAMPTZ
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_qna_product_id ON qna(product_id);
CREATE INDEX IF NOT EXISTS idx_qna_user_id ON qna(user_id);
CREATE INDEX IF NOT EXISTS idx_qna_is_answered ON qna(is_answered);
CREATE INDEX IF NOT EXISTS idx_qna_created_at ON qna(created_at DESC);

-- RLS 활성화
ALTER TABLE qna ENABLE ROW LEVEL SECURITY;

-- 정책: 누구나 공개 Q&A 조회 가능
CREATE POLICY "Anyone can view public qna" ON qna
  FOR SELECT USING (is_private = false);

-- 정책: 본인 Q&A 조회 가능
CREATE POLICY "Users can view own qna" ON qna
  FOR SELECT USING (auth.uid() = user_id);

-- 정책: 로그인 사용자 Q&A 작성 가능
CREATE POLICY "Authenticated users can create qna" ON qna
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 정책: 관리자 모든 Q&A 조회/수정/삭제 가능
CREATE POLICY "Service role can do everything" ON qna
  FOR ALL USING (true) WITH CHECK (true);
