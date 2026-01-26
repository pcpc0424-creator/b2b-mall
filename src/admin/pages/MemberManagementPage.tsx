import { useState, useEffect, useCallback } from 'react'
import { Search, Eye, RefreshCw } from 'lucide-react'
import { useAdminStore } from '../store/adminStore'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import { formatPrice, cn } from '../../lib/utils'
import { MemberListItem, MemberStatus } from '../types/admin'
import { UserTier, SocialProvider } from '../../types'
import { getAllMembers, getProviderName, updateMemberTier as updateMemberTierDB, updateMemberActive } from '../../services/auth'

// 데모 회원 데이터
const mockMembers: MemberListItem[] = [
  {
    id: 'user-1',
    name: '김철수',
    email: 'kim@example.com',
    tier: 'vip',
    status: 'active',
    totalOrders: 15,
    totalSpent: 2500000,
    createdAt: new Date('2023-06-15'),
    lastOrderAt: new Date('2024-01-15'),
  },
  {
    id: 'user-2',
    name: '이영희',
    email: 'lee@example.com',
    tier: 'member',
    status: 'active',
    totalOrders: 5,
    totalSpent: 350000,
    createdAt: new Date('2023-10-20'),
    lastOrderAt: new Date('2024-01-10'),
  },
  {
    id: 'user-3',
    name: '박지민',
    email: 'park@example.com',
    tier: 'premium',
    status: 'active',
    totalOrders: 45,
    totalSpent: 15000000,
    createdAt: new Date('2023-03-01'),
    lastOrderAt: new Date('2024-01-14'),
  },
  {
    id: 'user-4',
    name: '최수진',
    email: 'choi@example.com',
    tier: 'member',
    status: 'inactive',
    totalOrders: 2,
    totalSpent: 120000,
    createdAt: new Date('2023-12-01'),
    lastOrderAt: new Date('2023-12-15'),
  },
  {
    id: 'user-5',
    name: '정민호',
    email: 'jung@example.com',
    tier: 'vip',
    status: 'active',
    totalOrders: 120,
    totalSpent: 85000000,
    createdAt: new Date('2022-08-10'),
    lastOrderAt: new Date('2024-01-16'),
  },
]

const tierConfig: Record<UserTier, { label: string; color: string }> = {
  guest: { label: '비회원', color: 'bg-neutral-100 text-neutral-700' },
  member: { label: '일반회원', color: 'bg-green-100 text-green-700' },
  premium: { label: '우수회원', color: 'bg-blue-100 text-blue-700' },
  vip: { label: 'VIP회원', color: 'bg-amber-100 text-amber-700' },
}

const statusConfig: Record<MemberStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  active: { label: '활성', variant: 'success' },
  inactive: { label: '비활성', variant: 'default' },
  suspended: { label: '정지', variant: 'error' },
  pending_approval: { label: '승인대기', variant: 'warning' },
}

