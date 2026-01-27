import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPopupModals,
  createPopupModal,
  updatePopupModal,
  deletePopupModal,
  togglePopupModalActive,
} from '../../services/modals'
import type { PopupModal } from '../../admin/types/admin'

export function usePopupModals() {
  return useQuery({ queryKey: ['popupModals'], queryFn: fetchPopupModals })
}

export function useCreatePopupModal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPopupModal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['popupModals'] }),
  })
}

export function useUpdatePopupModal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PopupModal> }) =>
      updatePopupModal(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['popupModals'] }),
  })
}

export function useDeletePopupModal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletePopupModal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['popupModals'] }),
  })
}

export function useTogglePopupModalActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, currentActive }: { id: string; currentActive: boolean }) =>
      togglePopupModalActive(id, currentActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['popupModals'] }),
  })
}
