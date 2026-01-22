import { User, SocialProvider } from '../types'

// 회원 DB 시뮬레이션 (실제 서비스에서는 백엔드 API로 대체)
const MEMBERS_STORAGE_KEY = 'b2b-mall-members'

interface MemberRecord extends User {
  password?: string  // 이메일 가입 시에만 사용
}

// 소셜 로그인 응답 타입
interface SocialLoginResponse {
  success: boolean
  user?: User
  error?: string
  isNewUser?: boolean
}

// 이메일 로그인 응답 타입
interface EmailLoginResponse {
  success: boolean
  user?: User
  error?: string
}

// 회원가입 응답 타입
interface RegisterResponse {
  success: boolean
  user?: User
  error?: string
}

/**
 * 회원 DB에서 모든 회원 조회
 */
function getMembers(): MemberRecord[] {
  const data = localStorage.getItem(MEMBERS_STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

/**
 * 회원 DB에 회원 저장
 */
function saveMembers(members: MemberRecord[]): void {
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members))
}

/**
 * 이메일로 회원 찾기
 */
function findMemberByEmail(email: string): MemberRecord | undefined {
  const members = getMembers()
  return members.find(m => m.email.toLowerCase() === email.toLowerCase())
}

/**
 * 소셜 ID로 회원 찾기
 */
function findMemberBySocialId(provider: SocialProvider, providerId: string): MemberRecord | undefined {
  const members = getMembers()
  return members.find(m => m.provider === provider && m.providerId === providerId)
}

/**
 * 새 회원 ID 생성
 */
