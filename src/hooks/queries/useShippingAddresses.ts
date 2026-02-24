import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUserShippingAddresses,
  createShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  setDefaultShippingAddress,
} from '../../services/shippingAddresses'
import type { SavedShippingAddressInput } from '../../admin/types/admin'

/** 사용자의 배송지 목록 */
export function useUserShippingAddresses(userId: string | undefined) {
  return useQuery({
    queryKey: ['shippingAddresses', userId],
    queryFn: () => fetchUserShippingAddresses(userId!),
    enabled: !!userId,
  })
}

/** 배송지 생성 */
export function useCreateShippingAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: SavedShippingAddressInput }) =>
      createShippingAddress(userId, input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['shippingAddresses', variables.userId] })
    },
    onError: (err) => console.error('배송지 생성 실패:', err),
  })
}

/** 배송지 수정 */
export function useUpdateShippingAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId, input }: { id: string; userId: string; input: SavedShippingAddressInput }) =>
      updateShippingAddress(id, userId, input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['shippingAddresses', variables.userId] })
    },
    onError: (err) => console.error('배송지 수정 실패:', err),
  })
}

/** 배송지 삭제 */
export function useDeleteShippingAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      deleteShippingAddress(id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['shippingAddresses', variables.userId] })
    },
    onError: (err) => console.error('배송지 삭제 실패:', err),
  })
}

/** 기본 배송지 설정 */
export function useSetDefaultShippingAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      setDefaultShippingAddress(id, userId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['shippingAddresses', variables.userId] })
    },
    onError: (err) => console.error('기본 배송지 설정 실패:', err),
  })
}
