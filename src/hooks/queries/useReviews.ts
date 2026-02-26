import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchProductReviews,
  createReview,
  incrementHelpful,
  fetchAllReviews,
  deleteReview,
  replyToReview,
  deleteReviewReply,
} from '../../services/reviews'

/** 상품별 리뷰 조회 */
export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchProductReviews(productId),
    enabled: !!productId,
  })
}

/** 리뷰 작성 */
export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createReview,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['reviews', variables.productId] })
    },
    onError: (err) => console.error('리뷰 작성 실패:', err),
  })
}

/** 도움이 돼요 */
export function useIncrementHelpful() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, productId }: { reviewId: string; productId: string }) =>
      incrementHelpful(reviewId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['reviews', variables.productId] })
    },
    onError: (err) => console.error('도움이 돼요 실패:', err),
  })
}

// ========== 관리자용 훅 ==========

/** 전체 리뷰 조회 (관리자용) */
export function useAllReviews() {
  return useQuery({
    queryKey: ['reviews', 'all'],
    queryFn: fetchAllReviews,
  })
}

/** 리뷰 삭제 (관리자용) */
export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
    },
    onError: (err) => console.error('리뷰 삭제 실패:', err),
  })
}

/** 관리자 답글 작성/수정 */
export function useReplyToReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: string; reply: string }) =>
      replyToReview(reviewId, reply),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
    },
    onError: (err) => console.error('답글 작성 실패:', err),
  })
}

/** 관리자 답글 삭제 */
export function useDeleteReviewReply() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteReviewReply,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
    },
    onError: (err) => console.error('답글 삭제 실패:', err),
  })
}
