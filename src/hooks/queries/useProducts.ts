import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/products'
import type { AdminProduct } from '../../admin/types/admin'

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: fetchProducts })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    onError: (err) => console.error('상품 생성 실패:', err),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AdminProduct> }) =>
      updateProduct(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    onError: (err) => console.error('상품 수정 실패:', err),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    onError: (err) => console.error('상품 삭제 실패:', err),
  })
}
