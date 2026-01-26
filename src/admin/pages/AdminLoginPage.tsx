import { useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useAdminStore } from '../store/adminStore'
import { Button, Input } from '../../components/ui'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { adminLogin, isAdminAuthenticated } = useAdminStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin'

  // 이미 로그인된 경우 리다이렉트
  if (isAdminAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // 데모용 하드코딩 인증 (실제로는 API 호출)
    await new Promise(resolve => setTimeout(resolve, 500))

    if (email === 'admin@example.com' && password === 'admin123') {
      adminLogin({
        id: 'admin-1',
        email: 'admin@example.com',
        name: '관리자',
        role: 'super_admin',
        permissions: [
          'products:read', 'products:write', 'products:delete',
          'orders:read', 'orders:write',
          'members:read', 'members:write',
          'settings:read', 'settings:write'
        ],
        createdAt: new Date(),
        lastLoginAt: new Date()
      })
      navigate(from, { replace: true })
    } else {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">관리자 로그인</h1>
          <p className="text-neutral-400">가성비연구소 관리자 페이지</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500 text-center mb-2">데모 계정 정보</p>
            <p className="text-sm text-neutral-600 text-center">
              이메일: <span className="font-mono">admin@example.com</span>
            </p>
            <p className="text-sm text-neutral-600 text-center">
              비밀번호: <span className="font-mono">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
