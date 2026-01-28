import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchHomeSections,
  addHomeSection,
  removeHomeSection,
  reorderHomeSections,
} from '../../services/homeSections'
import type { HomeSectionType } from '../../admin/types/admin'

export function useHomeSections() {
  return useQuery({ queryKey: ['homeSections'], queryFn: fetchHomeSections })
}

export function useAddHomeSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sectionType, productId, displayOrder }: {
      sectionType: HomeSectionType
      productId: string
      displayOrder: number
    }) => addHomeSection(sectionType, productId, displayOrder),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['homeSections'] }),
    onError: (err) => console.error('홈 섹션 추가 실패:', err),
  })
}

export function useRemoveHomeSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: removeHomeSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['homeSections'] }),
    onError: (err) => console.error('홈 섹션 삭제 실패:', err),
  })
}

export function useReorderHomeSections() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reorderHomeSections,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['homeSections'] }),
    onError: (err) => console.error('홈 섹션 정렬 실패:', err),
  })
}
