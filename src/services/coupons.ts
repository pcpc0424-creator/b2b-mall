import { supabase } from '../lib/supabase'
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
  const { data, error } = await supabase
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
  const { data: coupon, error: findError } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (findError || !coupon) {
    throw new Error('유효하지 않은 쿠폰 코드입니다.')
  }

  // 2. 이미 보유 여부 확인
  const { data: existing } = await supabase
    .from('user_coupons')
    .select('id')
    .eq('user_id', userId)
    .eq('coupon_id', coupon.id)
    .maybeSingle()

  if (existing) {
    throw new Error('이미 보유한 쿠폰입니다.')
  }

  // 3. user_coupons에 추가
  const { data: uc, error: insertError } = await supabase
    .from('user_coupons')
    .insert({ user_id: userId, coupon_id: coupon.id })
    .select('*, coupons(*)')
    .single()

  if (insertError) throw insertError
  return toUserCoupon(uc)
}

/** 활성 쿠폰 전체 자동 발급 (신규 사용자용) */
export async function claimAllActiveCoupons(userId: string): Promise<void> {
  const { data: allCoupons } = await supabase
    .from('coupons')
    .select('id')
    .eq('is_active', true)

  if (!allCoupons || allCoupons.length === 0) return

  const inserts = allCoupons.map(c => ({
    user_id: userId,
    coupon_id: c.id,
  }))

  // ignoreDuplicates: 이미 보유한 쿠폰은 무시
  await supabase
    .from('user_coupons')
    .upsert(inserts, { onConflict: 'user_id,coupon_id', ignoreDuplicates: true })
}

/** 쿠폰 사용 처리 */
export async function markCouponUsed(userCouponId: string): Promise<void> {
  const { error } = await supabase
    .from('user_coupons')
    .update({ is_used: true, used_at: new Date().toISOString() })
    .eq('id', userCouponId)

  if (error) throw error
}