export function MemberManagementPage() {
  const { members, setMembers, updateMemberTier, updateMemberStatus } = useAdminStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState<UserTier | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all')
  const [selectedMember, setSelectedMember] = useState<MemberListItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 회원 목록 로드 함수
  const loadMembers = useCallback(() => {
    setIsLoading(true)
    try {
      // 실제 가입한 회원 목록 가져오기
      const registeredMembers = getAllMembers()
      const convertedMembers: MemberListItem[] = registeredMembers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        status: user.isActive ? 'active' : 'inactive',
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date(user.createdAt),
        lastOrderAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
        company: user.company,
        businessNumber: user.businessNumber,
        provider: user.provider,
      }))

      // 데모 데이터와 실제 회원 합치기 (중복 제거)
      const existingIds = new Set(convertedMembers.map(m => m.email))
      const filteredMockMembers = mockMembers.filter(m => !existingIds.has(m.email))

      setMembers([...convertedMembers, ...filteredMockMembers])
    } finally {
      setIsLoading(false)
    }
  }, [setMembers])

  // 초기 데이터 로드
  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  // 필터링
  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesTier = tierFilter === 'all' || member.tier === tierFilter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter

    return matchesSearch && matchesTier && matchesStatus
  })

  // 등급 변경 (DB + Store 동시 업데이트)
  const handleTierChange = async (memberId: string, newTier: UserTier) => {
    // Store 즉시 업데이트 (UI 반영)
    updateMemberTier(memberId, newTier)

    // DB 업데이트 (실제 가입 회원인 경우)
    await updateMemberTierDB(memberId, newTier)
  }

  // 상태 변경 (DB + Store 동시 업데이트)
  const handleStatusChange = async (memberId: string, newStatus: MemberStatus) => {
    // Store 즉시 업데이트 (UI 반영)
    updateMemberStatus(memberId, newStatus)

    // DB 업데이트 (active/inactive만 지원)
    const isActive = newStatus === 'active'
    await updateMemberActive(memberId, isActive)
  }

  return (
    <div className="space-y-4">
      {/* Header - 한 줄 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-neutral-900">회원 관리</h1>
          <span className="text-sm text-neutral-500">{filteredMembers.length}명</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadMembers}
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
          새로고침
        </Button>
      </div>

      {/* Filters - 한 줄 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2 py-2 text-sm border border-neutral-200 rounded-lg"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as UserTier | 'all')}
          className="px-2 py-2 text-sm border border-neutral-200 rounded-lg"
        >
          <option value="all">등급</option>
          {Object.entries(tierConfig).map(([tier, config]) => (
            <option key={tier} value={tier}>{config.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MemberStatus | 'all')}
          className="px-2 py-2 text-sm border border-neutral-200 rounded-lg"
        >
          <option value="all">상태</option>
          {Object.entries(statusConfig).map(([status, config]) => (
            <option key={status} value={status}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {filteredMembers.map((member) => {
          const tier = tierConfig[member.tier]
          const status = statusConfig[member.status]

          return (
            <Card key={member.id}>
              <CardContent className="p-3 overflow-hidden">
                {/* 첫째 줄: 이름 + 가입경로 + 등급 + 상태 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900">{member.name}</span>
                    {member.provider && (
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-xs',
                        member.provider === 'kakao' && 'bg-yellow-100 text-yellow-700',
                        member.provider === 'naver' && 'bg-green-100 text-green-700',
                        member.provider === 'google' && 'bg-blue-100 text-blue-700',
                        member.provider === 'email' && 'bg-neutral-100 text-neutral-600'
                      )}>
                        {member.provider === 'email' ? '이메일' : member.provider.charAt(0).toUpperCase() + member.provider.slice(1)}
                      </span>
                    )}
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', tier.color)}>
                      {tier.label}
                    </span>
                  </div>
                  <Badge variant={status.variant} size="sm">{status.label}</Badge>
                </div>
                {/* 둘째 줄: 이메일 + 금액 + 상세버튼 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-neutral-500 min-w-0">
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-neutral-900">{formatPrice(member.totalSpent)}</span>
                    <Button variant="outline" size="sm" onClick={() => setSelectedMember(member)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-neutral-500">검색 결과가 없습니다.</div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold">회원 상세</span>
                <span className="text-sm text-neutral-500">{selectedMember.name}</span>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-neutral-400 hover:text-neutral-600 text-2xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              {/* 기본 정보 */}
              <div>
                <span className="text-sm font-medium text-neutral-900 block mb-2">기본 정보</span>
                <div className="bg-neutral-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-neutral-500">이름</span><span>{selectedMember.name}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">이메일</span><span>{selectedMember.email}</span></div>
                  {selectedMember.provider && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">가입경로</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        selectedMember.provider === 'kakao' && 'bg-yellow-100 text-yellow-800',
                        selectedMember.provider === 'naver' && 'bg-green-100 text-green-800',
                        selectedMember.provider === 'google' && 'bg-blue-100 text-blue-800',
                        selectedMember.provider === 'email' && 'bg-neutral-100 text-neutral-700'
                      )}>
                        {getProviderName(selectedMember.provider)}
                      </span>
                    </div>
                  )}
                  {selectedMember.company && <div className="flex justify-between"><span className="text-neutral-500">회사</span><span>{selectedMember.company}</span></div>}
                  {selectedMember.businessNumber && <div className="flex justify-between"><span className="text-neutral-500">사업자번호</span><span>{selectedMember.businessNumber}</span></div>}
                </div>
              </div>
              {/* 회원 등급 */}
              <div>
                <span className="text-sm font-medium text-neutral-900 block mb-2">회원 등급</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(tierConfig).map(([tier, config]) => (
                    <button
                      key={tier}
                      onClick={() => {
                        handleTierChange(selectedMember.id, tier as UserTier)
                        setSelectedMember({ ...selectedMember, tier: tier as UserTier })
                      }}
                      className={cn(
                        'py-1.5 px-3 rounded-lg text-sm font-medium',
                        selectedMember.tier === tier ? 'ring-2 ring-primary-500 ' + config.color : 'bg-neutral-100 text-neutral-500'
                      )}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* 회원 상태 */}
              <div>
                <span className="text-sm font-medium text-neutral-900 block mb-2">회원 상태</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleStatusChange(selectedMember.id, status as MemberStatus)
                        setSelectedMember({ ...selectedMember, status: status as MemberStatus })
                      }}
                      className={cn(
                        'py-1.5 px-3 rounded-lg text-sm font-medium',
                        selectedMember.status === status ? 'ring-2 ring-primary-500 bg-primary-50 text-primary-700' : 'bg-neutral-100 text-neutral-500'
                      )}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* 활동 정보 */}
              <div>
                <span className="text-sm font-medium text-neutral-900 block mb-2">활동 정보</span>
                <div className="bg-neutral-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-neutral-500">총 주문</span><span className="font-medium">{selectedMember.totalOrders}건</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">누적금액</span><span className="font-medium text-primary-600">{formatPrice(selectedMember.totalSpent)}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">가입일</span><span>{new Date(selectedMember.createdAt).toLocaleDateString('ko-KR')}</span></div>
                  {selectedMember.lastOrderAt && <div className="flex justify-between"><span className="text-neutral-500">최근주문</span><span>{new Date(selectedMember.lastOrderAt).toLocaleDateString('ko-KR')}</span></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
