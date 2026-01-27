import { supabase } from '../lib/supabase'
import type { MemberListItem, MemberStatus } from '../admin/types/admin'
import type { UserTier } from '../types'

/**
 * 회원 서비스
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
  }
}

/** 전체 회원 목록 조회 (생성일 내림차순) */
export async function fetchMembers(): Promise<MemberListItem[]> {
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
): Promise<MemberListItem> {
  const { data, error } = await supabase
    .from('members')
    .update({ tier })
    .eq('id', memberId)
    .select()
    .single()

  if (error) throw error
  return toMember(data)
}

/** 회원 상태 변경 */
export async function updateMemberStatus(
  memberId: string,
  status: MemberStatus
): Promise<MemberListItem> {
  const { data, error } = await supabase
    .from('members')
    .update({ status })
    .eq('id', memberId)
    .select()
    .single()

  if (error) throw error
  return toMember(data)
}
