import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './providers/QueryProvider'
import { supabasePublic } from './lib/supabase'
import { useStore } from './store'

// AbortError 전역 핸들러 (페이지 전환 시 발생하는 네트워크 취소 에러 무시)
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof Error && event.reason.name === 'AbortError') {
    event.preventDefault()
  }
})

// OAuth 콜백 및 세션 처리 (앱 렌더링 전)
async function initAuthAndRender() {
  const hash = window.location.hash

  // 1. OAuth 콜백 처리 (URL에 토큰이 있는 경우)
  if (hash && hash.includes('access_token')) {
    console.log('[Main] OAuth 콜백 감지, 세션 설정')

    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken && refreshToken) {
      // 세션 데이터를 로컬 스토리지에 직접 저장
      const storageKey = `sb-${import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`

      // JWT 디코딩 (base64)
      const tokenParts = accessToken.split('.')
      const payload = JSON.parse(atob(tokenParts[1]))

      const sessionData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: payload.exp,
        expires_in: payload.exp - Math.floor(Date.now() / 1000),
        token_type: 'bearer',
        user: {
          id: payload.sub,
          aud: payload.aud,
          role: payload.role,
          email: payload.email,
          app_metadata: payload.app_metadata || {},
          user_metadata: payload.user_metadata || {},
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(sessionData))
      console.log('[Main] 세션 저장 완료')
    }

    // URL 해시 제거 후 새로고침
    window.location.replace(window.location.pathname)
    return
  }

  // 2. 로컬 스토리지에서 세션 확인 및 로그인 처리
  const storageKey = `sb-${import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`
  const storedSession = localStorage.getItem(storageKey)

  if (storedSession) {
    try {
      const sessionData = JSON.parse(storedSession)
      if (sessionData.access_token && sessionData.user) {
        console.log('[Main] 로컬 세션 발견:', sessionData.user.email)
        const now = Math.floor(Date.now() / 1000)

        if (sessionData.expires_at > now) {
          console.log('[Main] 세션 유효, members 테이블 조회')

          // supabasePublic으로 members 테이블 직접 조회 (AbortError 방지)
          const userId = sessionData.user.id
          const userEmail = sessionData.user.email

          let memberData = null

          // ID로 조회
          const { data: memberById } = await supabasePublic
            .from('members')
            .select('*')
            .eq('id', userId)
            .single()

          if (memberById) {
            memberData = memberById
          } else if (userEmail) {
            // 이메일로 조회
            const { data: memberByEmail } = await supabasePublic
              .from('members')
              .select('*')
              .eq('email', userEmail.toLowerCase())
              .single()
            memberData = memberByEmail
          }

          if (memberData) {
            console.log('[Main] 회원 정보 발견, 로그인 처리')
            const user = {
              id: memberData.id,
              email: memberData.email,
              name: memberData.name || sessionData.user.user_metadata?.preferred_username || '회원',
              phone: memberData.phone,
              tier: memberData.tier || 'member',
              organization: memberData.organization,
              provider: memberData.provider || 'kakao',
              profileImage: memberData.profile_image || sessionData.user.user_metadata?.avatar_url,
              createdAt: memberData.created_at,
              marketingAgreed: memberData.marketing_agreed,
              isActive: memberData.status === 'active',
            }
            useStore.getState().login(user as any)
            console.log('[Main] 로그인 완료:', user.email)
          } else {
            console.log('[Main] 회원 정보 없음 - 신규 회원, App에서 처리')
          }
        } else {
          console.log('[Main] 세션 만료됨')
          localStorage.removeItem(storageKey)
        }
      }
    } catch (err) {
      console.error('[Main] 세션 처리 오류:', err)
    }
  } else {
    console.log('[Main] 저장된 세션 없음')
  }

  // 3. 앱 렌더링
  createRoot(document.getElementById('root')!).render(
    <QueryProvider>
      <App />
    </QueryProvider>,
  )
}

initAuthAndRender()
