import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, AlertCircle, Gift, RefreshCw, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { notices } from '../data'
import { Notice } from '../types'
import { Badge, Card } from '../components/ui'
import { Animated } from '../hooks'
import { cn } from '../lib/utils'

export function NoticePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const categoryConfig = {
    notice: { label: '공지', icon: Bell, variant: 'secondary' as const },
    event: { label: '이벤트', icon: Gift, variant: 'success' as const },
    update: { label: '업데이트', icon: RefreshCw, variant: 'primary' as const },
    important: { label: '중요', icon: AlertCircle, variant: 'error' as const },
  }

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'important', label: '중요' },
    { id: 'notice', label: '공지' },
    { id: 'event', label: '이벤트' },
    { id: 'update', label: '업데이트' },
  ]

  const filteredNotices = selectedCategory === 'all'
    ? notices
    : notices.filter(n => n.category === selectedCategory)

  // Sort: important first, then by date
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.isImportant && !b.isImportant) return -1
    if (!a.isImportant && b.isImportant) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Animated animation="fade" duration={300}>
        <nav className="text-sm text-neutral-500 mb-6 flex items-center">
          <Link to="/" className="hover:text-primary-600">홈</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-medium">공지사항</span>
        </nav>
      </Animated>

      {/* Header */}
      <Animated animation="fade-up" delay={100}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">공지사항</h1>
          <p className="text-neutral-500">서비스 이용에 관한 중요한 안내사항을 확인하세요</p>
        </div>
      </Animated>

      {/* Category Filter */}
      <Animated animation="fade-up" delay={200}>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Animated>

      {/* Notice List */}
      <Animated animation="fade-up" delay={300}>
        <Card className="overflow-hidden">
          {/* Table Header - PC only */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-medium text-neutral-500 uppercase">
            <div className="col-span-1">분류</div>
            <div className="col-span-7">제목</div>
            <div className="col-span-2 text-center">등록일</div>
            <div className="col-span-2 text-center">조회</div>
          </div>

          {/* Notice Items */}
          <div className="divide-y divide-neutral-100">
            {sortedNotices.map((notice, index) => {
              const config = categoryConfig[notice.category]
              const IconComponent = config.icon
              const isExpanded = expandedId === notice.id

              return (
                <div key={notice.id}>
                  {/* PC View */}
                  <div
                    className={cn(
                      'hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer hover:bg-neutral-50 transition-colors',
                      notice.isImportant && 'bg-red-50/50'
                    )}
                    onClick={() => toggleExpand(notice.id)}
                  >
                    <div className="col-span-1">
                      <Badge variant={config.variant} size="sm">
                        {config.label}
                      </Badge>
                    </div>
                    <div className="col-span-7 flex items-center gap-2">
                      {notice.isImportant && (
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className={cn(
                        'text-sm',
                        notice.isImportant ? 'font-bold text-neutral-900' : 'text-neutral-700'
                      )}>
                        {notice.title}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400 ml-auto" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400 ml-auto" />
                      )}
                    </div>
                    <div className="col-span-2 text-center text-sm text-neutral-500">
                      {formatDate(notice.createdAt)}
                    </div>
                    <div className="col-span-2 text-center text-sm text-neutral-500 flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" />
                      {notice.viewCount.toLocaleString()}
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div
                    className={cn(
                      'md:hidden p-4 cursor-pointer',
                      notice.isImportant && 'bg-red-50/50'
                    )}
                    onClick={() => toggleExpand(notice.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant={config.variant} size="sm" className="flex-shrink-0 mt-0.5">
                        {config.label}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {notice.isImportant && (
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                          <span className={cn(
                            'text-sm line-clamp-2',
                            notice.isImportant ? 'font-bold text-neutral-900' : 'text-neutral-700'
                          )}>
                            {notice.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                          <span>{formatDate(notice.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {notice.viewCount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-4 bg-neutral-50 border-t border-neutral-100">
                      <div className="py-4">
                        <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                          {notice.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {sortedNotices.length === 0 && (
            <div className="py-12 text-center">
              <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">등록된 공지사항이 없습니다.</p>
            </div>
          )}
        </Card>
      </Animated>
    </div>
  )
}
