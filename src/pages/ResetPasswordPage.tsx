import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { Animated } from '../hooks'
import { supabase } from '../lib/supabase'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

  // 세션 확인 (이메일 링크에서 온 토큰 처리)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsValidSession(!!session)
    }
    checkSession()

    // URL에서 토큰 처리 (Supabase가 자동으로 처리)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('새 비밀번호를 입력해주세요.')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setIsSuccess(true)

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 세션 확인 중
  if (isValidSession === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-500">확인 중...</p>
        </Card>
      </div>
    )
  }

  // 유효하지 않은 세션
  if (!isValidSession) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Animated animation="fade-up">
          <Card className="w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">링크가 만료되었습니다</h1>
            <p className="text-neutral-500 mb-6">
              비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.<br />
              다시 요청해주세요.
            </p>
            <Button onClick={() => navigate('/forgot-password')} className="w-full">
              비밀번호 찾기로 이동
            </Button>
          </Card>
        </Animated>
      </div>
    )
  }

  // 성공
  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Animated animation="fade-up">
          <Card className="w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">비밀번호가 변경되었습니다</h1>
            <p className="text-neutral-500 mb-6">
              새 비밀번호로 로그인할 수 있습니다.<br />
              잠시 후 로그인 페이지로 이동합니다.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              로그인하기
            </Button>
          </Card>
        </Animated>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Animated animation="fade-up">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">새 비밀번호 설정</h1>
            <p className="text-neutral-500">
              새로운 비밀번호를 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                새 비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="최소 6자 이상"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 재입력"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  처리중...
                </span>
              ) : (
                '비밀번호 변경'
              )}
            </Button>
          </form>
        </Card>
      </Animated>
    </div>
  )
}
