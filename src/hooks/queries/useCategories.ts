import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '../../services/categories'

/** 전체 카테고리 목록 조회 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5분간 캐시
  })
}
