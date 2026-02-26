import { supabase } from '../lib/supabase'
import { CartItem, Product } from '../types'
import { fetchProductById } from './products'

/**
 * 장바구니 서비스
 * Supabase와 장바구니 데이터 동기화
 */

interface DbCartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  selected_options: Record<string, string> | null
  created_at: string
  updated_at: string
}

/** 서버에서 사용자의 장바구니 로드 */
export async function fetchServerCart(): Promise<CartItem[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('장바구니 로드 실패:', error)
      return []
    }

    // product_id로 실제 상품 정보 가져오기
    const cartItems: CartItem[] = []
    for (const item of (data as DbCartItem[]) || []) {
      try {
        const product = await fetchProductById(item.product_id)
        if (product) {
          cartItems.push({
            product: product as unknown as Product,
            quantity: item.quantity,
            selectedOptions: item.selected_options || undefined,
          })
        }
      } catch (err) {
        // 개별 상품 로드 실패 시 스킵 (삭제된 상품 등)
        console.warn('상품 로드 실패:', item.product_id, err)
      }
    }

    return cartItems
  } catch (err: unknown) {
    // AbortError 등 네트워크 에러 무시
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('장바구니 로드 중단됨')
    } else {
      console.error('장바구니 로드 실패:', err)
    }
    return []
  }
}

/** 서버에 장바구니 아이템 추가/업데이트 (upsert) */
export async function upsertCartItem(
  productId: string,
  quantity: number,
  selectedOptions?: Record<string, string>
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // selected_options가 null이거나 빈 객체면 null로 저장 (UNIQUE 제약조건 일관성)
    const optionsValue = selectedOptions && Object.keys(selectedOptions).length > 0
      ? selectedOptions
      : null

    const { error } = await supabase
      .from('cart_items')
      .upsert(
        {
          user_id: user.id,
          product_id: productId,
          quantity,
          selected_options: optionsValue,
        },
        {
          onConflict: 'user_id,product_id,selected_options',
        }
      )

    if (error) {
      console.error('장바구니 저장 실패:', error)
      return false
    }

    return true
  } catch (err) {
    // AbortError 등 무시
    return false
  }
}

/** 서버에서 장바구니 아이템 삭제 */
export async function removeCartItem(
  productId: string,
  selectedOptions?: Record<string, string>
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const optionsValue = selectedOptions && Object.keys(selectedOptions).length > 0
      ? selectedOptions
      : null

    // selected_options가 null인 경우와 있는 경우 구분
    if (optionsValue === null) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .is('selected_options', null)

      if (error) {
        console.error('장바구니 아이템 삭제 실패:', error)
        return false
      }
    } else {
      // JSONB 비교를 위해 contains 사용
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .contains('selected_options', optionsValue)

      if (error) {
        console.error('장바구니 아이템 삭제 실패:', error)
        return false
      }
    }

    return true
  } catch (err) {
    // AbortError는 페이지 이동 등으로 인한 정상적인 취소이므로 무시
    if (err instanceof Error && err.name === 'AbortError') {
      return false
    }
    console.error('장바구니 삭제 중 오류:', err)
    return false
  }
}

/** 서버에서 장바구니 전체 삭제 */
export async function clearServerCart(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('장바구니 비우기 실패:', error)
      return false
    }

    return true
  } catch (err) {
    return false
  }
}

/** 로컬 장바구니를 서버에 동기화 (병합) */
export async function syncLocalCartToServer(localCart: CartItem[]): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || localCart.length === 0) return

    // 각 로컬 아이템을 서버에 upsert
    for (const item of localCart) {
      await upsertCartItem(
        item.product.id,
        item.quantity,
        item.selectedOptions
      )
    }
  } catch (err) {
    // 무시
  }
}

/**
 * 로그인 시 장바구니 동기화
 * - 서버에 장바구니가 있으면 서버 장바구니 사용
 * - 서버에 없고 로컬에만 있으면 로컬 장바구니를 서버에 저장
 */
export async function mergeCartsOnLogin(localCart: CartItem[]): Promise<CartItem[]> {
  // 1. 서버에서 장바구니 로드
  const serverCart = await fetchServerCart()

  // 2. 서버에 장바구니가 있으면 서버 장바구니 사용 (로컬 무시)
  if (serverCart.length > 0) {
    return serverCart
  }

  // 3. 서버에 없고 로컬에만 있으면 로컬 장바구니를 서버에 저장
  if (localCart.length > 0) {
    await syncLocalCartToServer(localCart)
    return localCart
  }

  // 4. 둘 다 비어있으면 빈 배열 반환
  return []
}
