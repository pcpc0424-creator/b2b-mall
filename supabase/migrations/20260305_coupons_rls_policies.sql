-- coupons 및 user_coupons 테이블 RLS 정책
-- 관리자 쿠폰 관리 및 사용자 쿠폰 등록을 위한 정책

-- =====================================================
-- COUPONS 테이블
-- =====================================================
-- 기존 정책 삭제
DROP POLICY IF EXISTS "coupons_public_read" ON coupons;
DROP POLICY IF EXISTS "coupons_public_insert" ON coupons;
DROP POLICY IF EXISTS "coupons_public_update" ON coupons;
DROP POLICY IF EXISTS "coupons_public_delete" ON coupons;

-- 모든 사용자 읽기 허용
CREATE POLICY "coupons_public_read" ON coupons
  FOR SELECT
  USING (true);

-- 모든 사용자 쓰기 허용 (관리자 페이지용)
CREATE POLICY "coupons_public_insert" ON coupons
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "coupons_public_update" ON coupons
  FOR UPDATE
  USING (true);

CREATE POLICY "coupons_public_delete" ON coupons
  FOR DELETE
  USING (true);

-- =====================================================
-- USER_COUPONS 테이블
-- =====================================================
-- 기존 정책 삭제
DROP POLICY IF EXISTS "user_coupons_public_read" ON user_coupons;
DROP POLICY IF EXISTS "user_coupons_public_insert" ON user_coupons;
DROP POLICY IF EXISTS "user_coupons_public_update" ON user_coupons;
DROP POLICY IF EXISTS "user_coupons_public_delete" ON user_coupons;

-- 모든 사용자 읽기 허용
CREATE POLICY "user_coupons_public_read" ON user_coupons
  FOR SELECT
  USING (true);

-- 모든 사용자 쓰기 허용
CREATE POLICY "user_coupons_public_insert" ON user_coupons
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "user_coupons_public_update" ON user_coupons
  FOR UPDATE
  USING (true);

CREATE POLICY "user_coupons_public_delete" ON user_coupons
  FOR DELETE
  USING (true);
