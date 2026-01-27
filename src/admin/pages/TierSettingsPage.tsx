import { useState } from 'react'
import { Crown, Save, Info } from 'lucide-react'
import { useTierSettings, useUpdateTierSettings } from '../../hooks/queries'
import { Button, Card, CardContent } from '../../components/ui'
import { formatPrice, cn } from '../../lib/utils'
import { UserTier } from '../../types'
import { TierSettings } from '../types/admin'

const tierLabels: Record<UserTier, string> = {
  guest: '비회원',
  member: '일반회원',
  premium: '우수회원',
  vip: 'VIP회원',
}

const tierColors: Record<UserTier, string> = {
  guest: 'bg-neutral-100 text-neutral-700',
  member: 'bg-green-100 text-green-700',
  premium: 'bg-blue-100 text-blue-700',
  vip: 'bg-amber-100 text-amber-700',
}

const periodLabels = {
  monthly: '월간',
  quarterly: '분기',
  yearly: '연간',
  cumulative: '누적',
}

const defaultTierSettings: TierSettings = {
  isEnabled: true,
  autoUpgrade: true,
  autoDowngrade: false,
  evaluationPeriod: 'cumulative',
  thresholds: [
    { tier: 'member', minPurchaseAmount: 0, discountRate: 0, pointRate: 1, freeShipping: false },
    { tier: 'premium', minPurchaseAmount: 500000, discountRate: 3, pointRate: 2, freeShipping: false },
    { tier: 'vip', minPurchaseAmount: 2000000, discountRate: 5, pointRate: 3, freeShipping: true },
  ],
  updatedAt: new Date(),
}

