import { supabase } from '../lib/supabase'
import type { AdminPromotion } from '../admin/types/admin'

/**
 * 프로모션 서비스
 * DB 행(snake_case) ↔ AdminPromotion(camelCase) 변환 및 CRUD 제공
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

/** DB 행(snake_case) → AdminPromotion(camelCase) 변환 */
export function toPromotion(row: DbRow): AdminPromotion {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    discount: row.discount ?? 0,
    startDate: new Date(row.start_date as string || Date.now()),
    endDate: new Date(row.end_date as string || Date.now()),
    targetTiers: row.target_tiers ?? [],
    type: row.type ?? 'all',
    isActive: row.is_active ?? true,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by,
  }
}

/** AdminPromotion(camelCase) → DB 행(snake_case) 변환 */
export function toRow(promotion: Partial<AdminPromotion>): DbRow {
  const row: DbRow = {}

  if (promotion.id !== undefined) row.id = promotion.id
  if (promotion.title !== undefined) row.title = promotion.title
  if (promotion.description !== undefined) row.description = promotion.description
  if (promotion.image !== undefined) row.image = promotion.image
  if (promotion.discount !== undefined) row.discount = promotion.discount
  if (promotion.startDate !== undefined) row.start_date = promotion.startDate instanceof Date
    ? promotion.startDate.toISOString()
    : promotion.startDate
  if (promotion.endDate !== undefined) row.end_date = promotion.endDate instanceof Date
    ? promotion.endDate.toISOString()
    : promotion.endDate
  if (promotion.targetTiers !== undefined) row.target_tiers = promotion.targetTiers
  if (promotion.type !== undefined) row.type = promotion.type
  if (promotion.isActive !== undefined) row.is_active = promotion.isActive
  if (promotion.createdBy !== undefined) row.created_by = promotion.createdBy

  return row
}

/** 전체 프로모션 목록 조회 (생성일 내림차순) */
export async function fetchPromotions(): Promise<AdminPromotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toPromotion)
}

/** 프로모션 생성 */
export async function createPromotion(
  promotion: Partial<AdminPromotion>
): Promise<AdminPromotion> {
  const row = toRow(promotion)
  row.created_at = new Date().toISOString()
  row.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('promotions')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return toPromotion(data)
}

/** 프로모션 수정 */
export async function updatePromotion(
  id: string,
  updates: Partial<AdminPromotion>
): Promise<void> {
  const row = toRow(updates)
  row.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from('promotions')
    .update(row)
    .eq('id', id)

  if (error) throw new Error(`프로모션 수정 실패: ${error.message}`)
}

/** 프로모션 삭제 */
export async function deletePromotion(id: string): Promise<void> {
  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/** 프로모션 활성화 토글 */
export async function togglePromotionActive(
  id: string,
  currentActive: boolean
): Promise<void> {
  const { error } = await supabase
    .from('promotions')
    .update({
      is_active: !currentActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(`프로모션 토글 실패: ${error.message}`)
}