function generateMemberId(): string {
  return `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 이메일 회원가입
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
  phone: string,
  marketingConsent: boolean = false
): Promise<RegisterResponse> {
  // 이메일 중복 체크
  const existingMember = findMemberByEmail(email)
  if (existingMember) {
    return { success: false, error: '이미 가입된 이메일입니다.' }
  }

  const newMember: MemberRecord = {
    id: generateMemberId(),
    email,
    name,
    phone,
    password, // 실제 서비스에서는 해싱 필요
    tier: 'member',
    provider: 'email',
    createdAt: new Date(),
    isActive: true,
    marketingConsent,
  }

  const members = getMembers()
  members.push(newMember)
  saveMembers(members)

  // 비밀번호 제외하고 반환
  const { password: _, ...userWithoutPassword } = newMember
  return { success: true, user: userWithoutPassword }
}

/**
 * 이메일 로그인
 */
export async function loginWithEmail(email: string, password: string): Promise<EmailLoginResponse> {
  const member = findMemberByEmail(email)

  if (!member) {
    return { success: false, error: '등록되지 않은 이메일입니다.' }
  }

  if (member.provider !== 'email') {
    return {
      success: false,
      error: `이 이메일은 ${getProviderName(member.provider)} 계정으로 가입되어 있습니다.`
    }
  }

  if (member.password !== password) {
    return { success: false, error: '비밀번호가 일치하지 않습니다.' }
  }

  if (!member.isActive) {
    return { success: false, error: '비활성화된 계정입니다. 고객센터에 문의해주세요.' }
  }

  // 마지막 로그인 시간 업데이트
  const members = getMembers()
  const index = members.findIndex(m => m.id === member.id)
  if (index >= 0) {
    members[index].lastLoginAt = new Date()
    saveMembers(members)
  }

  const { password: _, ...userWithoutPassword } = member
  return { success: true, user: userWithoutPassword }
}

/**
 * 소셜 로그인/가입 처리
 * 소셜 로그인은 자동으로 회원가입 처리됩니다.
 */
export async function loginWithSocial(
  provider: SocialProvider,
  socialData: {
    providerId: string
    email: string
    name: string
    profileImage?: string
  }
): Promise<SocialLoginResponse> {
  // 기존 소셜 계정으로 가입된 회원 찾기
  let member = findMemberBySocialId(provider, socialData.providerId)
  let isNewUser = false

  if (!member) {
    // 같은 이메일로 가입된 회원이 있는지 확인
    const existingByEmail = findMemberByEmail(socialData.email)

    if (existingByEmail) {
      // 이미 다른 방법으로 가입된 이메일
      // 옵션 1: 에러 반환
      // return {
      //   success: false,
      //   error: `이 이메일은 이미 ${getProviderName(existingByEmail.provider)}(으)로 가입되어 있습니다.`
      // }

      // 옵션 2: 소셜 계정 연동 (현재 구현)
      const members = getMembers()
      const index = members.findIndex(m => m.id === existingByEmail.id)
      if (index >= 0) {
        members[index].socialAccounts = members[index].socialAccounts || []
        members[index].socialAccounts.push({
          provider,
          providerId: socialData.providerId,
          connectedAt: new Date()
        })
        members[index].lastLoginAt = new Date()
        saveMembers(members)
      }

      const { password: _, ...userWithoutPassword } = existingByEmail
      return { success: true, user: userWithoutPassword, isNewUser: false }
    }

    // 새 회원 생성
    const newMember: MemberRecord = {
      id: generateMemberId(),
      email: socialData.email,
      name: socialData.name,
      tier: 'member',
      provider,
      providerId: socialData.providerId,
      profileImage: socialData.profileImage,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
    }

    const members = getMembers()
    members.push(newMember)
    saveMembers(members)
    member = newMember
    isNewUser = true
  } else {
    // 기존 회원 로그인 시간 업데이트
    const members = getMembers()
    const index = members.findIndex(m => m.id === member!.id)
    if (index >= 0) {
      members[index].lastLoginAt = new Date()
      if (socialData.profileImage) {
        members[index].profileImage = socialData.profileImage
      }
      saveMembers(members)
    }
  }

  if (!member.isActive) {
    return { success: false, error: '비활성화된 계정입니다. 고객센터에 문의해주세요.' }
  }

  const { password: _, ...userWithoutPassword } = member
  return { success: true, user: userWithoutPassword, isNewUser }
}

/**
 * 소셜 로그인 시뮬레이션 (실제 서비스에서는 OAuth 플로우로 대체)
 */
export async function simulateSocialLogin(provider: SocialProvider): Promise<SocialLoginResponse> {
  // 시뮬레이션: 실제로는 OAuth 인증 후 서버에서 받아오는 데이터
  const mockSocialData = {
    kakao: {
      providerId: `kakao-${Date.now()}`,
      email: `kakao_user_${Date.now()}@kakao.com`,
      name: '카카오 사용자',
      profileImage: 'https://via.placeholder.com/100'
    },
    naver: {
      providerId: `naver-${Date.now()}`,
      email: `naver_user_${Date.now()}@naver.com`,
      name: '네이버 사용자',
      profileImage: 'https://via.placeholder.com/100'
    },
    google: {
      providerId: `google-${Date.now()}`,
      email: `google_user_${Date.now()}@gmail.com`,
      name: 'Google 사용자',
      profileImage: 'https://via.placeholder.com/100'
    },
  }

  if (provider === 'email') {
    return { success: false, error: '이메일 로그인은 loginWithEmail을 사용하세요.' }
  }

  const socialData = mockSocialData[provider]
  return loginWithSocial(provider, socialData)
}

/**
 * 회원 정보 업데이트
 */
export async function updateMember(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
  const members = getMembers()
  const index = members.findIndex(m => m.id === userId)

  if (index < 0) {
    return { success: false, error: '회원을 찾을 수 없습니다.' }
  }

  // 업데이트 불가능한 필드 제외
  const { id, email, provider, providerId, createdAt, ...allowedUpdates } = updates as any

  members[index] = { ...members[index], ...allowedUpdates }
  saveMembers(members)

  const { password: _, ...userWithoutPassword } = members[index]
  return { success: true, user: userWithoutPassword }
}

/**
 * 회원 등급 변경 (관리자용)
 */
export async function updateMemberTier(userId: string, tier: User['tier']): Promise<{ success: boolean; error?: string }> {
  const members = getMembers()
  const index = members.findIndex(m => m.id === userId)

  if (index < 0) {
    return { success: false, error: '회원을 찾을 수 없습니다.' }
  }

  members[index].tier = tier
  saveMembers(members)

  return { success: true }
}

/**
 * 회원 활성화/비활성화 (관리자용)
 */
export async function updateMemberActive(userId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  const members = getMembers()
  const index = members.findIndex(m => m.id === userId)

  if (index < 0) {
    return { success: false, error: '회원을 찾을 수 없습니다.' }
  }

  members[index].isActive = isActive
  saveMembers(members)

  return { success: true }
}

/**
 * 회원 탈퇴 (소프트 삭제)
 */
export async function deactivateMember(userId: string): Promise<{ success: boolean; error?: string }> {
  const members = getMembers()
  const index = members.findIndex(m => m.id === userId)

  if (index < 0) {
    return { success: false, error: '회원을 찾을 수 없습니다.' }
  }

  members[index].isActive = false
  saveMembers(members)

  return { success: true }
}

/**
 * 전체 회원 목록 조회 (관리자용)
 */
export function getAllMembers(): User[] {
  return getMembers().map(({ password, ...user }) => user)
}

/**
 * Provider 이름 반환
 */
function getProviderName(provider: SocialProvider): string {
  const names: Record<SocialProvider, string> = {
    kakao: '카카오',
    naver: '네이버',
    google: 'Google',
    email: '이메일'
  }
  return names[provider]
}

export { getProviderName }