export function TierSettingsPage() {
  const { data: tierSettings = defaultTierSettings } = useTierSettings()
  const updateMutation = useUpdateTierSettings()
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveMessage, setShowSaveMessage] = useState(false)

  const updateTierSettings = (updates: Partial<TierSettings>) => {
    updateMutation.mutate({ ...tierSettings, ...updates, updatedAt: new Date() })
  }

  const updateTierThreshold = (tier: UserTier, updates: Partial<TierSettings['thresholds'][0]>) => {
    updateMutation.mutate({
      ...tierSettings,
      thresholds: tierSettings.thresholds.map(t =>
        t.tier === tier ? { ...t, ...updates } : t
      ),
      updatedAt: new Date(),
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    await updateMutation.mutateAsync(tierSettings)
    setIsSaving(false)
    setShowSaveMessage(true)
    setTimeout(() => setShowSaveMessage(false), 2000)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-neutral-900">회원 등급 설정</h1>
            <p className="text-xs sm:text-sm text-neutral-500">등급 시스템 및 기준 금액을 설정합니다</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>

      {showSaveMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          설정이 저장되었습니다.
        </div>
      )}

      {/* 등급 시스템 활성화 */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">자동 등급 시스템</h2>
              <p className="text-sm text-neutral-500 mt-1">
                구매 금액에 따라 자동으로 회원 등급이 변경됩니다
              </p>
            </div>
            <button
              onClick={() => updateTierSettings({ isEnabled: !tierSettings.isEnabled })}
              className={cn(
                'relative w-14 h-7 rounded-full transition-colors',
                tierSettings.isEnabled ? 'bg-primary-600' : 'bg-neutral-300'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow',
                  tierSettings.isEnabled ? 'translate-x-7' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {tierSettings.isEnabled && (
            <div className="mt-6 pt-6 border-t border-neutral-200 space-y-4">
              {/* 자동 승급 */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-neutral-900">자동 등급 승급</span>
                  <p className="text-xs text-neutral-500">기준 금액 달성 시 자동으로 등급 상승</p>
                </div>
                <button
                  onClick={() => updateTierSettings({ autoUpgrade: !tierSettings.autoUpgrade })}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    tierSettings.autoUpgrade ? 'bg-primary-600' : 'bg-neutral-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow',
                      tierSettings.autoUpgrade ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* 자동 강등 */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-neutral-900">자동 등급 강등</span>
                  <p className="text-xs text-neutral-500">평가 기간 내 기준 미달 시 등급 하락</p>
                </div>
                <button
                  onClick={() => updateTierSettings({ autoDowngrade: !tierSettings.autoDowngrade })}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    tierSettings.autoDowngrade ? 'bg-primary-600' : 'bg-neutral-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow',
                      tierSettings.autoDowngrade ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* 평가 기간 */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">평가 기간</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(periodLabels) as Array<keyof typeof periodLabels>).map((period) => (
                    <button
                      key={period}
                      onClick={() => updateTierSettings({ evaluationPeriod: period })}
                      className={cn(
                        'px-4 py-2 text-sm rounded-lg border transition-colors',
                        tierSettings.evaluationPeriod === period
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                      )}
                    >
                      {periodLabels[period]}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  {tierSettings.evaluationPeriod === 'cumulative'
                    ? '가입 이후 전체 누적 구매 금액으로 등급 판정'
                    : `${periodLabels[tierSettings.evaluationPeriod]} 구매 금액으로 등급 판정`}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 등급별 기준 설정 */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900">등급별 기준 설정</h2>
            <div className="group relative">
              <Info className="w-4 h-4 text-neutral-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-neutral-800 text-white text-xs rounded-lg z-10">
                각 등급의 승급 기준 금액과 혜택을 설정합니다. 비회원(guest)은 로그인하지 않은 사용자입니다.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {tierSettings.thresholds.map((threshold) => (
              <div
                key={threshold.tier}
                className={cn(
                  'p-4 rounded-lg border-2',
                  tierSettings.isEnabled ? 'border-neutral-200' : 'border-neutral-100 opacity-60'
                )}
              >
                {/* 등급 헤더 */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={cn('px-3 py-1 rounded-lg text-sm font-bold', tierColors[threshold.tier])}>
                    {tierLabels[threshold.tier]}
                  </span>
                </div>

                {/* 설정 그리드 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* 최소 구매 금액 */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">최소 구매 금액</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={threshold.minPurchaseAmount}
                        onChange={(e) => updateTierThreshold(threshold.tier, {
                          minPurchaseAmount: parseInt(e.target.value) || 0
                        })}
                        disabled={!tierSettings.isEnabled || threshold.tier === 'member'}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg pr-8 disabled:bg-neutral-50 disabled:text-neutral-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">원</span>
                    </div>
                    {threshold.tier === 'member' && (
                      <p className="text-xs text-neutral-400 mt-1">기본 등급</p>
                    )}
                  </div>

                  {/* 할인율 */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">할인율</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={threshold.discountRate}
                        onChange={(e) => updateTierThreshold(threshold.tier, {
                          discountRate: parseInt(e.target.value) || 0
                        })}
                        disabled={!tierSettings.isEnabled}
                        min={0}
                        max={100}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg pr-8 disabled:bg-neutral-50 disabled:text-neutral-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">%</span>
                    </div>
                  </div>

                  {/* 적립률 */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">적립률</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={threshold.pointRate}
                        onChange={(e) => updateTierThreshold(threshold.tier, {
                          pointRate: parseInt(e.target.value) || 0
                        })}
                        disabled={!tierSettings.isEnabled}
                        min={0}
                        max={100}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg pr-8 disabled:bg-neutral-50 disabled:text-neutral-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">%</span>
                    </div>
                  </div>

                  {/* 무료 배송 */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">무료 배송</label>
                    <button
                      onClick={() => updateTierThreshold(threshold.tier, {
                        freeShipping: !threshold.freeShipping
                      })}
                      disabled={!tierSettings.isEnabled}
                      className={cn(
                        'w-full px-3 py-2 text-sm rounded-lg border transition-colors',
                        threshold.freeShipping
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-neutral-700 border-neutral-200',
                        !tierSettings.isEnabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {threshold.freeShipping ? '적용' : '미적용'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 미리보기 */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-4">등급 혜택 미리보기</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-medium text-neutral-600">등급</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-600">기준 금액</th>
                  <th className="text-center py-3 px-4 font-medium text-neutral-600">할인율</th>
                  <th className="text-center py-3 px-4 font-medium text-neutral-600">적립률</th>
                  <th className="text-center py-3 px-4 font-medium text-neutral-600">무료배송</th>
                </tr>
              </thead>
              <tbody>
                {tierSettings.thresholds.map((threshold) => (
                  <tr key={threshold.tier} className="border-b border-neutral-100">
                    <td className="py-3 px-4">
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', tierColors[threshold.tier])}>
                        {tierLabels[threshold.tier]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {threshold.minPurchaseAmount === 0 ? '-' : formatPrice(threshold.minPurchaseAmount) + ' 이상'}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-primary-600">
                      {threshold.discountRate}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      {threshold.pointRate}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      {threshold.freeShipping ? (
                        <span className="text-green-600">O</span>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!tierSettings.isEnabled && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                자동 등급 시스템이 비활성화되어 있습니다. 활성화하면 설정된 기준에 따라 회원 등급이 자동으로 변경됩니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
