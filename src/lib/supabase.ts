import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 인증용 클라이언트 (로그인, 회원 관련)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 공용 데이터 조회용 클라이언트 (세션 없이 anon 키만 사용)
// 로그인 상태와 무관하게 항상 동작
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
