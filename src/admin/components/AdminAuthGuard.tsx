import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminStore } from '../store/adminStore'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAdminAuthenticated } = useAdminStore()
  const location = useLocation()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Zustand persist가 hydration을 완료할 때까지 기다림
    const unsubscribe = useAdminStore.persist.onFinishHydration(() => {
      setIsHydrated(true)
    })

    // 이미 hydration이 완료된 경우
    if (useAdminStore.persist.hasHydrated()) {
      setIsHydrated(true)
    }

    return () => {
      unsubscribe()
    }
  }, [])

  // Hydration 완료 전에는 로딩 표시
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-neutral-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
