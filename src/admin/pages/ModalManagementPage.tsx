import { useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Image } from 'lucide-react'
import { useAdminStore } from '../store/adminStore'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import { cn } from '../../lib/utils'
import { PopupModal, ModalTargetPage } from '../types/admin'

const targetPageLabels: Record<ModalTargetPage, string> = {
  home: '메인 페이지',
  products: '상품 목록',
  'product-detail': '상품 상세',
  cart: '장바구니',
  login: '로그인',
  register: '회원가입',
  all: '전체 페이지',
}

const defaultModal: Omit<PopupModal, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  content: '',
  isActive: false,
  targetPages: ['home'],
  showOnce: true,
  showToLoggedInOnly: false,
  buttonText: '',
  buttonLink: '',
  priority: 1,
}

export function ModalManagementPage() {
  const { popupModals, addPopupModal, updatePopupModal, deletePopupModal, togglePopupModalActive } = useAdminStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editingModal, setEditingModal] = useState<PopupModal | null>(null)
  const [formData, setFormData] = useState(defaultModal)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleAdd = () => {
    setEditingModal(null)
    setFormData(defaultModal)
    setPreviewImage(null)
    setIsEditing(true)
  }

  const handleEdit = (modal: PopupModal) => {
    setEditingModal(modal)
    setFormData({
      title: modal.title,
      content: modal.content,
      image: modal.image,
      isActive: modal.isActive,
      targetPages: modal.targetPages,
      showOnce: modal.showOnce,
      showToLoggedInOnly: modal.showToLoggedInOnly,
      buttonText: modal.buttonText || '',
      buttonLink: modal.buttonLink || '',
      priority: modal.priority,
    })
    setPreviewImage(modal.image || null)
    setIsEditing(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deletePopupModal(id)
    }
  }

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    if (editingModal) {
      updatePopupModal(editingModal.id, formData)
    } else {
      const newModal: PopupModal = {
        ...formData,
        id: `modal-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      addPopupModal(newModal)
    }

    setIsEditing(false)
    setEditingModal(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFormData({ ...formData, image: base64 })
        setPreviewImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTargetPageToggle = (page: ModalTargetPage) => {
    if (page === 'all') {
      setFormData({ ...formData, targetPages: ['all'] })
    } else {
      const currentPages = formData.targetPages.filter(p => p !== 'all')
      if (currentPages.includes(page)) {
        setFormData({ ...formData, targetPages: currentPages.filter(p => p !== page) })
      } else {
        setFormData({ ...formData, targetPages: [...currentPages, page] })
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-neutral-900">팝업 모달 관리</h1>
          <span className="text-sm text-neutral-500">{popupModals.length}개</span>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" />
          새 모달
        </Button>
      </div>

      {/* Modal List */}
      <div className="space-y-3">
        {popupModals.map((modal) => (
          <Card key={modal.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-neutral-900 truncate">{modal.title}</h3>
                    <Badge variant={modal.isActive ? 'success' : 'default'} size="sm">
                      {modal.isActive ? '활성' : '비활성'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {modal.targetPages.map(page => (
                      <span key={page} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded">
                        {targetPageLabels[page]}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    {modal.showOnce && <span>1회만 표시</span>}
                    {modal.showToLoggedInOnly && <span>회원전용</span>}
                    <span>우선순위: {modal.priority}</span>
                  </div>
                </div>
                {modal.image && (
                  <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-neutral-100">
                    <img src={modal.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePopupModalActive(modal.id)}
                    title={modal.isActive ? '비활성화' : '활성화'}
                  >
                    {modal.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(modal)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(modal.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {popupModals.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            등록된 모달이 없습니다.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <h2 className="font-bold">{editingModal ? '모달 수정' : '새 모달 추가'}</h2>
              <button onClick={() => setIsEditing(false)} className="text-neutral-400 hover:text-neutral-600 text-2xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">제목 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  placeholder="모달 제목"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">내용 (HTML 지원)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg h-32"
                  placeholder="<p>모달 내용을 입력하세요.</p>"
                />
              </div>

              {/* 이미지 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">이미지</label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-sm"
                    />
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value })
                        setPreviewImage(e.target.value)
                      }}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg mt-2 text-sm"
                      placeholder="또는 이미지 URL 입력"
                    />
                  </div>
                  {previewImage && (
                    <div className="w-24 h-24 rounded overflow-hidden bg-neutral-100 flex-shrink-0">
                      <img src={previewImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* 표시 페이지 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">표시 페이지</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(targetPageLabels) as ModalTargetPage[]).map((page) => (
                    <button
                      key={page}
                      onClick={() => handleTargetPageToggle(page)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        formData.targetPages.includes(page)
                          ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      )}
                    >
                      {targetPageLabels[page]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 옵션들 */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnce}
                    onChange={(e) => setFormData({ ...formData, showOnce: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">세션당 1회만 표시</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showToLoggedInOnly}
                    onChange={(e) => setFormData({ ...formData, showToLoggedInOnly: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">로그인 회원에게만</span>
                </label>
              </div>

              {/* 버튼 설정 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">버튼 텍스트</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    placeholder="예: 자세히 보기"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">버튼 링크</label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    placeholder="예: /promotions"
                  />
                </div>
              </div>

              {/* 우선순위 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">우선순위 (높을수록 먼저 표시)</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  className="w-24 px-3 py-2 border border-neutral-200 rounded-lg"
                  min="1"
                />
              </div>

              {/* 활성화 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium">즉시 활성화</span>
              </label>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-4 py-3 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>취소</Button>
              <Button onClick={handleSave}>저장</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
