-- 홈 섹션 관리 테이블 생성
-- Supabase Dashboard > SQL Editor에서 실행하세요.

CREATE TABLE IF NOT EXISTS home_sections (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  section_type text NOT NULL CHECK (section_type IN ('best', 'new', 'sale')),
  product_id text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (section_type, product_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_home_sections_type_order
  ON home_sections (section_type, display_order);

-- RLS 활성화
ALTER TABLE home_sections ENABLE ROW LEVEL SECURITY;

-- 읽기: 모든 사용자 (anon 포함)
CREATE POLICY "home_sections_select_all"
  ON home_sections FOR SELECT
  USING (true);

-- 쓰기: 인증된 사용자만
CREATE POLICY "home_sections_insert_auth"
  ON home_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "home_sections_update_auth"
  ON home_sections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "home_sections_delete_auth"
  ON home_sections FOR DELETE
  TO authenticated
  USING (true);
