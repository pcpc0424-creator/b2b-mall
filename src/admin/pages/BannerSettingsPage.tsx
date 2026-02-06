import { useState, useRef } from 'react'
import { Save, Image, Link as LinkIcon, Eye, EyeOff, Upload, Trash2, Maximize2 } from 'lucide-react'
import { useSiteSettings, useUpdateSiteSettings } from '../../hooks/queries'
import { uploadBase64Image } from '../../services/storage'
import { Button, Card, CardContent } from '../../components/ui'

export function BannerSettingsPage() {
  const { data: siteSettings, isLoading } = useSiteSettings()

  // 로딩 중이면 로딩 UI 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-neutral-500">로딩 중...</span>
      </div>
    )
  }

  return (
    <BannerSettingsForm
      initialImage={siteSettings?.topBanner?.image || ''}
      initialAlt={siteSettings?.topBanner?.alt || '가성비연구소 PRICE LAB'}
      initialLink={siteSettings?.topBanner?.link || ''}
      initialIsActive={siteSettings?.topBanner?.isActive ?? true}
      initialHeight={siteSettings?.topBanner?.height || 0}
    />
  )
}

function BannerSettingsForm({
  initialImage,
  initialAlt,
  initialLink,
  initialIsActive,
  initialHeight,
}: {
  initialImage: string
  initialAlt: string
  initialLink: string
  initialIsActive: boolean
  initialHeight: number
}) {
  const updateMutation = useUpdateSiteSettings()
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 로컬 상태 (초기값은 props에서 한 번만 설정됨)
  const [bannerImage, setBannerImage] = useState(initialImage)
  const [bannerAlt, setBannerAlt] = useState(initialAlt)
  const [bannerLink, setBannerLink] = useState(initialLink)
  const [isActive, setIsActive] = useState(initialIsActive)
  const [bannerHeight, setBannerHeight] = useState(initialHeight)

  // 이미지 파일 업로드 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하로 선택해주세요.')
      return
    }

    // 이미지 파일 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setBannerImage(base64)
    }
    reader.readAsDataURL(file)
  }

  // 이미지 삭제
  const handleRemoveImage = () => {
    setBannerImage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 저장
  const handleSave = async () => {
    setIsSaving(true)

    try {
      // base64 이미지를 Supabase Storage에 업로드
      let imageUrl = bannerImage
      console.log('저장 시작 - bannerImage:', bannerImage?.substring(0, 100))

      if (bannerImage && bannerImage.startsWith('data:')) {
        console.log('이미지 업로드 시도...')
        imageUrl = await uploadBase64Image('site-images', bannerImage)
        console.log('업로드 결과 imageUrl:', imageUrl)
      }

      if (!imageUrl && bannerImage) {
        throw new Error('이미지 업로드에 실패했습니다. Storage 버킷을 확인해주세요.')
      }

      console.log('DB 저장 시도...')
      await updateMutation.mutateAsync({
        topBanner: {
          image: imageUrl,
          alt: bannerAlt,
          link: bannerLink,
          isActive,
          height: bannerHeight,
        },
        updatedAt: new Date(),
      })

      setBannerImage(imageUrl)
      alert('저장되었습니다.')
    } catch (error) {
      console.error('배너 저장 실패:', error)
      alert(error instanceof Error ? error.message : '저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  // 기본 배너 URL
  const defaultBannerUrl = `${import.meta.env.BASE_URL}be.jpeg`
  const displayImage = bannerImage || defaultBannerUrl

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">배너 이미지 설정</h1>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          <Save className="w-4 h-4 mr-1" />
          {isSaving ? '저장...' : '저장'}
        </Button>
      </div>

      {/* 활성화 토글 */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isActive ? (
                <Eye className="w-4 h-4 text-green-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-neutral-400" />
              )}
              <span className="text-sm font-medium text-neutral-900">배너 표시</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            비활성화하면 홈페이지 상단 배너가 숨겨집니다.
          </p>
        </CardContent>
      </Card>

      {/* 현재 배너 미리보기 */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-900">현재 배너</span>
          </div>

          <div className="relative border border-neutral-200 rounded-lg overflow-hidden">
            <img
              src={displayImage}
              alt={bannerAlt}
              className="w-full object-cover"
              style={{ height: bannerHeight > 0 ? `${bannerHeight}px` : 'auto' }}
            />
            {!bannerImage && (
              <div className="absolute bottom-2 right-2">
                <span className="px-2 py-1 bg-neutral-900/70 text-white text-xs rounded">
                  기본 이미지
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 배너 크기 설정 */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-900">배너 크기</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">
                높이 설정 (0 = 자동)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={bannerHeight}
                  onChange={(e) => setBannerHeight(Number(e.target.value))}
                  className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={bannerHeight}
                    onChange={(e) => setBannerHeight(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-sm text-center border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-xs text-neutral-500">px</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {bannerHeight === 0 ? '자동: 이미지 원본 비율 유지' : `고정 높이: ${bannerHeight}px`}
              </p>
            </div>

            {/* 빠른 선택 버튼 */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBannerHeight(0)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  bannerHeight === 0
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary-400'
                }`}
              >
                자동
              </button>
              {[100, 150, 200, 250, 300].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setBannerHeight(h)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    bannerHeight === h
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary-400'
                  }`}
                >
                  {h}px
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 이미지 업로드 */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-900">이미지 변경</span>
          </div>

          <div className="space-y-3">
            {/* 파일 업로드 */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="banner-upload"
              />
              <label
                htmlFor="banner-upload"
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <Upload className="w-5 h-5 text-neutral-400" />
                <span className="text-sm text-neutral-600">
                  클릭하여 이미지 업로드 (최대 10MB)
                </span>
              </label>
            </div>

            {/* 또는 URL 입력 */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-xs text-neutral-400">또는</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">이미지 URL 직접 입력</label>
              <input
                type="text"
                value={bannerImage.startsWith('data:') ? '' : bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* 이미지 삭제 (기본으로 되돌리기) */}
            {bannerImage && (
              <Button variant="outline" size="sm" onClick={handleRemoveImage} className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />
                기본 이미지로 되돌리기
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 기타 설정 */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <span className="text-sm font-medium text-neutral-900">기타 설정</span>

          {/* 대체 텍스트 */}
          <div>
            <label className="block text-xs text-neutral-500 mb-1">
              대체 텍스트 (접근성용)
            </label>
            <input
              type="text"
              value={bannerAlt}
              onChange={(e) => setBannerAlt(e.target.value)}
              placeholder="가성비연구소 PRICE LAB"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* 클릭 링크 */}
          <div>
            <label className="flex items-center gap-1 text-xs text-neutral-500 mb-1">
              <LinkIcon className="w-3 h-3" />
              클릭 시 이동할 링크 (선택사항)
            </label>
            <input
              type="text"
              value={bannerLink}
              onChange={(e) => setBannerLink(e.target.value)}
              placeholder="/promotions 또는 https://example.com"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-neutral-400 mt-1">
              비워두면 클릭해도 이동하지 않습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
