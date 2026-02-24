import { useState } from 'react'
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Gift,
  RefreshCw,
  Eye,
  Loader2,
} from 'lucide-react'
import { Button, Card, CardContent, Input, Badge } from '../../components/ui'
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotice } from '../../hooks/queries/useCommunity'
import { Notice } from '../../types'
import { cn } from '../../lib/utils'

type NoticeCategory = 'notice' | 'event' | 'update' | 'important'

const categoryConfig: Record<NoticeCategory, { label: string; icon: typeof Bell; variant: 'secondary' | 'success' | 'primary' | 'error' }> = {
  notice: { label: '공지', icon: Bell, variant: 'secondary' },
  event: { label: '이벤트', icon: Gift, variant: 'success' },
  update: { label: '업데이트', icon: RefreshCw, variant: 'primary' },
  important: { label: '중요', icon: AlertCircle, variant: 'error' },
}

interface NoticeFormData {
  title: string
  content: string
  category: NoticeCategory
  isImportant: boolean
}

const initialFormData: NoticeFormData = {
  title: '',
  content: '',
  category: 'notice',
  isImportant: false,
}

export function NoticeManagementPage() {
  const { data: notices = [], isLoading } = useNotices()
  const createNotice = useCreateNotice()
  const updateNotice = useUpdateNotice()
  const deleteNotice = useDeleteNotice()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [formData, setFormData] = useState<NoticeFormData>(initialFormData)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'important', label: '중요' },
    { id: 'notice', label: '공지' },
    { id: 'event', label: '이벤트' },
    { id: 'update', label: '업데이트' },
  ]

  const filteredNotices = selectedCategory === 'all'
    ? notices
    : notices.filter(n => n.category === selectedCategory)

  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.isImportant && !b.isImportant) return -1
    if (!a.isImportant && b.isImportant) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const openCreateModal = () => {
    setEditingNotice(null)
    setFormData(initialFormData)
    setIsModalOpen(true)
  }

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice)
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category as NoticeCategory,
      isImportant: notice.isImportant,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    try {
      if (editingNotice) {
        await updateNotice.mutateAsync({
          id: editingNotice.id,
          ...formData,
        })
        alert('공지사항이 수정되었습니다.')
      } else {
        await createNotice.mutateAsync(formData)
        alert('공지사항이 등록되었습니다.')
      }
      setIsModalOpen(false)
      setFormData(initialFormData)
    } catch (err) {
      alert('저장에 실패했습니다.')
    }
  }

  const handleDelete = async (notice: Notice) => {
    if (!confirm(`"${notice.title}" 공지사항을 삭제하시겠습니까?`)) return

    try {
      await deleteNotice.mutateAsync(notice.id)
      alert('삭제되었습니다.')
    } catch (err) {
      alert('삭제에 실패했습니다.')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-neutral-900">공지사항 관리</h1>
          <p className="text-sm text-neutral-500 mt-1">공지사항을 등록하고 관리합니다</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          공지사항 등록
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              selectedCategory === cat.id
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-500">공지사항을 불러오는 중...</p>
        </div>
      )}

      {/* Notice List */}
      {!isLoading && (
        <Card>
          <CardContent className="p-0">
            {/* Table Header - PC only */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-medium text-neutral-500 uppercase">
              <div className="col-span-1">분류</div>
              <div className="col-span-5">제목</div>
              <div className="col-span-2 text-center">등록일</div>
              <div className="col-span-2 text-center">조회수</div>
              <div className="col-span-2 text-center">관리</div>
            </div>

            {/* Notice Items */}
            <div className="divide-y divide-neutral-100">
              {sortedNotices.map((notice) => {
                const config = categoryConfig[notice.category as NoticeCategory]

                return (
                  <div key={notice.id}>
                    {/* PC View */}
                    <div
                      className={cn(
                        'hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center',
                        notice.isImportant && 'bg-red-50/50'
                      )}
                    >
                      <div className="col-span-1">
                        <Badge variant={config?.variant || 'secondary'} size="sm">
                          {config?.label || notice.category}
                        </Badge>
                      </div>
                      <div className="col-span-5 flex items-center gap-2">
                        {notice.isImportant && (
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                        <span className={cn(
                          'text-sm truncate',
                          notice.isImportant ? 'font-bold text-neutral-900' : 'text-neutral-700'
                        )}>
                          {notice.title}
                        </span>
                      </div>
                      <div className="col-span-2 text-center text-sm text-neutral-500">
                        {formatDate(notice.createdAt)}
                      </div>
                      <div className="col-span-2 text-center text-sm text-neutral-500 flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" />
                        {notice.viewCount.toLocaleString()}
                      </div>
                      <div className="col-span-2 flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(notice)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(notice)}
                          className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div
                      className={cn(
                        'md:hidden p-4',
                        notice.isImportant && 'bg-red-50/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={config?.variant || 'secondary'} size="sm">
                              {config?.label || notice.category}
                            </Badge>
                            {notice.isImportant && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <p className={cn(
                            'text-sm mb-2',
                            notice.isImportant ? 'font-bold text-neutral-900' : 'text-neutral-700'
                          )}>
                            {notice.title}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-neutral-500">
                            <span>{formatDate(notice.createdAt)}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {notice.viewCount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(notice)}
                            className="p-2 text-neutral-500 hover:text-primary-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(notice)}
                            className="p-2 text-neutral-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Empty State */}
            {sortedNotices.length === 0 && (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">등록된 공지사항이 없습니다.</p>
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
                {editingNotice ? '공지사항 수정' : '공지사항 등록'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  분류
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(categoryConfig) as NoticeCategory[]).map((cat) => (
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
                      {categoryConfig[cat].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Important Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">중요 공지로 표시 (상단 고정)</span>
              </label>

              {/* Title */}
              <Input
                label="제목"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="공지사항 제목을 입력하세요"
                required
              />

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  내용
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="공지사항 내용을 입력하세요"
                  rows={10}
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
                  disabled={createNotice.isPending || updateNotice.isPending}
                >
                  {(createNotice.isPending || updateNotice.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingNotice ? '수정' : '등록'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
