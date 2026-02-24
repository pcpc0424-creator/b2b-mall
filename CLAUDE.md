# 프로젝트 작업 기록

## 프로젝트 구조
- **개발 폴더**: `/var/www/b2b-mall` (소스 코드)
- **프로덕션 폴더**: `/var/www/b2b-mall-prod` (빌드된 파일, 실제 서비스)
- **배포 방법**: `npm run build && cp -r dist/* /var/www/b2b-mall-prod/`

## 2026-02-19 작업 내용

### 1. Supabase GoTrueClient 경고 수정
- `src/lib/supabase.ts`에서 `supabasePublic` 클라이언트에 별도의 `storageKey` 추가
- 두 클라이언트가 동일한 storage key를 공유하는 문제 해결

### 2. 푸터 정책 페이지 추가
- **교환/환불 정책 페이지** (`src/pages/RefundPolicyPage.tsx`) 생성
- **배송 안내 페이지** (`src/pages/ShippingPolicyPage.tsx`) 생성
- `src/components/layout/Footer.tsx`에 링크 추가
- `src/App.tsx`에 라우트 추가

### 3. 연락처 정보 정리
- 푸터에서 전화번호(1588-0000) 제거, 이메일만 표시
- 모든 정책 페이지에서 전화번호를 이메일(lee0608min@naver.com)로 변경
- 수정된 파일들:
  - `Footer.tsx`
  - `PrivacyPolicyPage.tsx`
  - `TermsOfServicePage.tsx`
  - `RefundPolicyPage.tsx`
  - `ShippingPolicyPage.tsx`
  - `FAQPage.tsx`
  - `QuotePage.tsx`

### 4. Q&A 기능 구현

#### 사용자 페이지 (Q&A 문의 작성)
- `src/pages/QnAPage.tsx`에 문의하기 버튼 및 모달 추가
- 상품 검색/선택, 문의 내용 입력, 비공개 옵션 기능

#### 관리자 페이지 (Q&A 답변 관리)
- `src/admin/pages/QnAManagementPage.tsx` 생성
- 답변 작성/수정, 문의 삭제 기능
- 관리자 사이드바에 "Q&A 관리" 메뉴 추가

#### 서비스/Hook 추가
- `src/services/community.ts`: `answerQnA`, `deleteQnA` 함수 추가
- `src/hooks/queries/useCommunity.ts`: `useAnswerQnA`, `useDeleteQnA` hook 추가

#### 데이터베이스 (Supabase)
- `qna` 테이블 생성 (마이그레이션: `supabase/migrations/20260219_add_qna_table.sql`)
- RLS 비활성화 상태 (테스트용)

### 5. 중요 사항
- Q&A 관련 함수들은 `supabasePublic` 클라이언트 사용 (세션 없이 동작)
- `supabase` 클라이언트는 인증용, `supabasePublic`은 공용 데이터 조회/입력용

## 2026-02-20 작업 내용

### 1. 결제 시스템 버그 수정

#### 결제 승인 무한 로딩 수정
- `src/services/payment.ts`: Supabase functions.invoke 대신 fetch API 직접 사용
- 30초 타임아웃 추가
- 에러 메시지 정확히 표시되도록 수정

#### 주문 저장 무한 로딩 수정
- `src/services/orders.ts`: `supabase` → `supabasePublic` 변경
- `createOrder`, `fetchUserOrders` 함수 수정
- RLS 문제 해결

### 2. 부가세 표시 제거
- `src/pages/CheckoutPage.tsx`: 부가세 (10%) 항목 제거
- `src/pages/CartPage.tsx`: 부가세 (10%) 항목 제거

### 3. 환불 기능 추가

#### Supabase Edge Function
- `supabase/functions/cancel-payment/index.ts` 생성
- 토스페이먼츠 결제 취소 API 연동
- 전체/부분 환불 지원

#### 프론트엔드
- `src/services/payment.ts`: `cancelPayment` 함수 추가
- `src/admin/types/admin.ts`: Order 타입에 `paymentKey` 필드 추가
- `src/services/orders.ts`: 주문 생성 시 `payment_key` 저장, `toOrder`에서 변환

#### 관리자 페이지
- `src/admin/pages/OrderManagementPage.tsx`: 환불 버튼 추가
- 결제 완료 상태 주문에만 환불 버튼 표시
- 환불 성공 시 주문 상태 자동으로 'refunded'로 변경

### 4. 토스페이먼츠 설정

#### 환경 변수 (.env.local)
```
# 테스트 모드
VITE_TOSS_CLIENT_KEY=test_gck_Z1aOwX7K8mzMGdybkegq3yQxzvNP
TOSS_SECRET_KEY=test_gsk_DnyRpQWGrN6BKa0BGjp0rKwv1M9E

# 실제 결제 모드
VITE_TOSS_CLIENT_KEY=live_gck_Z61JOxRQVEozM75Y2wzg8W0X9bAq
TOSS_SECRET_KEY=live_gsk_LkKEypNArWlGDK6QXo9a8lmeaxYG
```

#### Supabase Secrets 변경 명령어
```bash
# 테스트 모드
npx supabase secrets set TOSS_SECRET_KEY=test_gsk_DnyRpQWGrN6BKa0BGjp0rKwv1M9E

# 실제 결제 모드
npx supabase secrets set TOSS_SECRET_KEY=live_gsk_LkKEypNArWlGDK6QXo9a8lmeaxYG
```

### 5. 중요 사항
- 결제/환불 서비스는 `supabasePublic` 대신 fetch API 직접 사용
- 주문 서비스는 `supabasePublic` 사용 (RLS 우회)
- 환불은 `paymentKey`가 있는 주문만 가능 (기존 주문은 환불 불가)
