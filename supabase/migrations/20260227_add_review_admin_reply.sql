-- 리뷰에 관리자 답글 컬럼 추가
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_reply_at TIMESTAMPTZ;
