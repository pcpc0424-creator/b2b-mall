import { useState } from 'react'
import { Save, Truck, Package, MapPin, Plus, Trash2 } from 'lucide-react'
import { useAdminStore } from '../store/adminStore'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import { formatPrice, cn } from '../../lib/utils'
import { ShippingTier, RegionalShipping } from '../types/admin'

export function ShippingSettingsPage() {
  const { shippingSettings, updateShippingSettings } = useAdminStore()
  const [activeTab, setActiveTab] = useState<'global' | 'tiered' | 'regional'>('global')
  const [isSaving, setIsSaving] = useState(false)

  // 로컬 상태
  const [baseFee, setBaseFee] = useState(shippingSettings?.baseFee || 3000)
  const [freeThreshold, setFreeThreshold] = useState(shippingSettings?.freeShippingThreshold || 50000)
  const [enableFreeShipping, setEnableFreeShipping] = useState(!!shippingSettings?.freeShippingThreshold)
  const [tiers, setTiers] = useState<ShippingTier[]>(shippingSettings?.tiers || [])
  const [regions, setRegions] = useState<RegionalShipping[]>(shippingSettings?.regions || [])

  // 저장
  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    updateShippingSettings({
      baseFee,
      freeShippingThreshold: enableFreeShipping ? freeThreshold : undefined,
      tiers,
      regions,
    })

    setIsSaving(false)
    alert('저장되었습니다.')
  }

  // 구간 추가
  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1]
    const newTier: ShippingTier = {
      id: `tier_${Date.now()}`,
      minAmount: lastTier ? lastTier.maxAmount + 1 : 0,
      maxAmount: lastTier ? lastTier.maxAmount + 50000 : 50000,
      fee: 3000,
    }
    setTiers([...tiers, newTier])
  }

  // 구간 삭제
  const handleRemoveTier = (tierId: string) => {
    setTiers(tiers.filter(t => t.id !== tierId))
  }

  // 구간 수정
  const handleUpdateTier = (tierId: string, field: keyof ShippingTier, value: number) => {
    setTiers(tiers.map(t =>
      t.id === tierId ? { ...t, [field]: value } : t
    ))
  }

  // 지역 배송비 수정
  const handleUpdateRegion = (regionId: string, fee: number) => {
    setRegions(regions.map(r =>
      r.id === regionId ? { ...r, fee } : r
    ))
  }

  const tabs = [
    { id: 'global', label: '기본 설정', icon: Truck },
    { id: 'tiered', label: '구간별', icon: Package },
    { id: 'regional', label: '지역별', icon: MapPin },
  ] as const

  return (
    <div className="space-y-4">
      {/* Header - 한 줄 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">배송비 설정</h1>
      </div>

      {/* Tabs - 한 줄 */}
      <div className="flex gap-1 border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2',
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-500'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'global' && (
        <Card>
          <CardContent className="p-3 space-y-3 overflow-hidden">
            {/* 기본 배송비 */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-neutral-700">기본 배송비</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={baseFee}
                  onChange={(e) => setBaseFee(parseInt(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  className="w-24 px-2 py-1.5 text-sm border border-neutral-200 rounded text-right"
                />
                <span className="text-xs text-neutral-500">원</span>
              </div>
            </div>

            {/* 무료배송 토글 */}
            <div className="flex items-center justify-between gap-2 p-2 bg-neutral-50 rounded-lg">
              <span className="text-sm text-neutral-900">무료배송</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={enableFreeShipping} onChange={(e) => setEnableFreeShipping(e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-5 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* 무료배송 기준금액 */}
            {enableFreeShipping && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-neutral-700">기준금액</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={freeThreshold}
                    onChange={(e) => setFreeThreshold(parseInt(e.target.value) || 0)}
                    onFocus={(e) => e.target.select()}
                    className="w-24 px-2 py-1.5 text-sm border border-neutral-200 rounded text-right"
                  />
                  <span className="text-xs text-neutral-500">원↑</span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                <Save className="w-4 h-4 mr-1" />{isSaving ? '저장...' : '저장'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tiered' && (
        <Card>
          <CardContent className="p-3 space-y-3 overflow-hidden">
            {/* 설명 */}
            <div className="p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 주문 금액에 따라 다른 배송비를 적용합니다.
              </p>
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-900">배송비 구간</span>
              <Button variant="outline" size="sm" onClick={handleAddTier}>
                <Plus className="w-4 h-4 mr-1" />추가
              </Button>
            </div>

            {/* 구간 목록 */}
            <div className="space-y-3">
              {tiers.map((tier, index) => (
                <div key={tier.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="primary" size="sm">구간 {index + 1}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveTier(tier.id)} disabled={tiers.length <= 1} className="p-1 text-neutral-400 hover:text-error">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* 주문금액 범위 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-neutral-500 w-16">주문금액</span>
                    <input
                      type="number"
                      value={tier.minAmount}
                      onChange={(e) => handleUpdateTier(tier.id, 'minAmount', parseInt(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-24 px-2 py-1.5 border border-neutral-200 rounded text-right text-sm"
                    />
                    <span className="text-xs text-neutral-500">원 ~</span>
                    <input
                      type="number"
                      value={tier.maxAmount}
                      onChange={(e) => handleUpdateTier(tier.id, 'maxAmount', parseInt(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-24 px-2 py-1.5 border border-neutral-200 rounded text-right text-sm"
                    />
                    <span className="text-xs text-neutral-500">원</span>
                  </div>

                  {/* 배송비 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 w-16">배송비</span>
                    <input
                      type="number"
                      value={tier.fee}
                      onChange={(e) => handleUpdateTier(tier.id, 'fee', parseInt(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-24 px-2 py-1.5 border border-neutral-200 rounded text-right text-sm"
                    />
                    <span className="text-xs text-neutral-500">원</span>
                    {tier.fee === 0 && <Badge variant="success" size="sm">무료</Badge>}
                  </div>
                </div>
              ))}
            </div>

            {tiers.length === 0 && (
              <div className="text-center py-8 text-neutral-500 text-sm border-2 border-dashed border-neutral-200 rounded-lg">
                <Package className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                구간을 추가해주세요.
              </div>
            )}

            {/* 미리보기 */}
            {tiers.length > 0 && (
              <div className="p-3 bg-neutral-100 rounded-lg">
                <span className="text-xs font-medium text-neutral-700 block mb-2">적용 예시</span>
                <div className="space-y-1">
                  {tiers.map((tier) => (
                    <p key={tier.id} className="text-xs text-neutral-600">
                      • {formatPrice(tier.minAmount)} ~ {formatPrice(tier.maxAmount)} 주문 시 →
                      <span className="font-medium text-primary-600 ml-1">
                        {tier.fee === 0 ? '무료배송' : `배송비 ${formatPrice(tier.fee)}`}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                <Save className="w-4 h-4 mr-1" />{isSaving ? '저장...' : '저장'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'regional' && (
        <Card>
          <CardContent className="p-3 space-y-3 overflow-hidden">
            <span className="text-sm text-neutral-900">지역별 배송비</span>

            <div className="space-y-2">
              {regions.map((region) => (
                <div key={region.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-900">{region.region}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={region.fee}
                      onChange={(e) => handleUpdateRegion(region.id, parseInt(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-20 px-2 py-1 text-sm border border-neutral-200 rounded text-right"
                    />
                    <span className="text-xs text-neutral-500">원</span>
                  </div>
                </div>
              ))}
            </div>

            {regions.length === 0 && (
              <div className="text-center py-6 text-neutral-500 text-sm">지역별 배송비가 없습니다.</div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                <Save className="w-4 h-4 mr-1" />{isSaving ? '저장...' : '저장'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
