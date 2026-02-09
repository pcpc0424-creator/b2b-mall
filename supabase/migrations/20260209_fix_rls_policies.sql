-- RLS 정책 수정: 로그인 사용자도 데이터 조회 가능하도록
-- 문제: 기존 정책이 anon 역할만 허용하고 authenticated 역할을 허용하지 않음

-- =====================================================
-- PRODUCTS 테이블
-- =====================================================
-- 기존 SELECT 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow anon read access" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "products_select_policy" ON products;

-- 모든 사용자(anon + authenticated) 읽기 허용
CREATE POLICY "products_public_read" ON products
  FOR SELECT
  USING (true);

-- =====================================================
-- SITE_SETTINGS 테이블
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access" ON site_settings;
DROP POLICY IF EXISTS "Allow anon read access" ON site_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON site_settings;
DROP POLICY IF EXISTS "site_settings_select_policy" ON site_settings;

CREATE POLICY "site_settings_public_read" ON site_settings
  FOR SELECT
  USING (true);

-- =====================================================
-- PROMOTIONS 테이블
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access" ON promotions;
DROP POLICY IF EXISTS "Allow anon read access" ON promotions;
DROP POLICY IF EXISTS "Enable read access for all users" ON promotions;
DROP POLICY IF EXISTS "promotions_select_policy" ON promotions;

CREATE POLICY "promotions_public_read" ON promotions
  FOR SELECT
  USING (true);

-- =====================================================
-- CATEGORIES 테이블
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access" ON categories;
DROP POLICY IF EXISTS "Allow anon read access" ON categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "categories_select_policy" ON categories;

CREATE POLICY "categories_public_read" ON categories
  FOR SELECT
  USING (true);

-- =====================================================
-- HOME_SECTIONS 테이블
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access" ON home_sections;
DROP POLICY IF EXISTS "Allow anon read access" ON home_sections;
DROP POLICY IF EXISTS "Enable read access for all users" ON home_sections;
DROP POLICY IF EXISTS "home_sections_select_policy" ON home_sections;

CREATE POLICY "home_sections_public_read" ON home_sections
  FOR SELECT
  USING (true);

-- =====================================================
-- ORDERS 테이블 (인증된 사용자만)
-- =====================================================
DROP POLICY IF EXISTS "orders_select_policy" ON orders;
DROP POLICY IF EXISTS "Allow authenticated read access" ON orders;

-- 인증된 사용자는 자신의 주문만 조회 가능
CREATE POLICY "orders_user_read" ON orders
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- =====================================================
-- MEMBERS 테이블
-- =====================================================
DROP POLICY IF EXISTS "members_select_policy" ON members;
DROP POLICY IF EXISTS "Allow authenticated read access" ON members;

-- 모든 역할 읽기 허용 (관리자 페이지에서 사용)
CREATE POLICY "members_public_read" ON members
  FOR SELECT
  USING (true);

-- =====================================================
-- MODALS 테이블
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access" ON modals;
DROP POLICY IF EXISTS "modals_select_policy" ON modals;

CREATE POLICY "modals_public_read" ON modals
  FOR SELECT
  USING (true);

-- =====================================================
-- SHIPPING_SETTINGS 테이블
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access" ON shipping_settings;
DROP POLICY IF EXISTS "shipping_settings_select_policy" ON shipping_settings;

CREATE POLICY "shipping_settings_public_read" ON shipping_settings
  FOR SELECT
  USING (true);
