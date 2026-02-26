import { useState } from 'react'
import { Search, Star, MessageCircle, Trash2, Loader2, X } from 'lucide-react'
import { useAllReviews, useDeleteReview, useReplyToReview, useDeleteReviewReply, useProducts } from '../../hooks/queries'
import { Button, Card, Badge } from '../../components/ui'
import { cn } from '../../lib/utils'
import type { Review } from '../../types'

export function ReviewManagementPage() {
  const { data: reviews = [], isLoading } = useAllReviews()
  const { data: products = [] } = useProducts()
  const deleteMutation = useDeleteReview()
  const replyMutation = useReplyToReview()
  const deleteReplyMutation = useDeleteReviewReply()

  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all')
  const [replyFilter, setReplyFilter] = useState<'all' | 'replied' | 'not_replied'>('all')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState('')

  // 상품 ID로 상품명 찾기
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product?.name || '상품 없음'
  }

  const getProductImage = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product?.images?.[0]
  }

  // 통계
  const repliedCount = reviews.filter(r => r.adminReply).length
  const notRepliedCount = reviews.filter(r => !r.adminReply).length
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  // 필터링
  const filteredReviews = reviews.filter(review => {
    const productName = getProductName(review.productId)
    const matchesSearch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter)
    const matchesReply =
      replyFilter === 'all' ||
      (replyFilter === 'replied' && review.adminReply) ||
      (replyFilter === 'not_replied' && !review.adminReply)
    return matchesSearch && matchesRating && matchesReply
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-3 h-3',
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'
            )}
          />
        ))}
      </div>
    )
  }

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) {
      alert('답글 내용을 입력해주세요.')
      return
    }
    try {
      await replyMutation.mutateAsync({ reviewId: selectedReview.id, reply: replyText.trim() })
      setSelectedReview(null)
      setReplyText('')
      alert('답글이 등록되었습니다.')
    } catch {
      alert('답글 등록에 실패했습니다.')
    }
  }

  const handleDeleteReply = async (reviewId: string) => {
    if (!confirm('답글을 삭제하시겠습니까?')) return
    try {
      await deleteReplyMutation.mutateAsync(reviewId)
      alert('답글이 삭제되었습니다.')
    } catch {
      alert('답글 삭제에 실패했습니다.')
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('이 리뷰를 삭제하시겠습니까?')) return
    try {
      await deleteMutation.mutateAsync(reviewId)
      alert('삭제되었습니다.')
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  const openReplyModal = (review: Review) => {
    setSelectedReview(review)
    setReplyText(review.adminReply || '')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-neutral-900">리뷰 관리</h1>
          <span className="text-sm text-neutral-500">{filteredReviews.length}건</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-yellow-600">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            평균 {avgRating}점
          </span>
          <span className="flex items-center gap-1 text-green-600">
            <MessageCircle className="w-4 h-4" />
            답글 {repliedCount}건
          </span>
          <span className="flex items-center gap-1 text-neutral-500">
            미답글 {notRepliedCount}건
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="상품명, 리뷰내용, 작성자 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value as typeof ratingFilter)}
          className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
        >
          <option value="all">전체 별점</option>
          <option value="5">5점</option>
          <option value="4">4점</option>
          <option value="3">3점</option>
          <option value="2">2점</option>
          <option value="1">1점</option>
        </select>
        <div className="flex gap-2">
          {[
            { id: 'all', label: '전체' },
            { id: 'not_replied', label: '미답글' },
            { id: 'replied', label: '답글완료' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setReplyFilter(f.id as typeof replyFilter)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                replyFilter === f.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Review List */}
      <Card>
        <div className="divide-y divide-neutral-100">
          {filteredReviews.map((review) => (
            <div key={review.id} className="p-4">
              <div className="flex gap-4">
                {/* 상품 이미지 */}
                {getProductImage(review.productId) && (
                  <img
                    src={getProductImage(review.productId)}
                    alt={getProductName(review.productId)}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(review.rating)}
                    {review.verified && (
                      <Badge variant="success" size="sm">구매인증</Badge>
                    )}
                    {review.adminReply && (
                      <Badge variant="primary" size="sm">답글완료</Badge>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 mb-1">{getProductName(review.productId)}</p>
                  {review.title && (
                    <p className="text-sm font-medium text-neutral-900 mb-1">{review.title}</p>
                  )}
                  <p className="text-sm text-neutral-700 mb-2">{review.content}</p>

                  {/* 리뷰 이미지 */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`리뷰 이미지 ${idx + 1}`}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span>{review.author}</span>
                    <span>{formatDate(review.createdAt)}</span>
                    <span>도움이 돼요 {review.helpful}</span>
                  </div>

                  {/* 관리자 답글 */}
                  {review.adminReply && (
                    <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-primary-700">판매자 답글</p>
                        <button
                          onClick={() => handleDeleteReply(review.id)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          삭제
                        </button>
                      </div>
                      <p className="text-sm text-neutral-700">{review.adminReply}</p>
                      {review.adminReplyAt && (
                        <p className="text-xs text-neutral-500 mt-1">{formatDate(review.adminReplyAt)}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant={review.adminReply ? 'secondary' : 'primary'}
                    onClick={() => openReplyModal(review)}
                  >
                    {review.adminReply ? '수정' : '답글'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(review.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="py-12 text-center">
              <Star className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">리뷰가 없습니다.</p>
            </div>
          )}
        </div>
      </Card>

      {/* 답글 모달 */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedReview(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">답글 작성</h2>
              <button onClick={() => setSelectedReview(null)} className="p-1 hover:bg-neutral-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* 리뷰 내용 */}
              <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-sm text-neutral-500">{selectedReview.author}</span>
                </div>
                <p className="text-xs text-neutral-500 mb-1">{getProductName(selectedReview.productId)}</p>
                <p className="text-sm text-neutral-700">{selectedReview.content}</p>
              </div>

              {/* 답글 입력 */}
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="답글을 입력하세요"
                rows={5}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setSelectedReview(null)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleReply}
                disabled={replyMutation.isPending}
                className="flex-1"
              >
                {replyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    저장 중...
                  </>
                ) : (
                  '답글 저장'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
