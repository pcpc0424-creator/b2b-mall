import { useState, useRef } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Image as ImageIcon, Upload } from 'lucide-react'
import { usePopupModals, useCreatePopupModal, useUpdatePopupModal, useDeletePopupModal, useTogglePopupModalActive } from '../../hooks/queries'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import { cn } from '../../lib/utils'
import { PopupModal, ModalTargetPage } from '../types/admin'
import { uploadImage } from '../../services/storage'

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
  const { data: popupModals = [], isLoading } = usePopupModals()
  const createMutation = useCreatePopupModal()
  const updateMutation = useUpdatePopupModal()
  const deleteMutation = useDeletePopupModal()
  const toggleMutation = useTogglePopupModalActive()
  const [isEditing, setIsEditing] = useState(false)
  const [editingModal, setEditingModal] = useState<PopupModal | null>(null)
  const [formData, setFormData] = useState(defaultModal)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      deleteMutation.mutate(id)
    }
  }

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    if (editingModal) {
      updateMutation.mutate({ id: editingModal.id, updates: formData })
    } else {
      const newModal: PopupModal = {
        ...formData,
        id: `modal-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      createMutation.mutate(newModal)
    }

    setIsEditing(false)
    setEditingModal(null)
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    setIsUploading(true)
    try {
      const url = await uploadImage('modals', file)
      setFormData({ ...formData, image: url })
      setPreviewImage(url)
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
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
      {isLoading && (
        <div className="text-center py-12 text-neutral-500">로딩 중...</div>
      )}
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
                    onClick={() => toggleMutation.mutate({ id: modal.id, currentActive: modal.isActive })}
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="모달 이미지"
                      className="w-full h-48 object-cover rounded-lg border border-neutral-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        변경
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setFormData({ ...formData, image: undefined })
                          setPreviewImage(null)
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-sm text-neutral-500">업로드 중...</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-neutral-400 mb-2" />
                        <p className="text-sm text-neutral-600 font-medium">클릭하거나 이미지를 드래그하세요</p>
                        <p className="text-xs text-neutral-400 mt-1">PNG, JPG, GIF (최대 5MB)</p>
                      </>
                    )}
                  </div>
                )}
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
