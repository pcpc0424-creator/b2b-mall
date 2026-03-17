import { useState } from 'react'
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Eye,
  EyeOff,
  Percent,
  DollarSign,
  Calendar,
  Send,
  Users,
  Search,
  Check,
  List,
  XCircle,
} from 'lucide-react'
import { Button, Card, CardContent, Input, Badge } from '../../components/ui'
import {
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useIssueCouponToUsers,
  useIssueCouponToAllUsers,
  useIssuedCouponsByCouponId,
  useRevokeUserCoupon,
  useMembers,
} from '../../hooks/queries'
import { cn, formatPrice } from '../../lib/utils'
import type { AdminCoupon, CreateCouponInput } from '../../services/coupons'

interface CouponFormData {
  code: string
  name: string
  description: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order_amount: number | null
  max_discount_amount: number | null
  valid_from: string
  valid_until: string
  is_active: boolean
}

const initialFormData: CouponFormData = {
  code: '',
  name: '',
  description: '',
  discount_type: 'percent',
  discount_value: 10,
  min_order_amount: null,
  max_discount_amount: null,
  valid_from: new Date().toISOString().split('T')[0],
  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  is_active: true,
}

export function CouponManagementPage() {
  const { data: coupons = [], isLoading } = useAdminCoupons()
  const { data: members = [] } = useMembers()
  const createCoupon = useCreateCoupon()
  const updateCoupon = useUpdateCoupon()
  const deleteCoupon = useDeleteCoupon()
  const issueCouponToUsers = useIssueCouponToUsers()
  const issueCouponToAllUsers = useIssueCouponToAllUsers()
  const revokeUserCoupon = useRevokeUserCoupon()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null)
  const [formData, setFormData] = useState<CouponFormData>(initialFormData)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // 쿠폰 발급 모달 상태
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [issuingCoupon, setIssuingCoupon] = useState<AdminCoupon | null>(null)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [memberSearchTerm, setMemberSearchTerm] = useState('')

  // 발급 현황 모달 상태
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusViewingCoupon, setStatusViewingCoupon] = useState<AdminCoupon | null>(null)
  const [statusSearchTerm, setStatusSearchTerm] = useState('')

  // 발급 현황 데이터 조회
  const { data: issuedCoupons = [], isLoading: isLoadingIssued } = useIssuedCouponsByCouponId(
    statusViewingCoupon?.id || null
  )

  const filteredCoupons = coupons.filter(coupon => {
    if (filterStatus === 'active') return coupon.is_active
    if (filterStatus === 'inactive') return !coupon.is_active
    return true
  })

  const filteredMembers = members.filter(member => {
    const searchLower = memberSearchTerm.toLowerCase()
    return (
      member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      (member.phone && member.phone.includes(memberSearchTerm))
    )
  })

  const openCreateModal = () => {
    setEditingCoupon(null)
    setFormData(initialFormData)
    setIsModalOpen(true)
  }

  const openEditModal = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount,
      valid_from: coupon.valid_from.split('T')[0],
      valid_until: coupon.valid_until.split('T')[0],
      is_active: coupon.is_active,
    })
    setIsModalOpen(true)
  }

  const openIssueModal = (coupon: AdminCoupon) => {
    setIssuingCoupon(coupon)
    setSelectedMemberIds([])
    setMemberSearchTerm('')
    setIsIssueModalOpen(true)
  }

  const openStatusModal = (coupon: AdminCoupon) => {
    setStatusViewingCoupon(coupon)
    setStatusSearchTerm('')
    setIsStatusModalOpen(true)
  }

  const filteredIssuedCoupons = issuedCoupons.filter(item => {
    const searchLower = statusSearchTerm.toLowerCase()
    return (
      item.user_name.toLowerCase().includes(searchLower) ||
      item.user_email.toLowerCase().includes(searchLower)
    )
  })

  const handleRevokeCoupon = async (userCouponId: string, userName: string) => {
    if (!confirm(`"${userName}"님의 쿠폰을 회수하시겠습니까?`)) return

    try {
      await revokeUserCoupon.mutateAsync(userCouponId)
      alert('쿠폰이 회수되었습니다.')
    } catch (err) {
      alert('쿠폰 회수에 실패했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('쿠폰 코드와 이름을 입력해주세요.')
      return
    }

    const input: CreateCouponInput = {
      code: formData.code,
      name: formData.name,
      description: formData.description || undefined,
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      min_order_amount: formData.min_order_amount || undefined,
      max_discount_amount: formData.max_discount_amount || undefined,
      valid_from: formData.valid_from,
      valid_until: formData.valid_until,
      is_active: formData.is_active,
    }

    try {
      if (editingCoupon) {
        await updateCoupon.mutateAsync({ id: editingCoupon.id, input })
        alert('쿠폰이 수정되었습니다.')
      } else {
        await createCoupon.mutateAsync(input)
        alert('쿠폰이 생성되었습니다.')
      }
      setIsModalOpen(false)
      setFormData(initialFormData)
    } catch (err: any) {
      alert(err.message || '저장에 실패했습니다.')
    }
  }

  const handleDelete = async (coupon: AdminCoupon) => {
    if (!confirm(`"${coupon.name}" 쿠폰을 삭제하시겠습니까?\n이 쿠폰을 보유한 사용자의 쿠폰도 함께 삭제됩니다.`)) return

    try {
      await deleteCoupon.mutateAsync(coupon.id)
      alert('삭제되었습니다.')
    } catch (err) {
      alert('삭제에 실패했습니다.')
    }
  }

  const toggleActive = async (coupon: AdminCoupon) => {
    try {
      await updateCoupon.mutateAsync({
        id: coupon.id,
        input: { is_active: !coupon.is_active },
      })
    } catch (err) {
      alert('상태 변경에 실패했습니다.')
    }
  }

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const selectAllMembers = () => {
    setSelectedMemberIds(members.map(m => m.id))
  }

  const deselectAllMembers = () => {
    setSelectedMemberIds([])
  }

  const handleIssueToSelected = async () => {
    if (!issuingCoupon || selectedMemberIds.length === 0) {
      alert('발급할 회원을 선택해주세요.')
      return
    }

    try {
      const result = await issueCouponToUsers.mutateAsync({
        couponId: issuingCoupon.id,
        userIds: selectedMemberIds,
      })
      alert(`쿠폰 발급 완료!\n성공: ${result.success}명\n이미 보유: ${result.skipped}명`)
      setIsIssueModalOpen(false)
    } catch (err) {
      alert('쿠폰 발급에 실패했습니다.')
    }
  }

  const handleIssueToAll = async () => {
    if (!issuingCoupon) return

    if (!confirm(`"${issuingCoupon.name}" 쿠폰을 전체 회원(${members.length}명)에게 발급하시겠습니까?`)) return

    try {
      const result = await issueCouponToAllUsers.mutateAsync(issuingCoupon.id)
      alert(`쿠폰 발급 완료!\n성공: ${result.success}명\n이미 보유: ${result.skipped}명`)
      setIsIssueModalOpen(false)
    } catch (err) {
      alert('쿠폰 발급에 실패했습니다.')
    }
  }

  const formatDiscount = (coupon: AdminCoupon) => {
    if (coupon.discount_type === 'percent') {
      return `${coupon.discount_value}%`
    }
    return formatPrice(coupon.discount_value)
  }

  const isExpired = (coupon: AdminCoupon) => {
    return new Date(coupon.valid_until) < new Date()
  }

  const isNotStarted = (coupon: AdminCoupon) => {
    return new Date(coupon.valid_from) > new Date()
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-neutral-900">쿠폰 관리</h1>
          <p className="text-sm text-neutral-500 mt-1">할인 쿠폰을 생성하고 관리합니다</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          쿠폰 생성
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: '전체' },
          { key: 'active', label: '활성' },
          { key: 'inactive', label: '비활성' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilterStatus(item.key as typeof filterStatus)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              filterStatus === item.key
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-500">쿠폰을 불러오는 중...</p>
        </div>
      )}

      {/* Coupon List */}
      {!isLoading && (
        <Card>
          <CardContent className="p-0">
            {/* Table Header - PC only */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-medium text-neutral-500 uppercase">
              <div className="col-span-1">상태</div>
              <div className="col-span-2">쿠폰 코드</div>
              <div className="col-span-3">이름</div>
              <div className="col-span-2">할인</div>
              <div className="col-span-2">유효 기간</div>
              <div className="col-span-2 text-center">관리</div>
            </div>

            {/* Coupon Items */}
            <div className="divide-y divide-neutral-100">
              {filteredCoupons.map((coupon) => (
                <div key={coupon.id}>
                  {/* PC View */}
                  <div className={cn(
                    'hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center',
                    (!coupon.is_active || isExpired(coupon)) && 'bg-neutral-50 opacity-60'
                  )}>
                    <div className="col-span-1">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={cn(
                          'p-1.5 rounded transition-colors',
                          coupon.is_active
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-neutral-400 hover:bg-neutral-100'
                        )}
                        title={coupon.is_active ? '활성화됨 (클릭하여 비활성화)' : '비활성화됨 (클릭하여 활성화)'}
                      >
                        {coupon.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="col-span-2">
                      <code className="px-2 py-1 bg-neutral-100 rounded text-sm font-mono">
                        {coupon.code}
                      </code>
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-neutral-900 truncate">{coupon.name}</p>
                      {coupon.description && (
                        <p className="text-xs text-neutral-500 truncate">{coupon.description}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        {coupon.discount_type === 'percent' ? (
                          <Percent className="w-3 h-3 text-primary-500" />
                        ) : (
                          <DollarSign className="w-3 h-3 text-primary-500" />
                        )}
                        <span className="text-sm font-medium text-primary-600">
                          {formatDiscount(coupon)}
                        </span>
                      </div>
                      {coupon.min_order_amount && (
                        <p className="text-xs text-neutral-500">
                          {formatPrice(coupon.min_order_amount)} 이상
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-neutral-600">
                        <p>{coupon.valid_from.split('T')[0]}</p>
                        <p>~ {coupon.valid_until.split('T')[0]}</p>
                      </div>
                      {isExpired(coupon) && (
                        <Badge variant="error" size="sm">만료</Badge>
                      )}
                      {isNotStarted(coupon) && (
                        <Badge variant="warning" size="sm">대기</Badge>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <button
                        onClick={() => openStatusModal(coupon)}
                        className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="발급 현황"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openIssueModal(coupon)}
                        className="p-1.5 text-neutral-500 hover:text-green-600 hover:bg-green-50 rounded"
                        title="회원에게 발급"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                        title="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon)}
                        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className={cn(
                    'md:hidden p-4',
                    (!coupon.is_active || isExpired(coupon)) && 'bg-neutral-50 opacity-60'
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="px-2 py-0.5 bg-neutral-100 rounded text-xs font-mono">
                            {coupon.code}
                          </code>
                          {!coupon.is_active && (
                            <span className="text-xs text-neutral-400">(비활성)</span>
                          )}
                          {isExpired(coupon) && (
                            <Badge variant="error" size="sm">만료</Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-neutral-900 mb-1">
                          {coupon.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-primary-600">
                            {formatDiscount(coupon)} 할인
                          </span>
                          {coupon.min_order_amount && (
                            <span className="text-neutral-500">
                              ({formatPrice(coupon.min_order_amount)} 이상)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          {coupon.valid_from.split('T')[0]} ~ {coupon.valid_until.split('T')[0]}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openStatusModal(coupon)}
                          className="p-2 text-neutral-500 hover:text-blue-600"
                          title="발급 현황"
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openIssueModal(coupon)}
                          className="p-2 text-neutral-500 hover:text-green-600"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(coupon)}
                          className={cn(
                            'p-2',
                            coupon.is_active ? 'text-green-600' : 'text-neutral-400'
                          )}
                        >
                          {coupon.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-2 text-neutral-500 hover:text-primary-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="p-2 text-neutral-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredCoupons.length === 0 && (
              <div className="py-12 text-center">
                <Ticket className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">등록된 쿠폰이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">
                {editingCoupon ? '쿠폰 수정' : '쿠폰 생성'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Code & Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="쿠폰 코드"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="WELCOME10"
                  required
                />
                <Input
                  label="쿠폰 이름"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="신규회원 10% 할인"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  설명 (선택)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="쿠폰에 대한 설명을 입력하세요"
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  할인 유형
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="discount_type"
                      checked={formData.discount_type === 'percent'}
                      onChange={() => setFormData({ ...formData, discount_type: 'percent' })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm">퍼센트 할인 (%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="discount_type"
                      checked={formData.discount_type === 'fixed'}
                      onChange={() => setFormData({ ...formData, discount_type: 'fixed' })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm">정액 할인 (원)</span>
                  </label>
                </div>
              </div>

              {/* Discount Value */}
              <Input
                type="number"
                label={formData.discount_type === 'percent' ? '할인율 (%)' : '할인 금액 (원)'}
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                placeholder={formData.discount_type === 'percent' ? '10' : '5000'}
                min={1}
                required
              />

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="최소 주문 금액 (선택)"
                  value={formData.min_order_amount || ''}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value ? Number(e.target.value) : null })}
                  placeholder="50000"
                />
                {formData.discount_type === 'percent' && (
                  <Input
                    type="number"
                    label="최대 할인 금액 (선택)"
                    value={formData.max_discount_amount || ''}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value ? Number(e.target.value) : null })}
                    placeholder="10000"
                  />
                )}
              </div>

              {/* Valid Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="시작일"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  required
                />
                <Input
                  type="date"
                  label="종료일"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  required
                />
              </div>

              {/* Active Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">활성화 (사용자가 코드로 등록 가능)</span>
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={createCoupon.isPending || updateCoupon.isPending}
                >
                  {(createCoupon.isPending || updateCoupon.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingCoupon ? '수정' : '생성'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Coupon Modal */}
      {isIssueModalOpen && issuingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold">쿠폰 발급</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs">{issuingCoupon.code}</code>
                  {' '}{issuingCoupon.name}
                </p>
              </div>
              <button onClick={() => setIsIssueModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b bg-neutral-50">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleIssueToAll}
                  disabled={issueCouponToAllUsers.isPending}
                  className="flex items-center gap-2"
                >
                  {issueCouponToAllUsers.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                  전체 회원에게 발급 ({members.length}명)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllMembers}
                >
                  전체 선택
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAllMembers}
                >
                  선택 해제
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                  placeholder="이름, 이메일, 전화번호로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <label
                    key={member.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      selectedMemberIds.includes(member.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center',
                      selectedMemberIds.includes(member.id)
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-neutral-300'
                    )}>
                      {selectedMemberIds.includes(member.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.includes(member.id)}
                      onChange={() => toggleMemberSelection(member.id)}
                      className="sr-only"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900">{member.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{member.email}</p>
                    </div>
                    {member.phone && (
                      <span className="text-xs text-neutral-400">{member.phone}</span>
                    )}
                  </label>
                ))}

                {filteredMembers.length === 0 && (
                  <div className="py-8 text-center text-neutral-500">
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-neutral-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">
                  {selectedMemberIds.length}명 선택됨
                </span>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsIssueModalOpen(false)}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleIssueToSelected}
                    disabled={selectedMemberIds.length === 0 || issueCouponToUsers.isPending}
                  >
                    {issueCouponToUsers.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      `${selectedMemberIds.length}명에게 발급`
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issued Coupons Status Modal */}
      {isStatusModalOpen && statusViewingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold">발급 현황</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs">{statusViewingCoupon.code}</code>
                  {' '}{statusViewingCoupon.name}
                </p>
              </div>
              <button onClick={() => setIsStatusModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Summary */}
            <div className="p-4 border-b bg-neutral-50">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-neutral-500">총 발급:</span>
                  <span className="ml-2 font-medium">{issuedCoupons.length}명</span>
                </div>
                <div>
                  <span className="text-neutral-500">사용완료:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {issuedCoupons.filter(c => c.is_used).length}명
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">미사용:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {issuedCoupons.filter(c => !c.is_used).length}명
                  </span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={statusSearchTerm}
                  onChange={(e) => setStatusSearchTerm(e.target.value)}
                  placeholder="이름, 이메일로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Issued List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingIssued ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">불러오는 중...</p>
                </div>
              ) : filteredIssuedCoupons.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  {issuedCoupons.length === 0 ? '발급된 쿠폰이 없습니다.' : '검색 결과가 없습니다.'}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">회원</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">발급일</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">상태</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredIssuedCoupons.map((item) => (
                      <tr key={item.id} className={cn(item.is_used && 'bg-neutral-50')}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-neutral-900">{item.user_name}</p>
                          <p className="text-xs text-neutral-500">{item.user_email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-neutral-600">
                            {new Date(item.issued_at).toLocaleDateString('ko-KR')}
                          </p>
                          {item.is_used && item.used_at && (
                            <p className="text-xs text-neutral-400">
                              사용: {new Date(item.used_at).toLocaleDateString('ko-KR')}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.is_used ? (
                            <Badge variant="default" size="sm">사용완료</Badge>
                          ) : (
                            <Badge variant="success" size="sm">미사용</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {!item.is_used && (
                            <button
                              onClick={() => handleRevokeCoupon(item.id, item.user_name)}
                              disabled={revokeUserCoupon.isPending}
                              className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="쿠폰 회수"
                            >
                              {revokeUserCoupon.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-neutral-50">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsStatusModalOpen(false)}
                >
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
