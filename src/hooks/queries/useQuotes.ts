import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserQuotes, saveQuote } from '../../services/quotes'
import type { QuoteItemData } from '../../services/quotes'

/** 사용자의 견적서 목록 조회 */
export function useUserQuotes(userId: string | undefined) {
  return useQuery({
    queryKey: ['quotes', userId],
    queryFn: () => fetchUserQuotes(userId!),
    enabled: !!userId,
  })
}

/** 견적서 저장 */
export function useSaveQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      userId: string
      items: QuoteItemData[]
      totalAmount: number
      memo?: string
      deliveryDate?: Date
    }) => saveQuote(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] })
    },
  })
}
