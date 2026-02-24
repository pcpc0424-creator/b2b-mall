import { supabasePublic } from '../lib/supabase'
import type { Review } from '../types'

/**
 * 리뷰 서비스
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

function toReview(row: DbRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    author: row.author,
    rating: row.rating,
    title: row.title,
    content: row.content,
    images: row.images && row.images.length > 0 ? row.images : undefined,
    helpful: row.helpful,
    verified: row.verified,
    createdAt: new Date(row.created_at),
  }
}

/** 특정 상품의 리뷰 조회 */
export async function fetchProductReviews(productId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabasePublic
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    // 테이블이 없거나 에러 시 빈 배열 반환
    if (error) {
      console.warn('리뷰 조회 오류:', error.message)
      return []
    }
    return (data || []).map(toReview)
  } catch (err) {
    console.warn('리뷰 조회 예외:', err)
    return []
  }
}

/** 리뷰 작성 */
export async function createReview(input: {
  productId: string
  author: string
  userId?: string
  rating: number
  title: string
  content: string
}): Promise<Review> {
  const { data, error } = await supabasePublic
    .from('reviews')
    .insert({
      product_id: input.productId,
      author: input.author,
      user_id: input.userId,
      rating: input.rating,
      title: input.title,
      content: input.content,
    })
    .select('*')
    .single()

  if (error) throw error
  return toReview(data)
}

/** 도움이 돼요 +1 */
export async function incrementHelpful(reviewId: string): Promise<void> {
  // 현재 값을 읽고 +1
  const { data: review } = await supabasePublic
    .from('reviews')
    .select('helpful')
    .eq('id', reviewId)
    .single()

  if (!review) return

  await supabasePublic
    .from('reviews')
    .update({ helpful: review.helpful + 1 })
    .eq('id', reviewId)
}
