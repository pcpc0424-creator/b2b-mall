import { useState } from 'react'
import { Download, Calendar, TrendingUp, TrendingDown, Filter } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useStore } from '../store'
import { mockSalesData, products, categories } from '../data'
import { Button, Card, CardContent, Select, Badge, Tabs } from '../components/ui'
import { formatPrice, formatNumber, cn } from '../lib/utils'
import { Animated } from '../hooks'

export function AnalyticsPage() {
  const { user } = useStore()
  const [period, setPeriod] = useState('month')
  const [selectedCategory, setSelectedCategory] = useState('all')

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">로그인이 필요합니다</h1>
        <Button>로그인</Button>
      </div>
    )
  }

  // Generate category sales data
  const categorySalesData = categories.map((cat) => ({
    name: cat.name,
    value: Math.floor(Math.random() * 30000000) + 5000000,
    fill: `hsl(${cat.id * 45}, 70%, 50%)`,
  }))

  // Generate product sales data
  const productSalesData = products.slice(0, 10).map((p) => ({
    name: p.name.slice(0, 10) + '...',
    fullName: p.name,
    sku: p.sku,
    quantity: Math.floor(Math.random() * 500) + 50,
    amount: Math.floor(Math.random() * 5000000) + 500000,
  }))

  const totalAmount = mockSalesData.reduce((sum, d) => sum + d.amount, 0)
  const totalOrders = mockSalesData.reduce((sum, d) => sum + d.orders, 0)
  const avgOrderValue = Math.round(totalAmount / totalOrders)

  const lastMonthAmount = mockSalesData[mockSalesData.length - 2]?.amount || 0
  const currentMonthAmount = mockSalesData[mockSalesData.length - 1]?.amount || 0
  const growthPercent = lastMonthAmount > 0 ? Math.round(((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100) : 0

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <Animated animation="fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">매출 분석</h1>
          <p className="text-neutral-500 mt-1">주문 데이터 기반 매출 분석 리포트</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: 'week', label: '최근 1주' },
              { value: 'month', label: '최근 1개월' },
              { value: 'quarter', label: '최근 3개월' },
              { value: 'year', label: '최근 1년' },
            ]}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-32"
          />
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            리포트 다운로드
          </Button>
        </div>
      </div>
      </Animated>

      {/* Summary Cards */}
      <Animated animation="fade-up" delay={100}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-neutral-500 mb-1">총 주문금액</p>
            <p className="text-2xl font-bold text-neutral-900">{formatPrice(totalAmount)}</p>
            <div className={cn(
              'flex items-center gap-1 text-sm mt-2',
              growthPercent >= 0 ? 'text-success' : 'text-error'
            )}>
              {growthPercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              전월 대비 {growthPercent}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-neutral-500 mb-1">총 주문건수</p>
            <p className="text-2xl font-bold text-neutral-900">{formatNumber(totalOrders)}건</p>
            <p className="text-sm text-neutral-400 mt-2">월 평균 {Math.round(totalOrders / 6)}건</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-neutral-500 mb-1">평균 주문금액</p>
            <p className="text-2xl font-bold text-neutral-900">{formatPrice(avgOrderValue)}</p>
            <p className="text-sm text-neutral-400 mt-2">건당 평균</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-neutral-500 mb-1">주문 상품 수</p>
            <p className="text-2xl font-bold text-neutral-900">{formatNumber(productSalesData.reduce((s, p) => s + p.quantity, 0))}개</p>
            <p className="text-sm text-neutral-400 mt-2">총 주문 수량</p>
          </CardContent>
        </Card>
      </div>
      </Animated>

      <Animated animation="fade-up" delay={200}>
      <Tabs
        tabs={[
          {
            id: 'overview',
            label: '매출 추이',
            content: (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Trend Chart */}
                <Card className="lg:col-span-2">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-neutral-900 mb-6">기간별 매출 추이</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockSalesData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                          <YAxis
                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                            tick={{ fontSize: 12 }}
                            stroke="#6B7280"
                          />
                          <Tooltip
                            formatter={(value, name) => [
                              name === 'amount' ? formatPrice(Number(value)) : `${value}건`,
                              name === 'amount' ? '매출' : '주문수'
                            ]}
                            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="amount"
                            name="매출"
                            stroke="#2563EB"
                            strokeWidth={2}
                            dot={{ fill: '#2563EB', r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="orders"
                            name="주문수"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{ fill: '#10B981', r: 4 }}
                            yAxisId={0}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-neutral-900 mb-6">카테고리별 매출</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categorySalesData.slice(0, 5)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {categorySalesData.slice(0, 5).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => formatPrice(Number(value))}
                            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {categorySalesData.slice(0, 5).map((cat, index) => (
                        <div key={cat.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-neutral-600">{cat.name}</span>
                          </div>
                          <span className="font-medium">{formatPrice(cat.value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ),
          },
          {
            id: 'products',
            label: '상품별 분석',
            content: (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-neutral-900">상품별 구매 분석</h3>
                    <div className="flex items-center gap-3">
                      <Select
                        options={[
                          { value: 'all', label: '전체 카테고리' },
                          ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
                        ]}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-40"
                      />
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productSalesData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value) => formatPrice(Number(value))}
                          contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
                        />
                        <Bar dataKey="amount" fill="#2563EB" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-neutral-500">순위</th>
                          <th className="px-4 py-3 text-left font-medium text-neutral-500">SKU</th>
                          <th className="px-4 py-3 text-left font-medium text-neutral-500">상품명</th>
                          <th className="px-4 py-3 text-right font-medium text-neutral-500">주문수량</th>
                          <th className="px-4 py-3 text-right font-medium text-neutral-500">매출금액</th>
                          <th className="px-4 py-3 text-right font-medium text-neutral-500">비중</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {productSalesData.map((product, index) => {
                          const totalSales = productSalesData.reduce((s, p) => s + p.amount, 0)
                          const percentage = ((product.amount / totalSales) * 100).toFixed(1)
                          return (
                            <tr key={product.sku} className="hover:bg-neutral-50">
                              <td className="px-4 py-3">
                                <span className={cn(
                                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                                  index < 3 ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'
                                )}>
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                              <td className="px-4 py-3">{product.fullName}</td>
                              <td className="px-4 py-3 text-right">{formatNumber(product.quantity)}개</td>
                              <td className="px-4 py-3 text-right font-medium">{formatPrice(product.amount)}</td>
                              <td className="px-4 py-3 text-right">
                                <Badge variant={parseFloat(percentage) >= 10 ? 'primary' : 'default'} size="sm">
                                  {percentage}%
                                </Badge>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ),
          },
          {
            id: 'report',
            label: '리포트 다운로드',
            content: (
              <Card>
                <CardContent className="p-8">
                  <div className="max-w-lg mx-auto text-center">
                    <Calendar className="w-12 h-12 mx-auto text-primary-600 mb-4" />
                    <h3 className="font-bold text-neutral-900 mb-2">리포트 다운로드</h3>
                    <p className="text-neutral-500 mb-6">원하는 기간과 형식을 선택하여 리포트를 다운로드하세요</p>

                    <div className="space-y-4 text-left">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">기간 선택</label>
                        <Select
                          options={[
                            { value: 'this_month', label: '이번 달' },
                            { value: 'last_month', label: '지난 달' },
                            { value: 'this_quarter', label: '이번 분기' },
                            { value: 'last_quarter', label: '지난 분기' },
                            { value: 'this_year', label: '올해' },
                            { value: 'custom', label: '기간 직접 선택' },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">리포트 유형</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button className="p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
                            <span className="font-medium text-neutral-900">매출 요약</span>
                            <p className="text-xs text-neutral-500 mt-1">기간별 매출/주문 요약</p>
                          </button>
                          <button className="p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
                            <span className="font-medium text-neutral-900">상품별 상세</span>
                            <p className="text-xs text-neutral-500 mt-1">상품별 판매 분석</p>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">파일 형식</label>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1">
                            PDF
                          </Button>
                          <Button variant="outline" className="flex-1">
                            CSV
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Excel
                          </Button>
                        </div>
                      </div>

                      <Button className="w-full mt-4">
                        <Download className="w-4 h-4 mr-2" />
                        리포트 다운로드
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
          },
        ]}
      />
      </Animated>
    </div>
  )
}
