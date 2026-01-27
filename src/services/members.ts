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
  }
}

/** 테스트 회원 시드 데이터 */
const TEST_MEMBERS_SEED = [
  {
    id: 'test-member-001',
    name: '테스트 사용자',
    email: 'test@test.com',
    tier: 'member',
    status: 'active',
    provider: 'email',
    total_orders: 0,
    total_spent: 0,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'test-vip-001',
    name: 'VIP 테스트',
    email: 'vip@test.com',
    tier: 'vip',
    status: 'active',
    provider: 'email',
    total_orders: 5,
    total_spent: 500000,
    created_at: '2024-01-01T00:00:00Z',
  },
]

/** 테스트 회원 시드 (Supabase) */
let seeded = false
async function ensureTestMembers(): Promise<void> {
  if (seeded) return
  seeded = true

  try {
    const { error } = await supabase
      .from('members')
      .upsert(TEST_MEMBERS_SEED, { onConflict: 'id' })
    if (error) {
      console.error('테스트 회원 시드 실패:', error.message)
    }
  } catch (err) {
    console.error('테스트 회원 시드 중 예외 발생:', err)
  }
}

/** 전체 회원 목록 조회 (생성일 내림차순) */
export async function fetchMembers(): Promise<MemberListItem[]> {
  await ensureTestMembers()

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('회원 목록 조회 실패:', error.message)
    return []
  }

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
