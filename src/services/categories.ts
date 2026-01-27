import { supabase } from '../lib/supabase'
import type { Category } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

function toCategory(row: DbRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon || undefined,
    image: row.image || undefined,
    subcategories: row.subcategories || [],
  }
}

/** 전체 카테고리 조회 */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []).map(toCategory)
}
