import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { useStore } from '../store'
import { Button, Input, Card, CardContent } from '../components/ui'
import { loginWithEmail, simulateSocialLogin, getProviderName } from '../services/auth'
import { SocialProvider } from '../types'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useStore()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null)

  // 로그인 후 원래 페이지로 돌아가기
  const from = (location.state as any)?.from?.pathname || '/'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다'
    }
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const result = await loginWithEmail(formData.email, formData.password)
      if (result.success && result.user) {
        login(result.user)
        navigate(from, { replace: true })
      } else {
        setErrors({ general: result.error || '로그인에 실패했습니다.' })
      }
    } catch (error) {
      setErrors({ general: '로그인 중 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: SocialProvider) => {
    setSocialLoading(provider)
    try {
      const result = await simulateSocialLogin(provider)
      if (result.success && result.user) {
        login(result.user)
        if (result.isNewUser) {
          alert(`${getProviderName(provider)}로 회원가입이 완료되었습니다!`)
        }
        navigate(from, { replace: true })
      } else {
        alert(result.error || '소셜 로그인에 실패했습니다.')
      }
    } catch (error) {
      alert('소셜 로그인 중 오류가 발생했습니다.')
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">로그인</h1>
          <p className="text-neutral-500">가성비연구소에 오신 것을 환영합니다</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* SNS 간편 로그인 */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-neutral-500 text-center mb-4">SNS 계정으로 간편 로그인</p>

              {/* 카카오 */}
              <button
                type="button"
                onClick={() => handleSocialLogin('kakao')}
                disabled={socialLoading !== null}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {socialLoading === 'kakao' ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.796 1.859 5.238 4.656 6.618-.145.531-.933 3.413-.966 3.633 0 0-.02.166.088.23.108.064.235.015.235.015.31-.043 3.587-2.345 4.156-2.747.593.087 1.208.134 1.831.134 5.523 0 10-3.463 10-7.883C22 6.463 17.523 3 12 3"/>
                  </svg>
                )}
                카카오로 로그인
              </button>

              {/* 네이버 */}
              <button
                type="button"
                onClick={() => handleSocialLogin('naver')}
                disabled={socialLoading !== null}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#03C75A] hover:bg-[#02b351] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {socialLoading === 'naver' ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
                  </svg>
                )}
                네이버로 로그인
              </button>

              {/* 구글 */}
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={socialLoading !== null}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-medium rounded-lg border border-neutral-300 transition-colors disabled:opacity-50"
              >
                {socialLoading === 'google' ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Google로 로그인
              </button>
            </div>

            {/* 일반 오류 메시지 */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {errors.general}
              </div>
            )}

            {/* 구분선 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500">또는 이메일로 로그인</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="이메일"
                type="email"
                name="email"
                placeholder="example@company.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={<Mail className="w-5 h-5" />}
              />

              <div className="relative">
                <Input
                  label="비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon={<Lock className="w-5 h-5" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-neutral-600">로그인 상태 유지</span>
                </label>
                <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700">
                  비밀번호 찾기
                </Link>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    로그인 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    로그인
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
              <p className="text-neutral-600">
                아직 회원이 아니신가요?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  회원가입
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
