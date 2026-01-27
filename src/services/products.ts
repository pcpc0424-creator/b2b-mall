import { supabase } from '../lib/supabase'
import type { AdminProduct } from '../admin/types/admin'

/**
 * 상품 서비스
 * DB 행(snake_case) ↔ AdminProduct(camelCase) 변환 및 CRUD 제공
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

/** DB 행(snake_case) → AdminProduct(camelCase) 변환 */
export function toProduct(row: DbRow): AdminProduct {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    categoryId: row.category_id,
    subcategory: row.subcategory,
    images: row.images ?? [],
    prices: row.prices ?? { retail: 0, member: 0, premium: 0, vip: 0 },
    minQuantity: row.min_quantity ?? 1,
    maxQuantity: row.max_quantity,
    stock: row.stock ?? 0,
    stockStatus: row.stock_status ?? 'available',
    options: row.options,
    isActive: row.is_active ?? true,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by,
    adminOptions: row.admin_options,
    variants: row.variants,
    shipping: row.shipping,
    description: row.description,
    detailImages: row.detail_images,
    showOptionImages: row.show_option_images,
    quantityDiscounts: row.quantity_discounts,
  }
}

/** AdminProduct(camelCase) → DB 행(snake_case) 변환 */
export function toRow(product: Partial<AdminProduct>): DbRow {
  const row: DbRow = {}

  if (product.id !== undefined) row.id = product.id
  if (product.sku !== undefined) row.sku = product.sku
  if (product.name !== undefined) row.name = product.name
  if (product.brand !== undefined) row.brand = product.brand
  if (product.categoryId !== undefined) row.category_id = product.categoryId
  if (product.subcategory !== undefined) row.subcategory = product.subcategory
  if (product.images !== undefined) row.images = product.images
  if (product.prices !== undefined) row.prices = product.prices
  if (product.minQuantity !== undefined) row.min_quantity = product.minQuantity
  if (product.maxQuantity !== undefined) row.max_quantity = product.maxQuantity
  if (product.stock !== undefined) row.stock = product.stock
  if (product.stockStatus !== undefined) row.stock_status = product.stockStatus
  if (product.options !== undefined) row.options = product.options
  if (product.isActive !== undefined) row.is_active = product.isActive
  if (product.createdBy !== undefined) row.created_by = product.createdBy
  if (product.adminOptions !== undefined) row.admin_options = product.adminOptions
  if (product.variants !== undefined) row.variants = product.variants
  if (product.shipping !== undefined) row.shipping = product.shipping
  if (product.description !== undefined) row.description = product.description
  if (product.detailImages !== undefined) row.detail_images = product.detailImages
  if (product.showOptionImages !== undefined) row.show_option_images = product.showOptionImages
  if (product.quantityDiscounts !== undefined) row.quantity_discounts = product.quantityDiscounts

  return row
}

/** 전체 상품 목록 조회 (생성일 내림차순) */
export async function fetchProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toProduct)
}

/** 단일 상품 조회. 없으면 null 반환 */
export async function fetchProductById(id: string): Promise<AdminProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    // PGRST116: 결과가 없을 때
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data ? toProduct(data) : null
}

/** 상품 생성 */
export async function createProduct(product: Partial<AdminProduct>): Promise<AdminProduct> {
  const row = toRow(product)
  row.created_at = new Date().toISOString()
  row.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('products')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return toProduct(data)
}

/** 상품 수정 */
export async function updateProduct(
  id: string,
  updates: Partial<AdminProduct>
): Promise<AdminProduct> {
  const row = toRow(updates)
  row.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('products')
    .update(row)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toProduct(data)
}

/** 상품 삭제 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}
