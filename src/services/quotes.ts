import { supabasePublic } from '../lib/supabase'

/**
 * 견적서 서비스
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

export interface SavedQuote {
  id: string
  quoteNumber: string
  userId: string
  items: QuoteItemData[]
  totalAmount: number
  memo?: string
  status: 'draft' | 'confirmed' | 'converted'
  deliveryDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface QuoteItemData {
  productId: string
  productName: string
  sku: string
  image: string
  unitPrice: number
  quantity: number
  subtotal: number
}

function toSavedQuote(row: DbRow): SavedQuote {
  return {
    id: row.id,
    quoteNumber: row.quote_number,
    userId: row.user_id,
    items: row.items || [],
    totalAmount: Number(row.total_amount),
    memo: row.memo || undefined,
    status: row.status,
    deliveryDate: row.delivery_date ? new Date(row.delivery_date) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/** 사용자의 견적서 목록 조회 */
export async function fetchUserQuotes(userId: string): Promise<SavedQuote[]> {
  const { data, error } = await supabasePublic
    .from('quotes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toSavedQuote)
}

/** 견적서 저장 */
export async function saveQuote(input: {
  userId: string
  items: QuoteItemData[]
  totalAmount: number
  memo?: string
  deliveryDate?: Date
}): Promise<SavedQuote> {
  const quoteNumber = `QT-${Date.now().toString().slice(-8)}`
  const now = new Date().toISOString()

  const { data, error } = await supabasePublic
    .from('quotes')
    .insert({
      quote_number: quoteNumber,
      user_id: input.userId,
      items: input.items,
      total_amount: input.totalAmount,
      memo: input.memo || null,
      status: 'draft',
      delivery_date: input.deliveryDate?.toISOString() || null,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single()

  if (error) throw error
  return toSavedQuote(data)
}
