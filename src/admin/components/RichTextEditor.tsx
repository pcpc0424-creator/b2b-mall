import { useRef, useCallback, useEffect, useState } from 'react'
import {
  Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Type, Palette, Video, Youtube, Undo2, Redo2,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { uploadBase64Image } from '../../services/storage'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const FONT_SIZES = [
  { label: '작게', value: '2' },
  { label: '보통', value: '3' },
  { label: '크게', value: '4' },
  { label: '아주 크게', value: '5' },
  { label: '제목', value: '6' },
]

const COLORS = [
  '#000000', '#333333', '#666666', '#999999',
  '#dc2626', '#ea580c', '#d97706', '#16a34a',
  '#2563eb', '#7c3aed', '#db2777', '#0891b2',
]

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [showFontSize, setShowFontSize] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const isInternalUpdate = useRef(false)

  // 외부 value가 바뀌면 에디터에 반영 (초기 로드 시)
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value
      }
    }
    isInternalUpdate.current = false
  }, [value])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdate.current = true
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // execCommand 래퍼
  const exec = useCallback((command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    handleInput()
  }, [handleInput])

  // 툴바 버튼 클릭 시 에디터 포커스 유지
  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault() // 에디터 포커스 유지
  }

  // 이미지 업로드
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !editorRef.current) return
    setIsUploading(true)

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 10 * 1024 * 1024) {
        alert('이미지는 10MB 이하만 업로드 가능합니다.')
        continue
      }

      try {
        const base64 = await fileToBase64(file)
        const url = await uploadBase64Image('product-images', base64)
        exec('insertHTML', `<p><img src="${url}" style="max-width:100%;height:auto;border-radius:8px;" /></p>`)
      } catch (err) {
        console.error('이미지 업로드 실패:', err)
        alert('이미지 업로드에 실패했습니다.')
      }
    }

    setIsUploading(false)
  }

  // 동영상 업로드
  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || !editorRef.current) return
    setIsUploading(true)

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('video/')) {
        alert('동영상 파일만 업로드 가능합니다.')
        continue
      }
      if (file.size > 100 * 1024 * 1024) {
        alert('동영상은 100MB 이하만 업로드 가능합니다.')
        continue
      }

      try {
        const base64 = await fileToBase64(file)
        const url = await uploadBase64Image('product-images', base64)
        exec('insertHTML', `<div style="position:relative;width:100%;max-width:100%;"><video src="${url}" controls playsinline style="width:100%;height:auto;border-radius:8px;"></video></div>`)
      } catch (err) {
        console.error('동영상 업로드 실패:', err)
        alert('동영상 업로드에 실패했습니다.')
      }
    }

    setIsUploading(false)
  }

  // 유튜브 삽입
  const handleYoutubeInsert = () => {
    const url = prompt('유튜브 영상 URL을 입력하세요:\n예: https://www.youtube.com/watch?v=...\n또는 https://youtu.be/...')
    if (!url) return

    const videoId = extractYoutubeId(url)
    if (!videoId) {
      alert('올바른 유튜브 URL이 아닙니다.')
      return
    }

    exec('insertHTML', `<div style="position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div><p><br></p>`)
  }

  // 글자 크기 변경
  const handleFontSize = (size: string) => {
    exec('fontSize', size)
    setShowFontSize(false)
  }

  // 글자 색 변경
  const handleForeColor = (color: string) => {
    exec('foreColor', color)
    setShowColorPicker(false)
  }

  // 클릭 외부 시 드롭다운 닫기
  useEffect(() => {
    const close = () => {
      setShowFontSize(false)
      setShowColorPicker(false)
    }
    if (showFontSize || showColorPicker) {
      document.addEventListener('click', close)
      return () => document.removeEventListener('click', close)
    }
  }, [showFontSize, showColorPicker])

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      {/* 툴바 */}
      <div
        className="flex flex-wrap items-center gap-0.5 p-1.5 bg-neutral-50 border-b border-neutral-200"
        onMouseDown={handleToolbarMouseDown}
      >
        {/* 실행 취소 / 다시 실행 */}
        <ToolBtn icon={<Undo2 className="w-4 h-4" />} title="실행 취소" onClick={() => exec('undo')} />
        <ToolBtn icon={<Redo2 className="w-4 h-4" />} title="다시 실행" onClick={() => exec('redo')} />
        <Divider />

        {/* 글자 크기 */}
        <div className="relative">
          <ToolBtn
            icon={<Type className="w-4 h-4" />}
            title="글자 크기"
            onClick={(e) => { e.stopPropagation(); setShowFontSize(!showFontSize); setShowColorPicker(false) }}
          />
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
              {FONT_SIZES.map(s => (
                <button
                  key={s.value}
                  onClick={() => handleFontSize(s.value)}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 글자 색 */}
        <div className="relative">
          <ToolBtn
            icon={<Palette className="w-4 h-4" />}
            title="글자 색"
            onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); setShowFontSize(false) }}
          />
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 p-2 grid grid-cols-4 gap-1.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => handleForeColor(c)}
                  className="w-7 h-7 rounded-md border border-neutral-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>
        <Divider />

        {/* 서식 */}
        <ToolBtn icon={<Bold className="w-4 h-4" />} title="굵게" onClick={() => exec('bold')} />
        <ToolBtn icon={<Italic className="w-4 h-4" />} title="기울임" onClick={() => exec('italic')} />
        <ToolBtn icon={<Underline className="w-4 h-4" />} title="밑줄" onClick={() => exec('underline')} />
        <Divider />

        {/* 정렬 */}
        <ToolBtn icon={<AlignLeft className="w-4 h-4" />} title="왼쪽 정렬" onClick={() => exec('justifyLeft')} />
        <ToolBtn icon={<AlignCenter className="w-4 h-4" />} title="가운데 정렬" onClick={() => exec('justifyCenter')} />
        <ToolBtn icon={<AlignRight className="w-4 h-4" />} title="오른쪽 정렬" onClick={() => exec('justifyRight')} />
        <Divider />

        {/* 목록 */}
        <ToolBtn icon={<List className="w-4 h-4" />} title="목록" onClick={() => exec('insertUnorderedList')} />
        <Divider />

        {/* 이미지 */}
        <ToolBtn
          icon={<ImageIcon className="w-4 h-4" />}
          title="이미지 추가"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => { handleImageUpload(e.target.files); e.target.value = '' }}
          className="hidden"
        />

        {/* 동영상 업로드 */}
        <ToolBtn
          icon={<Video className="w-4 h-4" />}
          title="동영상 업로드"
          onClick={() => videoInputRef.current?.click()}
          disabled={isUploading}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => { handleVideoUpload(e.target.files); e.target.value = '' }}
          className="hidden"
        />

        {/* 유튜브 */}
        <ToolBtn
          icon={<Youtube className="w-4 h-4" />}
          title="유튜브 영상 삽입"
          onClick={handleYoutubeInsert}
        />

        {isUploading && (
          <span className="text-xs text-primary-600 ml-2 flex items-center gap-1">
            <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            업로드 중...
          </span>
        )}
      </div>

      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder || '상품에 대한 상세 설명을 입력하세요.'}
        className={cn(
          'min-h-[300px] max-h-[600px] overflow-y-auto px-4 py-3 text-sm focus:outline-none',
          'prose prose-sm max-w-none',
          '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400',
          '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg',
          '[&_video]:max-w-full [&_video]:h-auto [&_video]:rounded-lg',
          '[&_iframe]:max-w-full',
        )}
      />
    </div>
  )
}

// 툴바 버튼 컴포넌트
function ToolBtn({ icon, title, onClick, disabled }: {
  icon: React.ReactNode
  title: string
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-1.5 rounded hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {icon}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-neutral-300 mx-0.5 self-center" />
}

// 붙여넣기 핸들러 (이미지 붙여넣기 지원)
async function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of Array.from(items)) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (!file) continue

      try {
        const base64 = await fileToBase64(file)
        const url = await uploadBase64Image('product-images', base64)
        document.execCommand('insertHTML', false, `<p><img src="${url}" style="max-width:100%;height:auto;border-radius:8px;" /></p>`)
      } catch (err) {
        console.error('이미지 붙여넣기 실패:', err)
      }
      return
    }
  }
}

// 유틸
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}
