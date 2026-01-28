import { supabase } from '../lib/supabase'
import { User, SocialProvider } from '../types'

/**
 * Supabase Auth 기반 인증 서비스
 * - 이메일 회원가입/로그인: Supabase Auth + members 테이블
 * - 소셜 로그인: Supabase OAuth (카카오/네이버/구글)
 * - localStorage 기존 회원 마이그레이션 지원
 */

// localStorage 키 (마이그레이션용)
const MEMBERS_STORAGE_KEY = 'b2b-mall-members'
const MEMBERS_MIGRATED_KEY = 'b2b-mall-members-supabase-migrated'

// ── 응답 타입 ──────────────────────────────────────────

interface EmailLoginResponse {
  success: boolean
  user?: User
  error?: string
}

interface RegisterResponse {
  success: boolean
  user?: User
  error?: string
}

interface SocialLoginResponse {
  success: boolean
  error?: string
}

// ── DB → App 변환 ──────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

function toUser(row: DbRow): User {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    tier: row.tier || 'member',
    phone: row.phone,
    company: row.company,
    businessNumber: row.business_number,
    provider: row.provider || 'email',
    providerId: row.provider_id,
    profileImage: row.profile_image,
    createdAt: new Date(row.created_at),
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
    isActive: row.status !== 'inactive' && row.status !== 'suspended' && row.status !== 'withdrawn',
    marketingConsent: row.marketing_consent,
  }
}

// ── 내부 유틸 ──────────────────────────────────────────

/** Supabase members 테이블에서 프로필 조회 */
async function fetchMemberProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return toUser(data)
}

/** members 테이블 upsert */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertMemberProfile(profile: Record<string, any>): Promise<void> {
  const { error } = await supabase
    .from('members')
    .upsert(profile, { onConflict: 'id' })

  if (error) {
    console.error('프로필 저장 실패:', error.message)
  }
}

// ── 이메일 회원가입 ────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
  phone: string,
  marketingConsent: boolean = false
): Promise<RegisterResponse> {
  // 1. Supabase Auth 계정 생성
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    if (
      authError.message.includes('already registered') ||
      authError.message.includes('User already registered')
    ) {
      return { success: false, error: '이미 가입된 이메일입니다.' }
    }
    return { success: false, error: `회원가입 실패: ${authError.message}` }
  }

  if (!authData.user) {
    return { success: false, error: '회원가입에 실패했습니다.' }
  }

  // 2. members 테이블에 프로필 저장
  const profileData = {
    id: authData.user.id,
    email,
    name,
    phone,
    tier: 'member',
    status: 'active',
    provider: 'email',
    marketing_consent: marketingConsent,
    total_orders: 0,
    total_spent: 0,
    created_at: new Date().toISOString(),
    last_login_at: new Date().toISOString(),
  }

  await upsertMemberProfile(profileData)

  const user = await fetchMemberProfile(authData.user.id)
  return { success: true, user: user || undefined }
}

// ── 이메일 로그인 ──────────────────────────────────────

export async function loginWithEmail(
  email: string,
  password: string
): Promise<EmailLoginResponse> {
  // 1. Supabase Auth 로그인 시도
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (!error && data.user) {
    // 로그인 성공 → 프로필 조회/생성
    await supabase
      .from('members')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)

    let user = await fetchMemberProfile(data.user.id)

    if (!user) {
      // Auth 계정은 있지만 프로필이 없는 경우 → 생성
      await upsertMemberProfile({
        id: data.user.id,
        email: data.user.email,
        name: data.user.email?.split('@')[0] || '회원',
        tier: 'member',
        status: 'active',
        provider: 'email',
        total_orders: 0,
        total_spent: 0,
        created_at: data.user.created_at || new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      })
      user = await fetchMemberProfile(data.user.id)
    }

    if (user && !user.isActive) {
      await supabase.auth.signOut()
      return { success: false, error: '비활성화된 계정입니다. 고객센터에 문의해주세요.' }
    }

    return { success: true, user: user || undefined }
  }

  // 2. Supabase Auth 실패 → localStorage 폴백 (기존 회원 마이그레이션)
  const localMember = tryLocalStorageLogin(email, password)
  if (localMember) {
    // localStorage에서 찾음 → Supabase Auth 계정 자동 생성
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpData?.user) {
      // 프로필 마이그레이션
      await upsertMemberProfile({
        id: signUpData.user.id,
        email: localMember.email,
        name: localMember.name,
        phone: localMember.phone,
        tier: localMember.tier || 'member',
        status: localMember.isActive !== false ? 'active' : 'inactive',
        provider: localMember.provider || 'email',
        company: localMember.company,
        business_number: localMember.businessNumber,
        marketing_consent: localMember.marketingConsent,
        profile_image: localMember.profileImage,
        total_orders: 0,
        total_spent: 0,
        created_at: localMember.createdAt || new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      })

      const user = await fetchMemberProfile(signUpData.user.id)
      return { success: true, user: user || undefined }
    }

    // signUp도 실패한 경우 (이미 다른 비밀번호로 존재하는 등)
    if (signUpError) {
      console.warn('localStorage 회원 마이그레이션 실패:', signUpError.message)
    }
  }

  // 3. 모두 실패
  return { success: false, error: '이메일 또는 비밀번호가 일치하지 않습니다.' }
}

