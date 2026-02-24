import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  fetchFAQs,
  fetchAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  fetchQnAs,
  createQnA,
  answerQnA,
  deleteQnA,
} from '../../services/community'

/** 공지사항 목록 조회 */
export function useNotices() {
  return useQuery({
    queryKey: ['notices'],
    queryFn: fetchNotices,
  })
}

/** 공지사항 생성 */
export function useCreateNotice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notices'] })
    },
    onError: (err) => console.error('공지사항 생성 실패:', err),
  })
}

/** 공지사항 수정 */
export function useUpdateNotice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; title?: string; content?: string; category?: 'notice' | 'event' | 'update' | 'important'; isImportant?: boolean }) =>
      updateNotice(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notices'] })
    },
    onError: (err) => console.error('공지사항 수정 실패:', err),
  })
}

/** 공지사항 삭제 */
export function useDeleteNotice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notices'] })
    },
    onError: (err) => console.error('공지사항 삭제 실패:', err),
  })
}

/** FAQ 목록 조회 (사용자용 - 활성만) */
export function useFAQs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: fetchFAQs,
  })
}

/** FAQ 목록 조회 (관리자용 - 전체) */
export function useAllFAQs() {
  return useQuery({
    queryKey: ['faqs', 'all'],
    queryFn: fetchAllFAQs,
  })
}

/** FAQ 생성 */
export function useCreateFAQ() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createFAQ,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
    },
    onError: (err) => console.error('FAQ 생성 실패:', err),
  })
}

/** FAQ 수정 */
export function useUpdateFAQ() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; category?: string; question?: string; answer?: string; sortOrder?: number; isActive?: boolean }) =>
      updateFAQ(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
    },
    onError: (err) => console.error('FAQ 수정 실패:', err),
  })
}

/** FAQ 삭제 */
export function useDeleteFAQ() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteFAQ,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
    },
    onError: (err) => console.error('FAQ 삭제 실패:', err),
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
    onError: (err) => console.error('Q&A 작성 실패:', err),
  })
}

/** Q&A 답변 */
export function useAnswerQnA() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, answer }: { id: string; answer: string }) => answerQnA(id, answer),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qna'] })
    },
    onError: (err) => console.error('Q&A 답변 실패:', err),
  })
}

/** Q&A 삭제 */
export function useDeleteQnA() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteQnA,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qna'] })
    },
    onError: (err) => console.error('Q&A 삭제 실패:', err),
  })
}
