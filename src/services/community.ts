import { supabase, supabasePublic } from '../lib/supabase'
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
  const { data, error } = await supabasePublic
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toNotice)
}

export async function incrementNoticeViewCount(id: string): Promise<void> {
  const { error } = await supabasePublic.rpc('increment_view_count', { notice_id: id })
  if (error) {
    // rpc가 없으면 직접 업데이트
    const { data } = await supabasePublic.from('notices').select('view_count').eq('id', id).single()
    if (data) {
      await supabasePublic.from('notices').update({ view_count: (data.view_count || 0) + 1 }).eq('id', id)
    }
  }
}

export async function createNotice(input: {
  title: string
  content: string
  category: 'notice' | 'event' | 'update' | 'important'
  isImportant: boolean
}): Promise<Notice> {
  const { data, error } = await supabasePublic
    .from('notices')
    .insert({
      title: input.title,
      content: input.content,
      category: input.category,
      is_important: input.isImportant,
      view_count: 0,
    })
    .select('*')
    .single()

  if (error) throw error
  return toNotice(data)
}

export async function updateNotice(id: string, input: {
  title?: string
  content?: string
  category?: 'notice' | 'event' | 'update' | 'important'
  isImportant?: boolean
}): Promise<Notice> {
  const updates: DbRow = {}
  if (input.title !== undefined) updates.title = input.title
  if (input.content !== undefined) updates.content = input.content
  if (input.category !== undefined) updates.category = input.category
  if (input.isImportant !== undefined) updates.is_important = input.isImportant

  const { data, error } = await supabasePublic
    .from('notices')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return toNotice(data)
}

export async function deleteNotice(id: string): Promise<void> {
  const { error } = await supabasePublic
    .from('notices')
    .delete()
    .eq('id', id)

  if (error) throw error
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
  const { data, error } = await supabasePublic
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []).map(toFAQ)
}

// 관리자용: 모든 FAQ 조회 (비활성 포함)
export async function fetchAllFAQs(): Promise<(FAQ & { isActive: boolean })[]> {
  const { data, error } = await supabasePublic
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []).map(row => ({
    ...toFAQ(row),
    isActive: row.is_active,
  }))
}

export async function createFAQ(input: {
  category: string
  question: string
  answer: string
  sortOrder?: number
  isActive?: boolean
}): Promise<FAQ> {
  const { data, error } = await supabasePublic
    .from('faqs')
    .insert({
      category: input.category,
      question: input.question,
      answer: input.answer,
      sort_order: input.sortOrder ?? 0,
      is_active: input.isActive ?? true,
    })
    .select('*')
    .single()

  if (error) throw error
  return toFAQ(data)
}

export async function updateFAQ(id: string, input: {
  category?: string
  question?: string
  answer?: string
  sortOrder?: number
  isActive?: boolean
}): Promise<FAQ> {
  const updates: DbRow = {}
  if (input.category !== undefined) updates.category = input.category
  if (input.question !== undefined) updates.question = input.question
  if (input.answer !== undefined) updates.answer = input.answer
  if (input.sortOrder !== undefined) updates.sort_order = input.sortOrder
  if (input.isActive !== undefined) updates.is_active = input.isActive

  const { data, error } = await supabasePublic
    .from('faqs')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return toFAQ(data)
}

export async function deleteFAQ(id: string): Promise<void> {
  const { error } = await supabasePublic
    .from('faqs')
    .delete()
    .eq('id', id)

  if (error) throw error
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
  const { data, error } = await supabasePublic
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
  const { data, error } = await supabasePublic
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

export async function answerQnA(id: string, answer: string): Promise<QnAItem> {
  const { data, error } = await supabasePublic
    .from('qna')
    .update({
      answer,
      is_answered: true,
      answered_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return toQnA(data)
}

export async function deleteQnA(id: string): Promise<void> {
  const { error } = await supabasePublic
    .from('qna')
    .delete()
    .eq('id', id)

  if (error) throw error
}
