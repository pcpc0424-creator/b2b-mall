import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Building2, Phone, FileText, MapPin, UserPlus } from 'lucide-react'
import { useStore } from '../store'
import { Button, Input, Card, CardContent } from '../components/ui'
import { cn } from '../lib/utils'

type Step = 1 | 2 | 3

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useStore()
  const [step, setStep] = useState<Step>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  })
  const [formData, setFormData] = useState({
    // 기본 정보
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    // 사업자 정보
    companyName: '',
    businessNumber: '',
    representative: '',
    businessType: '',
    businessCategory: '',
    // 주소
    zipCode: '',
    address: '',
    addressDetail: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleAgreeAll = (checked: boolean) => {
    setAgreedTerms({
      all: checked,
      terms: checked,
      privacy: checked,
      marketing: checked,
    })
  }

  const handleAgreeItem = (key: 'terms' | 'privacy' | 'marketing', checked: boolean) => {
    const newTerms = { ...agreedTerms, [key]: checked }
    newTerms.all = newTerms.terms && newTerms.privacy && newTerms.marketing
    setAgreedTerms(newTerms)
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다'
    }
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다'
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
    }
    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요'
    }
    if (!formData.phone) {
      newErrors.phone = '연락처를 입력해주세요'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.companyName) {
      newErrors.companyName = '회사명을 입력해주세요'
    }
    if (!formData.businessNumber) {
      newErrors.businessNumber = '사업자등록번호를 입력해주세요'
    } else if (!/^\d{10}$/.test(formData.businessNumber.replace(/-/g, ''))) {
      newErrors.businessNumber = '올바른 사업자등록번호 형식이 아닙니다'
    }
    if (!formData.representative) {
      newErrors.representative = '대표자명을 입력해주세요'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    if (!agreedTerms.terms || !agreedTerms.privacy) {
      setErrors({ terms: '필수 약관에 동의해주세요' })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handlePrev = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return

    setIsLoading(true)
    // 실제 API 호출 대신 mock 회원가입
    setTimeout(() => {
      login({
        id: 'new-user',
        email: formData.email,
        name: formData.name,
        company: formData.companyName,
        tier: 'member',
        businessNumber: formData.businessNumber,
      })
      setIsLoading(false)
      navigate('/')
    }, 1500)
  }

  const steps = [
    { number: 1, title: '기본 정보' },
    { number: 2, title: '사업자 정보' },
    { number: 3, title: '약관 동의' },
  ]

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">회원가입</h1>
          <p className="text-neutral-500">가성비연구소 사업자 회원가입</p>
        </div>

        {/* 단계 표시 */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors',
                    step >= s.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  )}
                >
                  {s.number}
                </div>
                <span className={cn(
                  'text-xs mt-1',
                  step >= s.number ? 'text-primary-600' : 'text-neutral-500'
                )}>
                  {s.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-16 md:w-24 h-1 mx-2',
                    step > s.number ? 'bg-primary-600' : 'bg-neutral-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: 기본 정보 */}
              {step === 1 && (
                <div className="space-y-5">
                  <Input
                    label="이메일 *"
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
                      label="비밀번호 *"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="8자 이상 입력하세요"
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

                  <div className="relative">
                    <Input
                      label="비밀번호 확인 *"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="비밀번호를 다시 입력하세요"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      icon={<Lock className="w-5 h-5" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[34px] text-neutral-400 hover:text-neutral-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="이름 *"
                      type="text"
                      name="name"
                      placeholder="홍길동"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      icon={<User className="w-5 h-5" />}
                    />
                    <Input
                      label="연락처 *"
                      type="tel"
                      name="phone"
                      placeholder="010-0000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      icon={<Phone className="w-5 h-5" />}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: 사업자 정보 */}
              {step === 2 && (
                <div className="space-y-5">
                  <Input
                    label="회사명 *"
                    type="text"
                    name="companyName"
                    placeholder="(주)회사명"
                    value={formData.companyName}
                    onChange={handleChange}
                    error={errors.companyName}
                    icon={<Building2 className="w-5 h-5" />}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="사업자등록번호 *"
                      type="text"
                      name="businessNumber"
                      placeholder="000-00-00000"
                      value={formData.businessNumber}
                      onChange={handleChange}
                      error={errors.businessNumber}
                      icon={<FileText className="w-5 h-5" />}
                    />
                    <Input
                      label="대표자명 *"
                      type="text"
                      name="representative"
                      placeholder="대표자 이름"
                      value={formData.representative}
                      onChange={handleChange}
                      error={errors.representative}
                      icon={<User className="w-5 h-5" />}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="업태"
                      type="text"
                      name="businessType"
                      placeholder="제조, 도소매 등"
                      value={formData.businessType}
                      onChange={handleChange}
                    />
                    <Input
                      label="업종"
                      type="text"
                      name="businessCategory"
                      placeholder="연구용품 등"
                      value={formData.businessCategory}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="우편번호"
                      type="text"
                      name="zipCode"
                      placeholder="00000"
                      value={formData.zipCode}
                      onChange={handleChange}
                      icon={<MapPin className="w-5 h-5" />}
                    />
                    <div className="col-span-2">
                      <Input
                        label="주소"
                        type="text"
                        name="address"
                        placeholder="기본 주소"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <Input
                    type="text"
                    name="addressDetail"
                    placeholder="상세 주소"
                    value={formData.addressDetail}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Step 3: 약관 동의 */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedTerms.all}
                        onChange={(e) => handleAgreeAll(e.target.checked)}
                        className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="font-medium text-neutral-900">전체 동의</span>
                    </label>
                  </div>

                  <div className="space-y-3 pl-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedTerms.terms}
                        onChange={(e) => handleAgreeItem('terms', e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-neutral-700">
                        <span className="text-error">[필수]</span> 이용약관 동의
                      </span>
                      <button type="button" className="ml-auto text-sm text-primary-600 hover:underline">
                        보기
                      </button>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedTerms.privacy}
                        onChange={(e) => handleAgreeItem('privacy', e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-neutral-700">
                        <span className="text-error">[필수]</span> 개인정보 수집 및 이용 동의
                      </span>
                      <button type="button" className="ml-auto text-sm text-primary-600 hover:underline">
                        보기
                      </button>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedTerms.marketing}
                        onChange={(e) => handleAgreeItem('marketing', e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-neutral-700">
                        <span className="text-neutral-400">[선택]</span> 마케팅 정보 수신 동의
                      </span>
                      <button type="button" className="ml-auto text-sm text-primary-600 hover:underline">
                        보기
                      </button>
                    </label>
                  </div>

                  {errors.terms && (
                    <p className="text-sm text-error">{errors.terms}</p>
                  )}

                  <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                    <h3 className="font-medium text-primary-900 mb-2">회원가입 완료 후 혜택</h3>
                    <ul className="text-sm text-primary-700 space-y-1">
                      <li>• 일반회원 등급 즉시 적용</li>
                      <li>• 회원 전용 할인가 제공</li>
                      <li>• 견적서 발행 및 관리</li>
                      <li>• 주문 내역 및 배송 조회</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 버튼 영역 */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handlePrev}
                    className="flex-1"
                  >
                    이전
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleNext}
                    className="flex-1"
                  >
                    다음
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        가입 처리 중...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        회원가입
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
              <p className="text-neutral-600">
                이미 회원이신가요?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  로그인
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