// ── localStorage 폴백 (마이그레이션용) ─────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tryLocalStorageLogin(email: string, password: string): any | null {
  try {
    const data = localStorage.getItem(MEMBERS_STORAGE_KEY)
    if (!data) return null

    const members = JSON.parse(data)
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      members.find(
        (m: any) =>
          m.email?.toLowerCase() === email.toLowerCase() &&
          m.password === password &&
          m.provider === 'email'
      ) || null
    )
  } catch {
    return null
  }
}

// ── 소셜 로그인 (Supabase OAuth) ───────────────────────

export async function loginWithSocial(
  provider: SocialProvider
): Promise<SocialLoginResponse> {
  if (provider === 'email') {
    return { success: false, error: '이메일 로그인은 loginWithEmail을 사용하세요.' }
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'kakao' | 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      scopes: provider === 'kakao' ? 'profile_nickname profile_image' : undefined,
    },
  })

  if (error) {
    return { success: false, error: `소셜 로그인 실패: ${error.message}` }
  }

  // OAuth는 리다이렉트 방식 → 브라우저가 이동하므로 여기서 끝
  return { success: true }
}

// ── 현재 세션 사용자 조회 ──────────────────────────────

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) return null

  // 먼저 members 테이블에서 raw 데이터 조회
  const { data: memberData } = await supabase
    .from('members')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const meta = session.user.user_metadata || {}
  const provider = session.user.app_metadata?.provider || 'email'

  // 프로필이 없거나, 탈퇴 회원이 다시 로그인한 경우 → 프로필 생성/재활성화
  if (!memberData || memberData.status === 'withdrawn') {
    await upsertMemberProfile({
      id: session.user.id,
      email: session.user.email,
      name:
        meta.nickname ||
        meta.full_name ||
        meta.name ||
        meta.preferred_username ||
        session.user.email?.split('@')[0] ||
        '회원',
      phone: meta.phone,
      tier: 'member',
      status: 'active',
      provider: provider,
      profile_image: meta.avatar_url || meta.picture,
      total_orders: memberData?.total_orders || 0,
      total_spent: memberData?.total_spent || 0,
      created_at: memberData?.created_at || session.user.created_at || new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    })
  }

  const user = await fetchMemberProfile(session.user.id)
  return user
}

// ── 로그아웃 ───────────────────────────────────────────

export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut()
}

// ── 회원 탈퇴 ──────────────────────────────────────────

export async function withdrawAccount(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // members 테이블에서 삭제
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', userId)

  if (error) {
    return { success: false, error: `탈퇴 처리 실패: ${error.message}` }
  }

  await supabase.auth.signOut()
  return { success: true }
}

// ── 회원 정보 업데이트 ─────────────────────────────────

export async function updateMember(
  userId: string,
  updates: Partial<User>
): Promise<{ success: boolean; user?: User; error?: string }> {
  // camelCase → snake_case 변환
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbUpdates: Record<string, any> = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone
  if (updates.company !== undefined) dbUpdates.company = updates.company
  if (updates.businessNumber !== undefined) dbUpdates.business_number = updates.businessNumber
  if (updates.profileImage !== undefined) dbUpdates.profile_image = updates.profileImage
  if (updates.marketingConsent !== undefined) dbUpdates.marketing_consent = updates.marketingConsent

  const { error } = await supabase
    .from('members')
    .update(dbUpdates)
    .eq('id', userId)

  if (error) {
    return { success: false, error: `업데이트 실패: ${error.message}` }
  }

  const user = await fetchMemberProfile(userId)
  return { success: true, user: user || undefined }
}

// ── localStorage 회원 → Supabase 마이그레이션 ─────────

export async function migrateLocalMembers(): Promise<void> {
  if (localStorage.getItem(MEMBERS_MIGRATED_KEY)) return

  const data = localStorage.getItem(MEMBERS_STORAGE_KEY)
  if (!data) {
    localStorage.setItem(MEMBERS_MIGRATED_KEY, 'true')
    return
  }

  try {
    const members = JSON.parse(data)
    for (const member of members) {
      try {
        await supabase.from('members').upsert(
          {
            id: member.id,
            email: member.email,
            name: member.name,
            phone: member.phone,
            tier: member.tier || 'member',
            status: member.isActive !== false ? 'active' : 'inactive',
            provider: member.provider || 'email',
            company: member.company,
            business_number: member.businessNumber,
            marketing_consent: member.marketingConsent,
            profile_image: member.profileImage,
            total_orders: 0,
            total_spent: 0,
            created_at: member.createdAt || new Date().toISOString(),
            last_login_at: member.lastLoginAt,
          },
          { onConflict: 'id' }
        )
      } catch (err) {
        console.error(`회원 마이그레이션 실패 (${member.email}):`, err)
      }
    }
  } catch (err) {
    console.error('localStorage 회원 파싱 실패:', err)
  }

  localStorage.setItem(MEMBERS_MIGRATED_KEY, 'true')
}

// ── Provider 이름 반환 ─────────────────────────────────

export function getProviderName(provider: SocialProvider): string {
  const names: Record<SocialProvider, string> = {
    kakao: '카카오',
    naver: '네이버',
    google: 'Google',
    email: '이메일',
  }
  return names[provider]
}
