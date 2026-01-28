import { useState } from 'react'
import { Search, Edit, Trash2, Plus, X } from 'lucide-react'
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion, useTogglePromotionActive } from '../../hooks/queries'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import { AdminPromotion } from '../types/admin'
import { UserTier } from '../../types'

const typeLabels = {
  all: '전체',
  timesale: '타임특가',
  exclusive: '전용',
}

const tierLabels: Record<UserTier, string> = {
  guest: '비회원',
  member: '일반회원',
  premium: '우수회원',
  vip: 'VIP회원',
}

export function PromotionManagementPage() {
  const { data: promotions = [], isLoading } = usePromotions()
  const createMutation = useCreatePromotion()
  const updateMutation = useUpdatePromotion()
  const deleteMutation = useDeletePromotion()
  const toggleMutation = useTogglePromotionActive()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [editingPromo, setEditingPromo] = useState<AdminPromotion | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promo.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || promo.type === typeFilter
    const matchesActive = activeFilter === 'all' ||
                         (activeFilter === 'active' && promo.isActive) ||
                         (activeFilter === 'inactive' && !promo.isActive)
    return matchesSearch && matchesType && matchesActive
  })

  const handleDelete = (promoId: string) => {
    if (confirm('프로모션을 삭제하시겠습니까?')) {
      deleteMutation.mutate(promoId)
    }
  }

  const handleEdit = (promo: AdminPromotion) => {
    setEditingPromo({ ...promo })
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    const newPromo: AdminPromotion = {
      id: `promo-${Date.now()}`,
      title: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=400&fit=crop',
      discount: 10,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      targetTiers: ['guest', 'member', 'premium', 'vip'],
      type: 'all',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setEditingPromo(newPromo)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!editingPromo) return

    if (!editingPromo.title.trim()) {
      alert('프로모션 제목을 입력해주세요.')
      return
    }

    const existingPromo = promotions.find(p => p.id === editingPromo.id)
    if (existingPromo) {
      updateMutation.mutate({ id: editingPromo.id, updates: editingPromo })
    } else {
      createMutation.mutate(editingPromo)
    }
    setIsModalOpen(false)
    setEditingPromo(null)
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-neutral-900">프로모션 관리</h1>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-3"><div className="h-16 bg-neutral-100 animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-neutral-900">프로모션 관리</h1>
          <span className="text-sm text-neutral-500">{filteredPromotions.length}개</span>
        </div>
        <Button size="sm" onClick={handleAddNew}><Plus className="w-4 h-4 mr-1" />등록</Button>
      </div>

      {/* Filters */}
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2 py-2 text-sm border border-neutral-200 rounded-lg"
        >
          <option value="all">유형</option>
          <option value="all">전체</option>
          <option value="timesale">타임특가</option>
          <option value="exclusive">전용</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-2 py-2 text-sm border border-neutral-200 rounded-lg"
        >
          <option value="all">상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
      </div>

      {/* Promotions List */}
      {isLoading && (
        <div className="text-center py-12 text-neutral-500">로딩 중...</div>
      )}
      <div className="space-y-2">
        {filteredPromotions.map((promo) => (
          <Card key={promo.id}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900 truncate">{promo.title}</span>
                    <Badge variant={promo.type === 'timesale' ? 'warning' : promo.type === 'exclusive' ? 'primary' : 'secondary'} size="sm">
                      {typeLabels[promo.type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                    <span>{promo.discount}% 할인</span>
                    <span>·</span>
                    <span>{formatDate(promo.startDate)} ~ {formatDate(promo.endDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleMutation.mutate({ id: promo.id, currentActive: promo.isActive })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      promo.isActive ? 'bg-primary-600' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                        promo.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <Button variant="ghost" size="sm" className="p-1.5" onClick={() => handleEdit(promo)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 text-error" onClick={() => handleDelete(promo.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="text-center py-12 text-neutral-500">프로모션이 없습니다.</div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingPromo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">
                {promotions.find(p => p.id === editingPromo.id) ? '프로모션 수정' : '프로모션 등록'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">제목</label>
                <input
                  type="text"
                  value={editingPromo.title}
                  onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  placeholder="프로모션 제목"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">설명</label>
                <textarea
                  value={editingPromo.description}
                  onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg resize-none"
                  rows={2}
                  placeholder="프로모션 설명"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">이미지 URL</label>
                <input
                  type="text"
                  value={editingPromo.image}
                  onChange={(e) => setEditingPromo({ ...editingPromo, image: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">할인율 (%)</label>
                  <input
                    type="number"
                    value={editingPromo.discount}
                    onChange={(e) => setEditingPromo({ ...editingPromo, discount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">유형</label>
                  <select
                    value={editingPromo.type}
                    onChange={(e) => setEditingPromo({ ...editingPromo, type: e.target.value as 'all' | 'timesale' | 'exclusive' })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  >
                    <option value="all">전체</option>
                    <option value="timesale">타임특가</option>
                    <option value="exclusive">전용</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">시작일</label>
                  <input
                    type="date"
                    value={new Date(editingPromo.startDate).toISOString().split('T')[0]}
                    onChange={(e) => setEditingPromo({ ...editingPromo, startDate: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">종료일</label>
                  <input
                    type="date"
                    value={new Date(editingPromo.endDate).toISOString().split('T')[0]}
                    onChange={(e) => setEditingPromo({ ...editingPromo, endDate: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">대상 등급</label>
                <div className="flex flex-wrap gap-2">
                  {(['guest', 'member', 'premium', 'vip'] as UserTier[]).map((tier) => (
                    <label key={tier} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPromo.targetTiers.includes(tier)}
                        onChange={(e) => {
                          const newTiers = e.target.checked
                            ? [...editingPromo.targetTiers, tier]
                            : editingPromo.targetTiers.filter(t => t !== tier)
                          setEditingPromo({ ...editingPromo, targetTiers: newTiers })
                        }}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm">{tierLabels[tier]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingPromo.isActive}
                  onChange={(e) => setEditingPromo({ ...editingPromo, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">활성화</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>취소</Button>
              <Button onClick={handleSave}>저장</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
