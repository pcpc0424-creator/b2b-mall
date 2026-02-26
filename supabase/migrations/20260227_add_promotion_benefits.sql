-- 프로모션 혜택 문구 저장을 위한 benefits 컬럼 추가
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}';

-- 기존 프로모션에 기본 혜택 문구 설정 (선택사항)
-- UPDATE promotions
-- SET benefits = ARRAY['할인 혜택 적용', '회원 전용 특별 혜택', '기간 내 무제한 적용']
-- WHERE benefits IS NULL OR benefits = '{}';
