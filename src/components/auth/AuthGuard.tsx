import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'

interface AuthGuardProps {
  children: ReactNode
}

/**
 * 폐쇄몰 접근 제어 컴포넌트
 * 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoggedIn } = useStore()
  const location = useLocation()

  if (!isLoggedIn) {
    // 현재 위치를 state로 전달하여 로그인 후 원래 페이지로 돌아갈 수 있게 함
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
