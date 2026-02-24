-- orders 테이블에 carrier(택배사) 컬럼 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT;

-- 코멘트 추가
COMMENT ON COLUMN orders.carrier IS '택배사 코드 (cj, hanjin, lotte, logen, epost, cu, gspost)';
