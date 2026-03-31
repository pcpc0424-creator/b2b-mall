import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './providers/QueryProvider'
import { supabase } from './lib/supabase'

// AbortError 전역 핸들러 (페이지 전환 시 발생하는 네트워크 취소 에러 무시)
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof Error && event.reason.name === 'AbortError') {
    event.preventDefault()
  }
})

// OAuth 콜백 및 세션 처리 (앱 렌더링 전)
async function initAuthAndRender() {
  const hash = window.location.hash

  // 1. OAuth 콜백 처리 (URL에 해시가 있는 경우)
  if (hash && hash.length > 1) {
    const params = new URLSearchParams(hash.substring(1))

    // 에러 응답 처리
    const error = params.get('error')
    const errorDescription = params.get('error_description')
    if (error) {
      console.error('[Main] OAuth 에러:', error, errorDescription)
      window.location.replace('/login?error=' + encodeURIComponent(errorDescription || error))
      return
    }

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken && refreshToken) {
      console.log('[Main] OAuth 콜백 감지, Supabase setSession 호출')

      try {
        // Supabase 공식 API로 세션 설정 (형식 불일치 문제 해결)
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          console.error('[Main] 세션 설정 실패:', sessionError.message)
        } else {
          console.log('[Main] 세션 설정 완료')
        }
      } catch (err) {
        console.error('[Main] 세션 설정 오류:', err)
      }

      // URL 해시 제거 후 새로고침 (App.tsx의 onAuthStateChange가 처리)
      window.location.replace(window.location.pathname)
      return
    }

    // 해시가 있지만 토큰이 없는 경우 (잘못된 콜백) - 해시만 제거
    console.log('[Main] 해시 제거:', hash)
    window.location.replace(window.location.pathname + window.location.search)
    return
  }

  // 2. 앱 렌더링 (세션 복원은 Supabase 클라이언트 + App.tsx onAuthStateChange가 처리)
  createRoot(document.getElementById('root')!).render(
    <QueryProvider>
      <App />
    </QueryProvider>,
  )
}

initAuthAndRender()
