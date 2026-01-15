import { Navigate, useLocation } from 'react-router-dom'
import { useAdminStore } from '../store/adminStore'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAdminAuthenticated } = useAdminStore()
  const location = useLocation()

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
