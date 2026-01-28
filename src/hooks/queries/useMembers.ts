import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMembers, updateMemberTier, updateMemberStatus } from '../../services/members'
import type { MemberStatus } from '../../admin/types/admin'
import type { UserTier } from '../../types'

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers,
    refetchInterval: 60000, // 60초마다 자동 새로고침
  })
}

export function useUpdateMemberTier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, tier }: { memberId: string; tier: UserTier }) =>
      updateMemberTier(memberId, tier),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
    onError: (err) => console.error('등급 변경 실패:', err),
  })
}

export function useUpdateMemberStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, status }: { memberId: string; status: MemberStatus }) =>
      updateMemberStatus(memberId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
    onError: (err) => console.error('상태 변경 실패:', err),
  })
}
