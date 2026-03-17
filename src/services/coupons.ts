import { supabasePublic } from '../lib/supabase'
import type { Coupon } from '../types'

/**
 * 쿠폰 서비스
 * Supabase coupons + user_coupons 테이블 연동
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

/** DB 조인 결과 → Coupon 변환 (user_coupons JOIN coupons) */
function toUserCoupon(row: DbRow): Coupon {
  const c = row.coupons
  return {
    id: row.id, // user_coupons.id (사용 처리 시 이 ID 사용)
    code: c.code,
    name: c.name,
    description: (c.description || '').replace(/\s+/g, ' ').trim(),
    discountType: c.discount_type as 'percent' | 'fixed',
    discountValue: Number(c.discount_value),
    minOrderAmount: c.min_order_amount ? Number(c.min_order_amount) : undefined,
    maxDiscountAmount: c.max_discount_amount ? Number(c.max_discount_amount) : undefined,
    validFrom: new Date(c.valid_from),
    validUntil: new Date(c.valid_until),
    isUsed: row.is_used,
    usedAt: row.used_at ? new Date(row.used_at) : undefined,
  }
}

/** 사용자의 쿠폰 목록 조회 */
export async function fetchUserCoupons(userId: string): Promise<Coupon[]> {
  const { data, error } = await supabasePublic
    .from('user_coupons')
    .select('*, coupons(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toUserCoupon)
}

/** 쿠폰 코드로 등록 (user_coupons에 추가) */
export async function registerCouponByCode(userId: string, code: string): Promise<Coupon> {
  // 1. 쿠폰 코드로 조회
  const { data: coupon, error: findError } = await supabasePublic
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (findError || !coupon) {
    throw new Error('유효하지 않은 쿠폰 코드입니다.')
  }

  // 2. 이미 보유 여부 확인
  const { data: existing } = await supabasePublic
    .from('user_coupons')
    .select('id')
    .eq('user_id', userId)
    .eq('coupon_id', coupon.id)
    .maybeSingle()

  if (existing) {
    throw new Error('이미 보유한 쿠폰입니다.')
  }

  // 3. user_coupons에 추가
  const { data: uc, error: insertError } = await supabasePublic
    .from('user_coupons')
    .insert({ user_id: userId, coupon_id: coupon.id })
    .select('*, coupons(*)')
    .single()

  if (insertError) throw insertError
  return toUserCoupon(uc)
}

/** 활성 쿠폰 전체 자동 발급 (신규 사용자용) */
export async function claimAllActiveCoupons(userId: string): Promise<void> {
  const { data: allCoupons } = await supabasePublic
    .from('coupons')
    .select('id')
    .eq('is_active', true)

  if (!allCoupons || allCoupons.length === 0) return

  const inserts = allCoupons.map(c => ({
    user_id: userId,
    coupon_id: c.id,
  }))

  // ignoreDuplicates: 이미 보유한 쿠폰은 무시
  await supabasePublic
    .from('user_coupons')
    .upsert(inserts, { onConflict: 'user_id,coupon_id', ignoreDuplicates: true })
}

/** 쿠폰 사용 처리 */
export async function markCouponUsed(userCouponId: string): Promise<void> {
  const { error } = await supabasePublic
    .from('user_coupons')
    .update({ is_used: true, used_at: new Date().toISOString() })
    .eq('id', userCouponId)

  if (error) throw error
}

// ============ 관리자용 함수 ============

export interface AdminCoupon {
  id: string
  code: string
  name: string
  description: string | null
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order_amount: number | null
  max_discount_amount: number | null
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
}

export interface CreateCouponInput {
  code: string
  name: string
  description?: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order_amount?: number
  max_discount_amount?: number
  valid_from: string
  valid_until: string
  is_active?: boolean
}

/** 관리자: 전체 쿠폰 목록 조회 */
export async function fetchAllCoupons(): Promise<AdminCoupon[]> {
  const { data, error } = await supabasePublic
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/** 관리자: 쿠폰 생성 */
export async function createCoupon(input: CreateCouponInput): Promise<AdminCoupon> {
  const { data, error } = await supabasePublic
    .from('coupons')
    .insert({
      code: input.code.toUpperCase(),
      name: input.name,
      description: input.description || null,
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      min_order_amount: input.min_order_amount || null,
      max_discount_amount: input.max_discount_amount || null,
      valid_from: input.valid_from,
      valid_until: input.valid_until,
      is_active: input.is_active ?? true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/** 관리자: 쿠폰 수정 */
export async function updateCoupon(id: string, input: Partial<CreateCouponInput>): Promise<AdminCoupon> {
  const updateData: Record<string, unknown> = {}

  if (input.code !== undefined) updateData.code = input.code.toUpperCase()
  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description || null
  if (input.discount_type !== undefined) updateData.discount_type = input.discount_type
  if (input.discount_value !== undefined) updateData.discount_value = input.discount_value
  if (input.min_order_amount !== undefined) updateData.min_order_amount = input.min_order_amount || null
  if (input.max_discount_amount !== undefined) updateData.max_discount_amount = input.max_discount_amount || null
  if (input.valid_from !== undefined) updateData.valid_from = input.valid_from
  if (input.valid_until !== undefined) updateData.valid_until = input.valid_until
  if (input.is_active !== undefined) updateData.is_active = input.is_active

  const { data, error } = await supabasePublic
    .from('coupons')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/** 관리자: 쿠폰 삭제 */
export async function deleteCoupon(id: string): Promise<void> {
  // 먼저 user_coupons에서 해당 쿠폰 참조 삭제
  await supabasePublic
    .from('user_coupons')
    .delete()
    .eq('coupon_id', id)

  const { error } = await supabasePublic
    .from('coupons')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/** 관리자: 특정 회원들에게 쿠폰 발급 */
export async function issueCouponToUsers(couponId: string, userIds: string[]): Promise<{ success: number; skipped: number }> {
  let success = 0
  let skipped = 0

  for (const userId of userIds) {
    // 이미 보유 여부 확인
    const { data: existing } = await supabasePublic
      .from('user_coupons')
      .select('id')
      .eq('user_id', userId)
      .eq('coupon_id', couponId)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    // user_coupons에 추가
    const { error } = await supabasePublic
      .from('user_coupons')
      .insert({ user_id: userId, coupon_id: couponId })

    if (!error) {
      success++
    } else {
      skipped++
    }
  }

  return { success, skipped }
}

/** 관리자: 전체 회원에게 쿠폰 발급 */
export async function issueCouponToAllUsers(couponId: string): Promise<{ success: number; skipped: number }> {
  // 모든 회원 조회
  const { data: members, error: membersError } = await supabasePublic
    .from('members')
    .select('id')

  if (membersError) throw membersError
  if (!members || members.length === 0) return { success: 0, skipped: 0 }

  const userIds = members.map(m => m.id)
  return issueCouponToUsers(couponId, userIds)
}

// ============ 발급 현황 조회/회수 ============

export interface IssuedCouponItem {
  id: string // user_coupons.id
  coupon_id: string
  coupon_code: string
  coupon_name: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  user_id: string
  user_name: string
  user_email: string
  is_used: boolean
  used_at: string | null
  issued_at: string
}

/** 관리자: 발급된 쿠폰 전체 목록 조회 */
export async function fetchIssuedCoupons(): Promise<IssuedCouponItem[]> {
  // user_coupons 조회
  const { data: userCoupons, error: ucError } = await supabasePublic
    .from('user_coupons')
    .select(`
      id,
      coupon_id,
      user_id,
      is_used,
      used_at,
      created_at,
      coupons (
        code,
        name,
        discount_type,
        discount_value
      )
    `)
    .order('created_at', { ascending: false })

  if (ucError) throw ucError
  if (!userCoupons || userCoupons.length === 0) return []

  // 모든 user_id 수집
  const userIds = [...new Set(userCoupons.map(uc => uc.user_id))]

  // members 조회
  const { data: members } = await supabasePublic
    .from('members')
    .select('id, name, email')
    .in('id', userIds)

  // members를 Map으로 변환
  const memberMap = new Map((members || []).map(m => [m.id, m]))

  return userCoupons.map((row: DbRow) => {
    const member = memberMap.get(row.user_id)
    return {
      id: row.id,
      coupon_id: row.coupon_id,
      coupon_code: row.coupons?.code || '',
      coupon_name: row.coupons?.name || '',
      discount_type: row.coupons?.discount_type || 'percent',
      discount_value: row.coupons?.discount_value || 0,
      user_id: row.user_id,
      user_name: member?.name || '(탈퇴한 회원)',
      user_email: member?.email || '',
      is_used: row.is_used || false,
      used_at: row.used_at,
      issued_at: row.created_at,
    }
  })
}

/** 관리자: 특정 쿠폰의 발급 현황 조회 */
export async function fetchIssuedCouponsByCouponId(couponId: string): Promise<IssuedCouponItem[]> {
  // user_coupons 조회
  const { data: userCoupons, error: ucError } = await supabasePublic
    .from('user_coupons')
    .select(`
      id,
      coupon_id,
      user_id,
      is_used,
      used_at,
      created_at,
      coupons (
        code,
        name,
        discount_type,
        discount_value
      )
    `)
    .eq('coupon_id', couponId)
    .order('created_at', { ascending: false })

  if (ucError) throw ucError
  if (!userCoupons || userCoupons.length === 0) return []

  // 모든 user_id 수집
  const userIds = [...new Set(userCoupons.map(uc => uc.user_id))]

  // members 조회
  const { data: members } = await supabasePublic
    .from('members')
    .select('id, name, email')
    .in('id', userIds)

  // members를 Map으로 변환
  const memberMap = new Map((members || []).map(m => [m.id, m]))

  return userCoupons.map((row: DbRow) => {
    const member = memberMap.get(row.user_id)
    return {
      id: row.id,
      coupon_id: row.coupon_id,
      coupon_code: row.coupons?.code || '',
      coupon_name: row.coupons?.name || '',
      discount_type: row.coupons?.discount_type || 'percent',
      discount_value: row.coupons?.discount_value || 0,
      user_id: row.user_id,
      user_name: member?.name || '(탈퇴한 회원)',
      user_email: member?.email || '',
      is_used: row.is_used || false,
      used_at: row.used_at,
      issued_at: row.created_at,
    }
  })
}

/** 관리자: 쿠폰 회수 (user_coupons에서 삭제) */
export async function revokeUserCoupon(userCouponId: string): Promise<void> {
  const { error } = await supabasePublic
    .from('user_coupons')
    .delete()
    .eq('id', userCouponId)

  if (error) throw error
}
