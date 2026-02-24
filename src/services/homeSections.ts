import { supabase, supabasePublic } from '../lib/supabase'
import type { HomeSection, HomeSectionType } from '../admin/types/admin'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

/** DB 행(snake_case) → HomeSection(camelCase) 변환 */
function toSection(row: DbRow): HomeSection {
  return {
    id: row.id,
    sectionType: row.section_type,
    productId: row.product_id,
    displayOrder: row.display_order ?? 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/** HomeSection(camelCase) → DB 행(snake_case) 변환 */
function toRow(section: Partial<HomeSection>): DbRow {
  const row: DbRow = {}
  if (section.id !== undefined) row.id = section.id
  if (section.sectionType !== undefined) row.section_type = section.sectionType
  if (section.productId !== undefined) row.product_id = section.productId
  if (section.displayOrder !== undefined) row.display_order = section.displayOrder
  return row
}

/** 전체 홈 섹션 조회 (섹션타입, 순서 정렬) */
export async function fetchHomeSections(): Promise<HomeSection[]> {
  const { data, error } = await supabasePublic
    .from('home_sections')
    .select('*')
    .order('section_type')
    .order('display_order', { ascending: true })

  if (error) throw error
  return (data || []).map(toSection)
}

/** 홈 섹션에 상품 추가 */
export async function addHomeSection(
  sectionType: HomeSectionType,
  productId: string,
  displayOrder: number
): Promise<HomeSection> {
  const now = new Date().toISOString()
  const row = toRow({ sectionType, productId, displayOrder })
  row.created_at = now
  row.updated_at = now

  const { data, error } = await supabasePublic
    .from('home_sections')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return toSection(data)
}

/** 홈 섹션에서 상품 제거 */
export async function removeHomeSection(id: string): Promise<void> {
  const { error } = await supabasePublic
    .from('home_sections')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/** 홈 섹션 순서 일괄 변경 */
export async function reorderHomeSections(
  items: { id: string; displayOrder: number }[]
): Promise<void> {
  const now = new Date().toISOString()
  for (const item of items) {
    const { error } = await supabasePublic
      .from('home_sections')
      .update({ display_order: item.displayOrder, updated_at: now })
      .eq('id', item.id)

    if (error) throw error
  }
}
