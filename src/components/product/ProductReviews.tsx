import { useState } from 'react'
import { Star, ThumbsUp, CheckCircle, ChevronDown, ChevronUp, X, Loader2, Store } from 'lucide-react'
import { Button, Badge, Card } from '../ui'
import { cn } from '../../lib/utils'
import { useProductReviews, useCreateReview, useIncrementHelpful } from '../../hooks/queries'
import { useStore } from '../../store'

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: productReviews = [], isLoading } = useProductReviews(productId)
  const incrementHelpful = useIncrementHelpful()
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent')
  const [showWriteForm, setShowWriteForm] = useState(false)
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

  // 정렬
  const sortedReviews = [...productReviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return b.helpful - a.helpful
  })

  // 평균 별점 계산
  const averageRating = productReviews.length > 0
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : 0

  // 별점 분포
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: productReviews.filter(r => r.rating === rating).length,
    percentage: productReviews.length > 0
      ? (productReviews.filter(r => r.rating === rating).length / productReviews.length) * 100
      : 0
  }))

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedReviews(newExpanded)
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={cn(
              sizeClass,
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-neutral-200 text-neutral-200'
            )}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mt-12 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
        <p className="text-neutral-500">리뷰를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-900">
          구매 리뷰 <span className="text-primary-600">({productReviews.length})</span>
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowWriteForm(true)}
        >
          리뷰 작성
        </Button>
      </div>

      {/* 리뷰 작성 모달 */}
      {showWriteForm && (
        <ReviewWriteModal
          productId={productId}
          onClose={() => setShowWriteForm(false)}
        />
      )}

      {productReviews.length > 0 ? (
        <>
          {/* 리뷰 요약 */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* 평균 별점 */}
              <div className="text-center">
                <p className="text-4xl font-bold text-neutral-900 mb-2">
                  {averageRating.toFixed(1)}
                </p>
                {renderStars(Math.round(averageRating), 'md')}
                <p className="text-sm text-neutral-500 mt-2">
                  {productReviews.length}개의 리뷰
                </p>
              </div>

              {/* 별점 분포 */}
              <div className="flex-1 space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-neutral-600 w-8">{rating}점</span>
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-neutral-500 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 정렬 옵션 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSortBy('recent')}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                sortBy === 'recent'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              최신순
            </button>
            <button
              onClick={() => setSortBy('helpful')}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                sortBy === 'helpful'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              도움순
            </button>
          </div>

          {/* 리뷰 목록 */}
          <div className="space-y-4">
            {sortedReviews.map(review => {
              const isExpanded = expandedReviews.has(review.id)
              const isLongContent = review.content.length > 100

              return (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      {review.verified && (
                        <Badge variant="success" size="sm" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          구매인증
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500">{formatDate(review.createdAt)}</span>
                  </div>

                  <h4 className="font-medium text-neutral-900 mb-1">{review.title}</h4>

                  <p className={cn(
                    'text-sm text-neutral-600 mb-3',
                    !isExpanded && isLongContent && 'line-clamp-2'
                  )}>
                    {review.content}
                  </p>

                  {isLongContent && (
                    <button
                      onClick={() => toggleExpand(review.id)}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-3"
                    >
                      {isExpanded ? (
                        <>접기 <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>더보기 <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  )}

                  {/* 판매자 답글 */}
                  {review.adminReply && (
                    <div className="mt-4 ml-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Store className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">판매자 답글</span>
                        {review.adminReplyAt && (
                          <span className="text-xs text-blue-500">
                            {formatDate(review.adminReplyAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-blue-900 leading-relaxed">{review.adminReply}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100 mt-3">
                    <span className="text-sm text-neutral-500">{review.author}</span>
                    <button
                      onClick={() => incrementHelpful.mutate({ reviewId: review.id, productId })}
                      className="flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      도움이 돼요 ({review.helpful})
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      ) : (
        <Card className="p-12 text-center">
          <Star className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 mb-4">아직 작성된 리뷰가 없습니다.</p>
          <Button onClick={() => setShowWriteForm(true)}>
            첫 리뷰를 작성해 주세요
          </Button>
        </Card>
      )}
    </div>
  )
}

// 리뷰 작성 모달
function ReviewWriteModal({
  productId,
  onClose
}: {
  productId: string
  onClose: () => void
}) {
  const { user } = useStore()
  const createReview = useCreateReview()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    if (!content.trim()) {
      alert('내용을 입력해주세요.')
      return
    }

    createReview.mutate(
      {
        productId,
        author: user?.name || '익명',
        userId: user?.id,
        rating,
        title: title.trim(),
        content: content.trim(),
      },
      {
        onSuccess: () => {
          alert('리뷰가 등록되었습니다.')
          onClose()
        },
        onError: () => {
          alert('리뷰 등록에 실패했습니다.')
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-xl bg-white rounded-xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h3 className="text-xl font-bold text-neutral-900">리뷰 작성</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* 별점 선택 */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              별점
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      'w-9 h-9 transition-colors',
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-neutral-200 text-neutral-200'
                    )}
                  />
                </button>
              ))}
              <span className="ml-3 text-base font-medium text-neutral-600">{rating}점</span>
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="리뷰 제목을 입력하세요"
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="상품에 대한 솔직한 리뷰를 작성해 주세요"
              rows={5}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-base"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 py-3"
              disabled={createReview.isPending}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1 py-3" disabled={createReview.isPending}>
              {createReview.isPending ? '등록 중...' : '등록하기'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
