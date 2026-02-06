import { supabase } from '../lib/supabase'
import type { MemberListItem, MemberStatus } from '../admin/types/admin'
import type { UserTier } from '../types'

/**
 * 회원 서비스 (Supabase 전용)
 * DB 행(snake_case) ↔ MemberListItem(camelCase) 변환 및 CRUD 제공
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

/** DB 행(snake_case) → MemberListItem(camelCase) 변환 */
export function toMember(row: DbRow): MemberListItem {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    businessNumber: row.business_number,
    tier: row.tier ?? 'guest',
    status: row.status ?? 'active',
    totalOrders: row.total_orders ?? 0,
    totalSpent: row.total_spent ?? 0,
    createdAt: new Date(row.created_at),
    lastOrderAt: row.last_order_at ? new Date(row.last_order_at) : undefined,
    provider: row.provider,
    withdrawnAt: row.withdrawn_at ? new Date(row.withdrawn_at) : undefined,
    withdrawnBy: row.withdrawn_by,
    rejoinedAt: row.rejoined_at ? new Date(row.rejoined_at) : undefined,
  }
}

/** 전체 회원 목록 조회 (생성일 내림차순) */
export async function fetchMembers(): Promise<MemberListItem[]> {
  // 테스트 데이터 자동 삭제 (이전 캐시된 코드로 생성된 데이터 정리)
  await supabase
    .from('members')
    .delete()
    .or('id.like.test-%,email.like.%@test.com')

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toMember)
}

/** 회원 등급 변경 */
export async function updateMemberTier(
  memberId: string,
  tier: UserTier
): Promise<void> {
  const { error } = await supabase
    .from('members')
    .update({ tier })
    .eq('id', memberId)

  if (error) throw new Error(`등급 변경 실패: ${error.message}`)
}

/** 회원 상태 변경 */
export async function updateMemberStatus(
  memberId: string,
  status: MemberStatus
): Promise<void> {
  const { error } = await supabase
    .from('members')
    .update({ status })
    .eq('id', memberId)

  if (error) throw new Error(`상태 변경 실패: ${error.message}`)
}

/** 회원 삭제 (탈퇴 처리 - 데이터 보관) */
export async function deleteMember(memberId: string): Promise<void> {
  // 실제 삭제하지 않고 withdrawn 상태로 변경 (데이터 보관)
  const { error } = await supabase
    .from('members')
    .update({
      status: 'withdrawn',
      withdrawn_at: new Date().toISOString(),
      withdrawn_by: 'admin' // 관리자 탈퇴 처리
    })
    .eq('id', memberId)

  if (error) throw new Error(`회원 탈퇴 처리 실패: ${error.message}`)
}

/** 테스트 회원 일괄 삭제 */
export async function deleteTestMembers(): Promise<void> {
  const { error } = await supabase
    .from('members')
    .delete()
    .or('id.like.test-%,email.like.%@test.com')

  if (error) throw new Error(`테스트 회원 삭제 실패: ${error.message}`)
}
