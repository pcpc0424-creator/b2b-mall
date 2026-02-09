/**
 * 에러 유틸리티 함수
 * AbortError 등 무시해야 하는 에러를 필터링
 */

/**
 * 실제 에러인지 확인 (AbortError 등은 무시)
 * @param error - 에러 객체
 * @returns 실제 처리해야 하는 에러인 경우 true
 */
export function isRealError(error: unknown): boolean {
  if (!error) return false

  // AbortError: 페이지 전환 시 발생하는 요청 취소 (정상)
  if (error instanceof Error && error.name === 'AbortError') {
    return false
  }

  // DOMException의 AbortError
  if (error instanceof DOMException && error.name === 'AbortError') {
    return false
  }

  return true
}

/**
 * 여러 에러 중 실제 에러가 있는지 확인
 * @param errors - 에러 객체 배열
 * @returns 실제 에러가 하나라도 있으면 true
 */
export function hasRealError(...errors: unknown[]): boolean {
  return errors.some(isRealError)
}
