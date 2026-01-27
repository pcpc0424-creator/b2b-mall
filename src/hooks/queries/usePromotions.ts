import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionActive,
} from '../../services/promotions'
import type { AdminPromotion } from '../../admin/types/admin'

export function usePromotions() {
  return useQuery({ queryKey: ['promotions'], queryFn: fetchPromotions })
}

export function useCreatePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPromotion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
  })
}

export function useUpdatePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AdminPromotion> }) =>
      updatePromotion(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
  })
}

export function useDeletePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletePromotion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
  })
}

export function useTogglePromotionActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, currentActive }: { id: string; currentActive: boolean }) =>
      togglePromotionActive(id, currentActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
  })
}
