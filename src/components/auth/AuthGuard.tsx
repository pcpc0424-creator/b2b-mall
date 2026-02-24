import { ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { refreshUserTier } from '../../services/auth'
import { UserTier } from '../../types'

interface AuthGuardProps {
  children: ReactNode
}

/**
 * 폐쇄몰 접근 제어 컴포넌트
 * 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
 * 로그인한 사용자는 서버에서 최신 등급을 가져와 동기화합니다.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoggedIn, user, setUserTier } = useStore()
  const location = useLocation()

  // 페이지 접근 시 서버에서 최신 등급 가져오기
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      refreshUserTier(user.id).then((tier) => {
        if (tier && tier !== user.tier) {
          setUserTier(tier as UserTier)
        }
      }).catch(console.error)
    }
  }, [isLoggedIn, user?.id, location.pathname])

  if (!isLoggedIn) {
    // 현재 위치를 state로 전달하여 로그인 후 원래 페이지로 돌아갈 수 있게 함
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
