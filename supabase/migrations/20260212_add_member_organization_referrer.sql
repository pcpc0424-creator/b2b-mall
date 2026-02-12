-- 회원 그룹 관리를 위한 소속 및 추천인 컬럼 추가
-- organization: 소속 (사업자/단체명)
-- referrer_id: 추천인 회원 ID (members.id가 TEXT 타입이므로 TEXT로 설정)
-- referrer_name: 추천인 이름 (조회 편의용)

ALTER TABLE members
ADD COLUMN organization TEXT,
ADD COLUMN referrer_id TEXT,
ADD COLUMN referrer_name TEXT;

-- 인덱스 추가 (소속별, 추천인별 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_members_organization ON members(organization);
CREATE INDEX IF NOT EXISTS idx_members_referrer_id ON members(referrer_id);
