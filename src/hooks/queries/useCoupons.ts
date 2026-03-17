import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUserCoupons,
  registerCouponByCode,
  claimAllActiveCoupons,
  markCouponUsed,
  fetchAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  issueCouponToUsers,
  issueCouponToAllUsers,
  fetchIssuedCoupons,
  fetchIssuedCouponsByCouponId,
  revokeUserCoupon,
  type CreateCouponInput,
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
    onError: (err) => console.error('쿠폰 등록 실패:', err),
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
    onError: (err) => console.error('쿠폰 발급 실패:', err),
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
    onError: (err) => console.error('쿠폰 사용 처리 실패:', err),
  })
}

// ============ 관리자용 Hooks ============

/** 관리자: 전체 쿠폰 목록 조회 */
export function useAdminCoupons() {
  return useQuery({
    queryKey: ['admin-coupons'],
    queryFn: fetchAllCoupons,
  })
}

/** 관리자: 쿠폰 생성 */
export function useCreateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCouponInput) => createCoupon(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
    },
    onError: (err) => console.error('쿠폰 생성 실패:', err),
  })
}

/** 관리자: 쿠폰 수정 */
export function useUpdateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateCouponInput> }) =>
      updateCoupon(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
    },
    onError: (err) => console.error('쿠폰 수정 실패:', err),
  })
}

/** 관리자: 쿠폰 삭제 */
export function useDeleteCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
    },
    onError: (err) => console.error('쿠폰 삭제 실패:', err),
  })
}

/** 관리자: 특정 회원에게 쿠폰 발급 */
export function useIssueCouponToUsers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ couponId, userIds }: { couponId: string; userIds: string[] }) =>
      issueCouponToUsers(couponId, userIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-coupons'] })
      qc.invalidateQueries({ queryKey: ['issued-coupons'] })
    },
    onError: (err) => console.error('쿠폰 발급 실패:', err),
  })
}

/** 관리자: 전체 회원에게 쿠폰 발급 */
export function useIssueCouponToAllUsers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (couponId: string) => issueCouponToAllUsers(couponId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-coupons'] })
      qc.invalidateQueries({ queryKey: ['issued-coupons'] })
    },
    onError: (err) => console.error('쿠폰 발급 실패:', err),
  })
}

// ============ 발급 현황 조회/회수 Hooks ============

/** 관리자: 발급된 쿠폰 전체 목록 조회 */
export function useIssuedCoupons() {
  return useQuery({
    queryKey: ['issued-coupons'],
    queryFn: fetchIssuedCoupons,
  })
}

/** 관리자: 특정 쿠폰의 발급 현황 조회 */
export function useIssuedCouponsByCouponId(couponId: string | null) {
  return useQuery({
    queryKey: ['issued-coupons', couponId],
    queryFn: () => fetchIssuedCouponsByCouponId(couponId!),
    enabled: !!couponId,
  })
}

/** 관리자: 쿠폰 회수 */
export function useRevokeUserCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userCouponId: string) => revokeUserCoupon(userCouponId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issued-coupons'] })
      qc.invalidateQueries({ queryKey: ['user-coupons'] })
    },
    onError: (err) => console.error('쿠폰 회수 실패:', err),
  })
}
