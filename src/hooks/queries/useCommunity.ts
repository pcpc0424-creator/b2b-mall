import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchNotices,
  fetchFAQs,
  fetchQnAs,
  createQnA,
} from '../../services/community'

/** 공지사항 목록 조회 */
export function useNotices() {
  return useQuery({
    queryKey: ['notices'],
    queryFn: fetchNotices,
  })
}

/** FAQ 목록 조회 */
export function useFAQs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: fetchFAQs,
  })
}

/** Q&A 목록 조회 */
export function useQnAs() {
  return useQuery({
    queryKey: ['qna'],
    queryFn: fetchQnAs,
  })
}

/** Q&A 작성 */
export function useCreateQnA() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createQnA,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qna'] })
    },
  })
}
