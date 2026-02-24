import { supabasePublic } from '../lib/supabase'
import type { SavedShippingAddress, SavedShippingAddressInput } from '../admin/types/admin'

/**
 * 배송지 관리 서비스
 * DB 행(snake_case) ↔ SavedShippingAddress(camelCase) 변환 및 CRUD 제공
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

/** DB 행 → SavedShippingAddress 변환 */
function toShippingAddress(row: DbRow): SavedShippingAddress {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    recipient: row.recipient,
    phone: row.phone,
    postalCode: row.postal_code,
    address1: row.address1,
    address2: row.address2 ?? undefined,
    notes: row.notes ?? undefined,
    isDefault: row.is_default ?? false,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/** 사용자의 배송지 목록 조회 */
export async function fetchUserShippingAddresses(userId: string): Promise<SavedShippingAddress[]> {
  const { data, error } = await supabasePublic
    .from('shipping_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(`배송지 조회 실패: ${error.message}`)
  return (data || []).map(toShippingAddress)
}

/** 배송지 생성 */
export async function createShippingAddress(
  userId: string,
  input: SavedShippingAddressInput
): Promise<SavedShippingAddress> {
  const now = new Date().toISOString()

  // 기본 배송지로 설정하는 경우 기존 기본 배송지 해제
  if (input.isDefault) {
    await supabasePublic
      .from('shipping_addresses')
      .update({ is_default: false, updated_at: now })
      .eq('user_id', userId)
      .eq('is_default', true)
  }

  const { data, error } = await supabasePublic
    .from('shipping_addresses')
    .insert({
      user_id: userId,
      name: input.name,
      recipient: input.recipient,
      phone: input.phone,
      postal_code: input.postalCode,
      address1: input.address1,
      address2: input.address2 ?? null,
      notes: input.notes ?? null,
      is_default: input.isDefault ?? false,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) throw new Error(`배송지 생성 실패: ${error.message}`)
  return toShippingAddress(data)
}

/** 배송지 수정 */
export async function updateShippingAddress(
  id: string,
  userId: string,
  input: SavedShippingAddressInput
): Promise<SavedShippingAddress> {
  const now = new Date().toISOString()

  // 기본 배송지로 설정하는 경우 기존 기본 배송지 해제
  if (input.isDefault) {
    await supabasePublic
      .from('shipping_addresses')
      .update({ is_default: false, updated_at: now })
      .eq('user_id', userId)
      .eq('is_default', true)
      .neq('id', id)
  }

  const { data, error } = await supabasePublic
    .from('shipping_addresses')
    .update({
      name: input.name,
      recipient: input.recipient,
      phone: input.phone,
      postal_code: input.postalCode,
      address1: input.address1,
      address2: input.address2 ?? null,
      notes: input.notes ?? null,
      is_default: input.isDefault ?? false,
      updated_at: now,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(`배송지 수정 실패: ${error.message}`)
  return toShippingAddress(data)
}

/** 배송지 삭제 */
export async function deleteShippingAddress(id: string): Promise<void> {
  const { error } = await supabasePublic
    .from('shipping_addresses')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`배송지 삭제 실패: ${error.message}`)
}

/** 기본 배송지 설정 */
export async function setDefaultShippingAddress(id: string, userId: string): Promise<void> {
  const now = new Date().toISOString()

  // 기존 기본 배송지 해제
  await supabasePublic
    .from('shipping_addresses')
    .update({ is_default: false, updated_at: now })
    .eq('user_id', userId)
    .eq('is_default', true)

  // 새 기본 배송지 설정
  const { error } = await supabasePublic
    .from('shipping_addresses')
    .update({ is_default: true, updated_at: now })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(`기본 배송지 설정 실패: ${error.message}`)
}
