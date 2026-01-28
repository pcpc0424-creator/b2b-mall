import { supabase } from '../lib/supabase'
import type { ShippingSettings, TierSettings, SiteSettings } from '../admin/types/admin'

/**
 * 설정 서비스
 * 배송비, 등급, 사이트 설정의 DB 행(snake_case) ↔ 타입(camelCase) 변환 및 CRUD 제공
 * 각 설정은 id='default' 행 하나를 upsert 방식으로 관리
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

// ──────────────────────────────────────────────
// Shipping Settings
// ──────────────────────────────────────────────

/** DB 행 → ShippingSettings 변환 */
function toShippingSettings(row: DbRow): ShippingSettings {
  return {
    id: row.id,
    name: row.name,
    type: row.type ?? 'flat',
    isDefault: row.is_default ?? true,
    baseFee: row.base_fee ?? 0,
    freeShippingThreshold: row.free_shipping_threshold,
    tiers: row.tiers,
    regions: row.regions,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/** ShippingSettings → DB 행 변환 */
function shippingToRow(settings: Partial<ShippingSettings>): DbRow {
  const row: DbRow = {}

  if (settings.id !== undefined) row.id = settings.id
  if (settings.name !== undefined) row.name = settings.name
  if (settings.type !== undefined) row.type = settings.type
  if (settings.isDefault !== undefined) row.is_default = settings.isDefault
  if (settings.baseFee !== undefined) row.base_fee = settings.baseFee
  if (settings.freeShippingThreshold !== undefined) row.free_shipping_threshold = settings.freeShippingThreshold
  if (settings.tiers !== undefined) row.tiers = settings.tiers
  if (settings.regions !== undefined) row.regions = settings.regions

  return row
}

/** 배송비 설정 조회 (id='default') */
export async function fetchShippingSettings(): Promise<ShippingSettings> {
  const { data, error } = await supabase
    .from('shipping_settings')
    .select('*')
    .eq('id', 'default')
    .single()

  if (error) throw error
  return toShippingSettings(data)
}

/** 배송비 설정 upsert (id='default') */
export async function upsertShippingSettings(
  settings: Partial<ShippingSettings>
): Promise<void> {
  const row = shippingToRow(settings)
  row.id = 'default'
  row.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from('shipping_settings')
    .upsert(row)

  if (error) throw new Error(`배송비 설정 저장 실패: ${error.message}`)
}

// ──────────────────────────────────────────────
// Tier Settings
// ──────────────────────────────────────────────

/** DB 행 → TierSettings 변환 */
function toTierSettings(row: DbRow): TierSettings {
  return {
    isEnabled: row.is_enabled ?? false,
    autoUpgrade: row.auto_upgrade ?? false,
    autoDowngrade: row.auto_downgrade ?? false,
    evaluationPeriod: row.evaluation_period ?? 'monthly',
    thresholds: row.thresholds ?? [],
    updatedAt: new Date(row.updated_at),
  }
}

/** TierSettings → DB 행 변환 */
function tierToRow(settings: Partial<TierSettings>): DbRow {
  const row: DbRow = {}

  if (settings.isEnabled !== undefined) row.is_enabled = settings.isEnabled
  if (settings.autoUpgrade !== undefined) row.auto_upgrade = settings.autoUpgrade
  if (settings.autoDowngrade !== undefined) row.auto_downgrade = settings.autoDowngrade
  if (settings.evaluationPeriod !== undefined) row.evaluation_period = settings.evaluationPeriod
  if (settings.thresholds !== undefined) row.thresholds = settings.thresholds

  return row
}

/** 등급 설정 조회 (id='default') */
export async function fetchTierSettings(): Promise<TierSettings> {
  const { data, error } = await supabase
    .from('tier_settings')
    .select('*')
    .eq('id', 'default')
    .single()

  if (error) throw error
  return toTierSettings(data)
}

/** 등급 설정 upsert (id='default') */
export async function upsertTierSettings(
  settings: Partial<TierSettings>
): Promise<void> {
  const row = tierToRow(settings)
  row.id = 'default'
  row.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from('tier_settings')
    .upsert(row)

  if (error) throw new Error(`등급 설정 저장 실패: ${error.message}`)
}

// ──────────────────────────────────────────────
// Site Settings
// ──────────────────────────────────────────────

/** DB 행 → SiteSettings 변환 */
function toSiteSettings(row: DbRow): SiteSettings {
  return {
    topBanner: row.top_banner ?? {
      image: '',
      alt: '',
      isActive: false,
    },
    updatedAt: new Date(row.updated_at),
  }
}

/** SiteSettings → DB 행 변환 */
function siteToRow(settings: Partial<SiteSettings>): DbRow {
  const row: DbRow = {}

  if (settings.topBanner !== undefined) row.top_banner = settings.topBanner

  return row
}

/** 사이트 설정 조회 (id='default') */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'default')
    .single()

  if (error) throw error
  return toSiteSettings(data)
}

/** 사이트 설정 upsert (id='default') */
export async function upsertSiteSettings(
  settings: Partial<SiteSettings>
): Promise<void> {
  const row = siteToRow(settings)
  row.id = 'default'
  row.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from('site_settings')
    .upsert(row)

  if (error) throw new Error(`사이트 설정 저장 실패: ${error.message}`)
}
