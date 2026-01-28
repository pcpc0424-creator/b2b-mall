import { useState } from 'react'
import { Search, Eye, RefreshCw } from 'lucide-react'
import { useMembers, useUpdateMemberTier, useUpdateMemberStatus } from '../../hooks/queries'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import { formatPrice, cn } from '../../lib/utils'
import { MemberListItem, MemberStatus } from '../types/admin'
import { UserTier, SocialProvider } from '../../types'
import { getProviderName } from '../../services/auth'

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
  withdrawn: { label: '탈퇴', variant: 'error' },
}

export function MemberManagementPage() {
  const { data: members = [], isLoading, error, refetch } = useMembers()
  const updateTierMutation = useUpdateMemberTier()
  const updateStatusMutation = useUpdateMemberStatus()
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState<UserTier | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all')
  const [selectedMember, setSelectedMember] = useState<MemberListItem | null>(null)

  // 필터링
  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesTier = tierFilter === 'all' || member.tier === tierFilter
    const matchesStatus = statusFilter === 'all'
      ? member.status !== 'withdrawn'
      : member.status === statusFilter

    return matchesSearch && matchesTier && matchesStatus
  })

  // 등급 변경
  const handleTierChange = (memberId: string, newTier: UserTier) => {
    updateTierMutation.mutate({ memberId, tier: newTier })
  }

  // 상태 변경
  const handleStatusChange = (memberId: string, newStatus: MemberStatus) => {
    updateStatusMutation.mutate({ memberId, status: newStatus })
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
          onClick={() => refetch()}
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

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          회원 목록을 불러오는 중 오류가 발생했습니다: {(error as Error).message}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="h-12 bg-neutral-100 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Members List */}
      {!isLoading && <div className="space-y-2">
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
      </div>}

      {!isLoading && filteredMembers.length === 0 && (
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
