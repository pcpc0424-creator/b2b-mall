import { supabase } from '../lib/supabase'
import type { Notice } from '../types'

/**
 * 커뮤니티 서비스 (공지사항, FAQ, Q&A)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

// ===========================
// 공지사항
// ===========================

function toNotice(row: DbRow): Notice {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    isImportant: row.is_important,
    viewCount: row.view_count,
    createdAt: new Date(row.created_at),
  }
}

export async function fetchNotices(): Promise<Notice[]> {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toNotice)
}

export async function incrementNoticeViewCount(id: string): Promise<void> {
  await supabase.rpc('increment_view_count', { notice_id: id }).catch(() => {
    // rpc가 없으면 직접 업데이트
    supabase
      .from('notices')
      .update({ view_count: supabase.rpc ? undefined : 0 })
      .eq('id', id)
  })
}

// ===========================
// FAQ
// ===========================

export interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  sortOrder: number
}

function toFAQ(row: DbRow): FAQ {
  return {
    id: row.id,
    category: row.category,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
  }
}

export async function fetchFAQs(): Promise<FAQ[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []).map(toFAQ)
}

// ===========================
// Q&A
// ===========================

export interface QnAItem {
  id: string
  productId?: string
  productName: string
  productImage?: string
  question: string
  answer?: string
  author: string
  userId?: string
  isPrivate: boolean
  isAnswered: boolean
  createdAt: Date
  answeredAt?: Date
}

function toQnA(row: DbRow): QnAItem {
  return {
    id: row.id,
    productId: row.product_id || undefined,
    productName: row.product_name,
    productImage: row.product_image || undefined,
    question: row.question,
    answer: row.answer || undefined,
    author: row.author,
    userId: row.user_id || undefined,
    isPrivate: row.is_private,
    isAnswered: row.is_answered,
    createdAt: new Date(row.created_at),
    answeredAt: row.answered_at ? new Date(row.answered_at) : undefined,
  }
}

export async function fetchQnAs(): Promise<QnAItem[]> {
  const { data, error } = await supabase
    .from('qna')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toQnA)
}

export async function createQnA(input: {
  productId?: string
  productName: string
  productImage?: string
  question: string
  author: string
  userId?: string
  isPrivate: boolean
}): Promise<QnAItem> {
  const { data, error } = await supabase
    .from('qna')
    .insert({
      product_id: input.productId,
      product_name: input.productName,
      product_image: input.productImage,
      question: input.question,
      author: input.author,
      user_id: input.userId,
      is_private: input.isPrivate,
    })
    .select('*')
    .single()

  if (error) throw error
  return toQnA(data)
}
