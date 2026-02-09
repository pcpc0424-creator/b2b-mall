import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { usePopupModals } from '../../hooks/queries'
import { useStore } from '../../store'
import { PopupModal, ModalTargetPage } from '../../admin/types/admin'
import { Button } from '../ui'
import { cn } from '../../lib/utils'

// 세션 스토리지 키 (세션당 1회)
const SHOWN_MODALS_KEY = 'b2b-mall-shown-modals'
// 로컬 스토리지 키 (오늘 하루 보지 않기)
const HIDDEN_TODAY_KEY = 'b2b-mall-hidden-today'

// 현재 페이지를 ModalTargetPage로 변환
function getPageType(pathname: string): ModalTargetPage {
  if (pathname === '/' || pathname === '') return 'home'
  if (pathname === '/products' || pathname.startsWith('/category/')) return 'products'
  if (pathname.startsWith('/product/')) return 'product-detail'
  if (pathname === '/cart') return 'cart'
  if (pathname === '/login') return 'login'
  if (pathname === '/register') return 'register'
  return 'home' // 기본값
}

// 표시된 모달 ID 목록 가져오기
function getShownModals(): string[] {
  try {
    const data = sessionStorage.getItem(SHOWN_MODALS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// 표시된 모달 ID 추가
function addShownModal(id: string) {
  const shown = getShownModals()
  if (!shown.includes(id)) {
    shown.push(id)
    sessionStorage.setItem(SHOWN_MODALS_KEY, JSON.stringify(shown))
  }
}

// 오늘 하루 숨김 모달 목록 가져오기
function getHiddenTodayModals(): Record<string, number> {
  try {
    const data = localStorage.getItem(HIDDEN_TODAY_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

// 오늘 하루 숨김 체크
function isHiddenToday(id: string): boolean {
  const hidden = getHiddenTodayModals()
  const expireTime = hidden[id]
  if (!expireTime) return false

  // 만료 시간이 지났으면 false
  if (Date.now() > expireTime) {
    // 만료된 항목 정리
    delete hidden[id]
    localStorage.setItem(HIDDEN_TODAY_KEY, JSON.stringify(hidden))
    return false
  }

  return true
}

// 오늘 하루 숨김 추가 (자정까지)
function hideModalToday(id: string) {
  const hidden = getHiddenTodayModals()

  // 오늘 자정까지의 시간 계산
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
  hidden[id] = midnight.getTime()

  localStorage.setItem(HIDDEN_TODAY_KEY, JSON.stringify(hidden))
}

export function PopupModalDisplay() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: popupModals = [] } = usePopupModals()
  const { isLoggedIn } = useStore()
  const [currentModal, setCurrentModal] = useState<PopupModal | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hideToday, setHideToday] = useState(false)
  // 세션 중 닫은 모달 ID 목록 (X 버튼으로 닫은 경우)
  const [dismissedModals, setDismissedModals] = useState<string[]>([])
  // 닫기 애니메이션 중 상태 (중복 모달 방지)
  const isClosingRef = useRef(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 이전 로그인 상태 추적
  const prevIsLoggedInRef = useRef(isLoggedIn)

  // 로그인 상태 변경 시 dismissed 초기화 (로그인하면 모달 다시 표시)
  useEffect(() => {
    // 실제로 로그인 상태가 변경되었을 때만 초기화
    if (prevIsLoggedInRef.current !== isLoggedIn) {
      prevIsLoggedInRef.current = isLoggedIn
      // 닫기 애니메이션이 진행 중이면 완료될 때까지 대기
      if (isClosingRef.current) {
        // 애니메이션 완료 후 dismissed 초기화
        const checkAndReset = () => {
          if (!isClosingRef.current) {
            setDismissedModals([])
          } else {
            setTimeout(checkAndReset, 50)
          }
        }
        setTimeout(checkAndReset, 50)
      } else {
        setDismissedModals([])
      }
    }
  }, [isLoggedIn])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // 닫기 애니메이션 중이면 새 모달 표시하지 않음
    if (isClosingRef.current) return

    const pageType = getPageType(location.pathname)
    const now = new Date()

    // 현재 페이지에 표시할 모달 필터링
    const eligibleModals = popupModals
      .filter(modal => {
        // 활성화 상태 체크
        if (!modal.isActive) return false

        // 로그인 전용 체크
        if (modal.showToLoggedInOnly && !isLoggedIn) return false

        // 페이지 체크
        if (!modal.targetPages.includes('all') && !modal.targetPages.includes(pageType)) return false

        // 세션 중 닫은 모달 체크 (X로 닫은 경우)
        if (dismissedModals.includes(modal.id)) return false

        // 오늘 하루 보지 않기 체크
        if (isHiddenToday(modal.id)) return false

        // 날짜 체크
        if (modal.startDate && new Date(modal.startDate) > now) return false
        if (modal.endDate && new Date(modal.endDate) < now) return false

        return true
      })
      // 우선순위 순으로 정렬
      .sort((a, b) => b.priority - a.priority)

    // 가장 우선순위 높은 모달 표시
    if (eligibleModals.length > 0) {
      const modal = eligibleModals[0]
      setCurrentModal(modal)
      setIsVisible(true)
    } else {
      setCurrentModal(null)
      setIsVisible(false)
    }
  }, [location.pathname, popupModals, isLoggedIn, dismissedModals])

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return // 이미 닫는 중이면 무시

    if (currentModal) {
      // 오늘 하루 보지 않기 체크되어 있으면 저장
      if (hideToday) {
        hideModalToday(currentModal.id)
      }
      // X로 닫은 모달 기록 (로그인 상태 바뀌면 초기화됨)
      setDismissedModals(prev => [...prev, currentModal.id])
    }

    isClosingRef.current = true
    setIsVisible(false)
    setHideToday(false)

    // 이전 타이머가 있으면 정리
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }

    closeTimeoutRef.current = setTimeout(() => {
      setCurrentModal(null)
      isClosingRef.current = false
    }, 300)
  }, [currentModal, hideToday])

  const handleButtonClick = () => {
    if (currentModal?.buttonLink) {
      navigate(currentModal.buttonLink)
    }
    handleClose()
  }

  if (!currentModal) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300',
        isVisible ? 'bg-black/50 opacity-100' : 'bg-transparent opacity-0 pointer-events-none'
      )}
      onClick={handleClose}
    >
      <div
        className={cn(
          'bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto shadow-2xl transition-all duration-300',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md transition-colors"
        >
          <X className="w-5 h-5 text-neutral-600" />
        </button>

        {/* 이미지 */}
        {currentModal.image && (
          <div className="w-full">
            <img
              src={currentModal.image}
              alt={currentModal.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-3">{currentModal.title}</h2>

          {currentModal.content && (
            <div
              className="text-neutral-600 mb-4 prose prose-sm"
              dangerouslySetInnerHTML={{ __html: currentModal.content }}
            />
          )}

          {/* 버튼 */}
          <div className="flex gap-2 mt-4">
            {currentModal.buttonText && (
              <Button onClick={handleButtonClick} className="flex-1">
                {currentModal.buttonText}
              </Button>
            )}
            <Button variant="outline" onClick={handleClose} className={currentModal.buttonText ? '' : 'flex-1'}>
              닫기
            </Button>
          </div>

          {/* 오늘 하루 보지 않기 */}
          <label className="flex items-center justify-center gap-2 mt-4 cursor-pointer text-sm text-neutral-500 hover:text-neutral-700">
            <input
              type="checkbox"
              checked={hideToday}
              onChange={(e) => setHideToday(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300"
            />
            오늘 하루 보지 않기
          </label>
        </div>
      </div>
    </div>
  )
}
