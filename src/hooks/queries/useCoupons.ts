import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUserCoupons,
  registerCouponByCode,
  claimAllActiveCoupons,
  markCouponUsed,
} from '../../services/coupons'

/** 사용자의 쿠폰 목록 조회 */
export function useUserCoupons(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-coupons', userId],
    queryFn: () => fetchUserCoupons(userId!),
    enabled: !!userId,
  })
}

/** 쿠폰 코드 등록 */
export function useRegisterCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, code }: { userId: string; code: string }) =>
      registerCouponByCode(userId, code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-coupons'] })
    },
  })
}

/** 활성 쿠폰 전체 자동 발급 */
export function useClaimAllCoupons() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => claimAllActiveCoupons(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-coupons'] })
    },
  })
}

/** 쿠폰 사용 처리 */
export function useMarkCouponUsed() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userCouponId: string) => markCouponUsed(userCouponId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-coupons'] })
    },
  })
}
