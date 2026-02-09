import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2분
      gcTime: 1000 * 60 * 10, // 10분
      retry: (failureCount, error) => {
        // AbortError는 재시도하지 않음
        if (error instanceof Error && error.name === 'AbortError') {
          return false
        }
        return failureCount < 2
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      refetchOnWindowFocus: true,
      // AbortError 등 쿼리 취소 에러는 무시
      throwOnError: (error) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return false
        }
        return false
      },
    },
    mutations: {
      // mutation 에러 중 AbortError는 무시
      throwOnError: (error) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return false
        }
        return false
      },
    },
  },
})

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
