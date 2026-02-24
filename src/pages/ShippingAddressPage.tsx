import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Plus, Pencil, Trash2, Star,
  Phone, User, FileText, Loader2, X
} from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, CardContent, Badge } from '../components/ui'
import {
  useUserShippingAddresses,
  useCreateShippingAddress,
  useUpdateShippingAddress,
  useDeleteShippingAddress,
  useSetDefaultShippingAddress,
} from '../hooks/queries'
import type { SavedShippingAddress, SavedShippingAddressInput } from '../admin/types/admin'

// 다음 우편번호 API 타입 선언
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void
      }) => { open: () => void }
    }
  }
}

interface DaumPostcodeData {
  zonecode: string
  address: string
  addressType: string
  bname: string
  buildingName: string
}

export function ShippingAddressPage() {
  const { user } = useStore()
  const { data: addresses = [], isLoading } = useUserShippingAddresses(user?.id)
  const createMutation = useCreateShippingAddress()
  const updateMutation = useUpdateShippingAddress()
  const deleteMutation = useDeleteShippingAddress()
  const setDefaultMutation = useSetDefaultShippingAddress()

  // 모달 상태
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<SavedShippingAddress | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SavedShippingAddress | null>(null)

  // 폼 상태
  const [formData, setFormData] = useState<SavedShippingAddressInput>({
    name: '',
    recipient: '',
    phone: '',
    postalCode: '',
    address1: '',
    address2: '',
    notes: '',
    isDefault: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 다음 우편번호 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // 모달 열기 (신규 또는 수정)
  const openModal = (address?: SavedShippingAddress) => {
    if (address) {
      setEditingAddress(address)
      setFormData({
        name: address.name,
        recipient: address.recipient,
        phone: address.phone,
        postalCode: address.postalCode,
        address1: address.address1,
        address2: address.address2 || '',
        notes: address.notes || '',
        isDefault: address.isDefault,
      })
    } else {
      setEditingAddress(null)
      setFormData({
        name: '',
        recipient: user?.name || '',
        phone: user?.phone || '',
        postalCode: '',
        address1: '',
        address2: '',
        notes: '',
        isDefault: addresses.length === 0, // 첫 배송지는 기본으로 설정
      })
    }
    setErrors({})
    setShowModal(true)
  }

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false)
    setEditingAddress(null)
    setFormData({
      name: '',
      recipient: '',
      phone: '',
      postalCode: '',
      address1: '',
      address2: '',
      notes: '',
      isDefault: false,
    })
    setErrors({})
  }

  // 우편번호 검색
  const handleAddressSearch = () => {
    if (!window.daum) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        setFormData(prev => ({
          ...prev,
          postalCode: data.zonecode,
          address1: data.address,
          address2: '',
        }))
        setTimeout(() => {
          document.getElementById('address2')?.focus()
        }, 100)
      }
    }).open()
  }

  // 유효성 검사
  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '배송지 이름을 입력해주세요'
    }
    if (!formData.recipient.trim()) {
      newErrors.recipient = '수령인을 입력해주세요'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '연락처를 입력해주세요'
    } else if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '올바른 연락처 형식이 아닙니다'
    }
    if (!formData.postalCode || !formData.address1) {
      newErrors.address1 = '주소를 검색해주세요'
    }
    if (!formData.address2?.trim()) {
      newErrors.address2 = '상세주소를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 저장
  const handleSave = async () => {
    if (!validate() || !user) return

    try {
      if (editingAddress) {
        await updateMutation.mutateAsync({
          id: editingAddress.id,
          userId: user.id,
          input: formData,
        })
      } else {
        await createMutation.mutateAsync({
          userId: user.id,
          input: formData,
        })
      }
      closeModal()
    } catch (err) {
      alert('저장에 실패했습니다.')
    }
  }

  // 삭제
  const handleDelete = async () => {
    if (!deleteTarget || !user) return

    try {
      await deleteMutation.mutateAsync({
        id: deleteTarget.id,
        userId: user.id,
      })
      setDeleteTarget(null)
    } catch (err) {
      alert('삭제에 실패했습니다.')
    }
  }

  // 기본 배송지 설정
  const handleSetDefault = async (address: SavedShippingAddress) => {
    if (!user || address.isDefault) return

    try {
      await setDefaultMutation.mutateAsync({
        id: address.id,
        userId: user.id,
      })
    } catch (err) {
      alert('기본 배송지 설정에 실패했습니다.')
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              마이페이지
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">배송지 관리</h1>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-1" />
          배송지 추가
        </Button>
      </div>

      {/* 배송지 목록 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 mb-4">등록된 배송지가 없습니다.</p>
            <Button onClick={() => openModal()}>
              <Plus className="w-4 h-4 mr-1" />
              첫 배송지 등록하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id} className={address.isDefault ? 'border-primary-500 ring-1 ring-primary-500' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-neutral-900">{address.name}</span>
                      {address.isDefault && (
                        <Badge variant="primary" size="sm">
                          <Star className="w-3 h-3 mr-1" />
                          기본 배송지
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-neutral-600">
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4 text-neutral-400" />
                        {address.recipient}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-neutral-400" />
                        {address.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        ({address.postalCode}) {address.address1} {address.address2}
                      </p>
                      {address.notes && (
                        <p className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-neutral-400" />
                          {address.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address)}
                        disabled={setDefaultMutation.isPending}
                      >
                        기본으로 설정
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(address)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(address)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900">
                {editingAddress ? '배송지 수정' : '배송지 추가'}
              </h3>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 배송지 이름 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  배송지 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 집, 회사"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-neutral-300'
                  }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* 수령인 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  수령인 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.recipient}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="수령인 이름"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.recipient ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  />
                </div>
                {errors.recipient && <p className="mt-1 text-sm text-red-500">{errors.recipient}</p>}
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="010-0000-0000"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.phone ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  주소 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.postalCode}
                    placeholder="우편번호"
                    readOnly
                    className={`w-28 px-4 py-2.5 border rounded-lg bg-neutral-50 ${
                      errors.address1 ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  />
                  <Button type="button" variant="outline" onClick={handleAddressSearch}>
                    <MapPin className="w-4 h-4 mr-1" />
                    주소 검색
                  </Button>
                </div>
                <input
                  type="text"
                  value={formData.address1}
                  placeholder="기본주소"
                  readOnly
                  className={`w-full px-4 py-2.5 border rounded-lg bg-neutral-50 mb-2 ${
                    errors.address1 ? 'border-red-500' : 'border-neutral-300'
                  }`}
                />
                <input
                  id="address2"
                  type="text"
                  value={formData.address2 || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address2: e.target.value }))}
                  placeholder="상세주소 입력"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.address2 ? 'border-red-500' : 'border-neutral-300'
                  }`}
                />
                {(errors.address1 || errors.address2) && (
                  <p className="mt-1 text-sm text-red-500">{errors.address1 || errors.address2}</p>
                )}
              </div>

              {/* 배송 메모 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  배송 메모
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="배송 시 요청사항 (예: 부재 시 경비실에 맡겨주세요)"
                    rows={2}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
              </div>

              {/* 기본 배송지 설정 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">기본 배송지로 설정</span>
              </label>
            </div>

            <div className="flex gap-2 p-6 border-t border-neutral-200">
              <Button variant="outline" className="flex-1" onClick={closeModal} disabled={isSaving}>
                취소
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  '저장'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">배송지 삭제</h3>
            <p className="text-sm text-neutral-600 mb-6">
              "{deleteTarget.name}" 배송지를 삭제하시겠습니까?<br />
              삭제된 배송지는 복구할 수 없습니다.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
              >
                취소
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  '삭제'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
