import { supabase, supabasePublic } from '../lib/supabase'
import type { PopupModal } from '../admin/types/admin'

/**
 * 팝업 모달 서비스
 * DB 행(snake_case) ↔ PopupModal(camelCase) 변환 및 CRUD 제공
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

/** DB 행(snake_case) → PopupModal(camelCase) 변환 */
export function toModal(row: DbRow): PopupModal {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    image: row.image,
    isActive: row.is_active ?? true,
    targetPages: row.target_pages ?? [],
    showOnce: row.show_once ?? false,
    showToLoggedInOnly: row.show_to_logged_in_only ?? false,
    buttonText: row.button_text,
    buttonLink: row.button_link,
    startDate: row.start_date ? new Date(row.start_date) : undefined,
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    priority: row.priority ?? 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/** PopupModal(camelCase) → DB 행(snake_case) 변환 */
export function toRow(modal: Partial<PopupModal>): DbRow {
  const row: DbRow = {}

  if (modal.id !== undefined) row.id = modal.id
  if (modal.title !== undefined) row.title = modal.title
  if (modal.content !== undefined) row.content = modal.content
  if (modal.image !== undefined) row.image = modal.image
  if (modal.isActive !== undefined) row.is_active = modal.isActive
  if (modal.targetPages !== undefined) row.target_pages = modal.targetPages
  if (modal.showOnce !== undefined) row.show_once = modal.showOnce
  if (modal.showToLoggedInOnly !== undefined) row.show_to_logged_in_only = modal.showToLoggedInOnly
  if (modal.buttonText !== undefined) row.button_text = modal.buttonText
  if (modal.buttonLink !== undefined) row.button_link = modal.buttonLink
  if (modal.startDate !== undefined) row.start_date = modal.startDate instanceof Date
    ? modal.startDate.toISOString()
    : modal.startDate
  if (modal.endDate !== undefined) row.end_date = modal.endDate instanceof Date
    ? modal.endDate.toISOString()
    : modal.endDate
  if (modal.priority !== undefined) row.priority = modal.priority

  return row
}

/** 전체 팝업 모달 목록 조회 (우선순위 내림차순) */
export async function fetchPopupModals(): Promise<PopupModal[]> {
  const { data, error } = await supabasePublic
    .from('popup_modals')
    .select('*')
    .order('priority', { ascending: false })

  if (error) throw error
  return (data || []).map(toModal)
}

/** 팝업 모달 생성 */
export async function createPopupModal(
  modal: Partial<PopupModal>
): Promise<PopupModal> {
  const row = toRow(modal)
  row.created_at = new Date().toISOString()
  row.updated_at = new Date().toISOString()

  const { data, error } = await supabasePublic
    .from('popup_modals')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return toModal(data)
}

/** 팝업 모달 수정 */
export async function updatePopupModal(
  id: string,
  updates: Partial<PopupModal>
): Promise<void> {
  const row = toRow(updates)
  row.updated_at = new Date().toISOString()

  const { error } = await supabasePublic
    .from('popup_modals')
    .update(row)
    .eq('id', id)

  if (error) throw new Error(`모달 수정 실패: ${error.message}`)
}

/** 팝업 모달 삭제 */
export async function deletePopupModal(id: string): Promise<void> {
  const { error } = await supabasePublic
    .from('popup_modals')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/** 팝업 모달 활성화 토글 */
export async function togglePopupModalActive(
  id: string,
  currentActive: boolean
): Promise<void> {
  const { error } = await supabasePublic
    .from('popup_modals')
    .update({
      is_active: !currentActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(`모달 토글 실패: ${error.message}`)
}
