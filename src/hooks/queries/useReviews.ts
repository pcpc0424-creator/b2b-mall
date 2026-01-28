import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchProductReviews,
  createReview,
  incrementHelpful,
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
