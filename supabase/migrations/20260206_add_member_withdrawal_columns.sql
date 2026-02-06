-- 회원 탈퇴 관련 컬럼 추가
-- 탈퇴 회원 데이터 보관 및 재가입 승인 기능 지원

-- 탈퇴 일시
ALTER TABLE members ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ;

-- 탈퇴 처리 주체 (self: 본인 탈퇴, admin: 관리자 탈퇴)
ALTER TABLE members ADD COLUMN IF NOT EXISTS withdrawn_by TEXT CHECK (withdrawn_by IN ('self', 'admin'));

-- 재가입 신청 일시 (탈퇴 후 다시 로그인 시도한 시점)
ALTER TABLE members ADD COLUMN IF NOT EXISTS rejoined_at TIMESTAMPTZ;

-- 인덱스 추가 (탈퇴 회원 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_withdrawn_at ON members(withdrawn_at) WHERE status = 'withdrawn';

-- 코멘트 추가
COMMENT ON COLUMN members.withdrawn_at IS '회원 탈퇴 일시';
COMMENT ON COLUMN members.withdrawn_by IS '탈퇴 처리 주체 (self: 본인 탈퇴, admin: 관리자 탈퇴)';
COMMENT ON COLUMN members.rejoined_at IS '탈퇴 후 재가입 신청 일시';
