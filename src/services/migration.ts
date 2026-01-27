import { supabase } from '../lib/supabase'
import { uploadBase64Image } from './storage'
import { toRow } from './products'
import type { AdminProduct } from '../admin/types/admin'

const MIGRATION_FLAG = 'supabase-migration-done'

/** localStorage에 남아있는 이전 데이터를 Supabase로 마이그레이션 (1회만 실행) */
export async function migrateLocalStorageToSupabase(): Promise<void> {
  // 이미 마이그레이션 완료된 경우 스킵
  if (localStorage.getItem(MIGRATION_FLAG)) return

  const raw = localStorage.getItem('admin-storage')
  if (!raw) {
    localStorage.setItem(MIGRATION_FLAG, 'true')
    return
  }

  let parsed: { state?: { products?: AdminProduct[]; shippingSettings?: Record<string, unknown> } }
  try {
    parsed = JSON.parse(raw)
  } catch {
    localStorage.setItem(MIGRATION_FLAG, 'true')
    return
  }

  const products = parsed.state?.products
  if (!products || products.length === 0) {
    localStorage.setItem(MIGRATION_FLAG, 'true')
    return
  }

  console.log(`[migration] localStorage에서 ${products.length}개 상품 발견. Supabase로 마이그레이션 시작...`)

  let migrated = 0
  for (const product of products) {
    try {
      // base64 이미지를 Storage에 업로드
      const uploadedImages: string[] = []
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (typeof img === 'string' && img.startsWith('data:')) {
            try {
              const url = await uploadBase64Image('product-images', img)
              uploadedImages.push(url)
            } catch (e) {
              console.warn('[migration] 이미지 업로드 실패, 건너뜀:', e)
            }
          } else if (typeof img === 'string' && img) {
            uploadedImages.push(img)
          }
        }
      }

      // 상세 이미지도 업로드
      let uploadedDetailImages: string[] | undefined
      if (product.detailImages && product.detailImages.length > 0) {
        uploadedDetailImages = []
        for (const img of product.detailImages) {
          if (typeof img === 'string' && img.startsWith('data:')) {
            try {
              const url = await uploadBase64Image('product-images', img)
              uploadedDetailImages.push(url)
            } catch (e) {
              console.warn('[migration] 상세 이미지 업로드 실패, 건너뜀:', e)
            }
          } else if (typeof img === 'string' && img) {
            uploadedDetailImages.push(img)
          }
        }
      }

      const migratedProduct = {
        ...product,
        images: uploadedImages,
        detailImages: uploadedDetailImages ?? product.detailImages,
      }

      const row = toRow(migratedProduct)
      row.created_at = product.createdAt
        ? new Date(product.createdAt).toISOString()
        : new Date().toISOString()
      row.updated_at = product.updatedAt
        ? new Date(product.updatedAt).toISOString()
        : new Date().toISOString()

      const { error } = await supabase
        .from('products')
        .upsert(row, { onConflict: 'id' })

      if (error) {
        console.error(`[migration] 상품 "${product.name}" 마이그레이션 실패:`, error)
      } else {
        migrated++
      }
    } catch (e) {
      console.error(`[migration] 상품 "${product.name}" 처리 중 에러:`, e)
    }
  }

  // 배송비 설정 마이그레이션
  const shippingSettings = parsed.state?.shippingSettings
  if (shippingSettings && Object.keys(shippingSettings).length > 0) {
    try {
      const { error } = await supabase
        .from('shipping_settings')
        .upsert({
          id: 'default',
          base_fee: shippingSettings.baseFee ?? 3000,
          free_shipping_threshold: shippingSettings.freeShippingThreshold,
          tiers: shippingSettings.tiers ?? [],
          regions: shippingSettings.regions ?? [],
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (error) {
        console.error('[migration] 배송비 설정 마이그레이션 실패:', error)
      } else {
        console.log('[migration] 배송비 설정 마이그레이션 완료')
      }
    } catch (e) {
      console.error('[migration] 배송비 설정 처리 중 에러:', e)
    }
  }

  console.log(`[migration] 완료: ${migrated}/${products.length}개 상품 마이그레이션됨`)
  localStorage.setItem(MIGRATION_FLAG, 'true')
}
