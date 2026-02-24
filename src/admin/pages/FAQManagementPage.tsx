import { useState } from 'react'
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button, Card, CardContent, Input, Badge } from '../../components/ui'
import { useAllFAQs, useCreateFAQ, useUpdateFAQ, useDeleteFAQ } from '../../hooks/queries/useCommunity'
import { cn } from '../../lib/utils'

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
  sortOrder: number
  isActive: boolean
}

interface FAQFormData {
  category: string
  question: string
  answer: string
  sortOrder: number
  isActive: boolean
}

const categories = ['회원', '주문/결제', '배송', '교환/반품', '기타']

const initialFormData: FAQFormData = {
  category: '회원',
  question: '',
  answer: '',
  sortOrder: 0,
  isActive: true,
}

export function FAQManagementPage() {
  const { data: faqs = [], isLoading } = useAllFAQs()
  const createFAQ = useCreateFAQ()
  const updateFAQ = useUpdateFAQ()
  const deleteFAQ = useDeleteFAQ()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null)
  const [formData, setFormData] = useState<FAQFormData>(initialFormData)
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')

  const categoryFilters = ['전체', ...categories]

  const filteredFAQs = selectedCategory === '전체'
    ? faqs
    : faqs.filter(f => f.category === selectedCategory)

  const sortedFAQs = [...filteredFAQs].sort((a, b) => a.sortOrder - b.sortOrder)

  const openCreateModal = () => {
    setEditingFAQ(null)
    // 새 FAQ의 sortOrder를 마지막으로 설정
    const maxSortOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.sortOrder)) : -1
    setFormData({ ...initialFormData, sortOrder: maxSortOrder + 1 })
    setIsModalOpen(true)
  }

  const openEditModal = (faq: FAQItem) => {
    setEditingFAQ(faq)
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('질문과 답변을 입력해주세요.')
      return
    }

    try {
      if (editingFAQ) {
        await updateFAQ.mutateAsync({
          id: editingFAQ.id,
          ...formData,
        })
        alert('FAQ가 수정되었습니다.')
      } else {
        await createFAQ.mutateAsync(formData)
        alert('FAQ가 등록되었습니다.')
      }
      setIsModalOpen(false)
      setFormData(initialFormData)
    } catch (err) {
      alert('저장에 실패했습니다.')
    }
  }

  const handleDelete = async (faq: FAQItem) => {
    if (!confirm(`"${faq.question}" FAQ를 삭제하시겠습니까?`)) return

    try {
      await deleteFAQ.mutateAsync(faq.id)
      alert('삭제되었습니다.')
    } catch (err) {
      alert('삭제에 실패했습니다.')
    }
  }

  const toggleActive = async (faq: FAQItem) => {
    try {
      await updateFAQ.mutateAsync({
        id: faq.id,
        isActive: !faq.isActive,
      })
    } catch (err) {
      alert('상태 변경에 실패했습니다.')
    }
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-neutral-900">FAQ 관리</h1>
          <p className="text-sm text-neutral-500 mt-1">자주 묻는 질문을 등록하고 관리합니다</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          FAQ 등록
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categoryFilters.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              selectedCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-500">FAQ를 불러오는 중...</p>
        </div>
      )}

      {/* FAQ List */}
      {!isLoading && (
        <Card>
          <CardContent className="p-0">
            {/* Table Header - PC only */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-medium text-neutral-500 uppercase">
              <div className="col-span-1">순서</div>
              <div className="col-span-1">상태</div>
              <div className="col-span-2">카테고리</div>
              <div className="col-span-6">질문</div>
              <div className="col-span-2 text-center">관리</div>
            </div>

            {/* FAQ Items */}
            <div className="divide-y divide-neutral-100">
              {sortedFAQs.map((faq) => (
                <div key={faq.id}>
                  {/* PC View */}
                  <div className={cn(
                    'hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center',
                    !faq.isActive && 'bg-neutral-50 opacity-60'
                  )}>
                    <div className="col-span-1 flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-500">{faq.sortOrder}</span>
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => toggleActive(faq)}
                        className={cn(
                          'p-1.5 rounded transition-colors',
                          faq.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-neutral-400 hover:bg-neutral-100'
                        )}
                        title={faq.isActive ? '활성화됨 (클릭하여 비활성화)' : '비활성화됨 (클릭하여 활성화)'}
                      >
                        {faq.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="secondary" size="sm">
                        {faq.category}
                      </Badge>
                    </div>
                    <div className="col-span-6">
                      <p className="text-sm text-neutral-700 truncate">{faq.question}</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(faq)}
                        className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq)}
                        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className={cn(
                    'md:hidden p-4',
                    !faq.isActive && 'bg-neutral-50 opacity-60'
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" size="sm">
                            {faq.category}
                          </Badge>
                          <span className="text-xs text-neutral-500">#{faq.sortOrder}</span>
                          {!faq.isActive && (
                            <span className="text-xs text-neutral-400">(비활성)</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-neutral-900 mb-1">
                          {faq.question}
                        </p>
                        <p className="text-xs text-neutral-500 line-clamp-2">
                          {faq.answer}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActive(faq)}
                          className={cn(
                            'p-2',
                            faq.isActive ? 'text-green-600' : 'text-neutral-400'
                          )}
                        >
                          {faq.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(faq)}
                          className="p-2 text-neutral-500 hover:text-primary-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(faq)}
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
            {sortedFAQs.length === 0 && (
              <div className="py-12 text-center">
                <HelpCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">등록된 FAQ가 없습니다.</p>
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
                {editingFAQ ? 'FAQ 수정' : 'FAQ 등록'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  카테고리
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        formData.category === cat
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <Input
                type="number"
                label="정렬 순서"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />

              {/* Active Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">활성화 (사용자에게 표시)</span>
              </label>

              {/* Question */}
              <Input
                label="질문"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="자주 묻는 질문을 입력하세요"
                required
              />

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  답변
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="답변 내용을 입력하세요"
                  rows={6}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  required
                />
              </div>

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
                  disabled={createFAQ.isPending || updateFAQ.isPending}
                >
                  {(createFAQ.isPending || updateFAQ.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingFAQ ? '수정' : '등록'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
