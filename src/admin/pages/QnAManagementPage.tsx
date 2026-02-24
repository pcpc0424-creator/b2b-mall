import { useState } from 'react'
import { Search, MessageCircle, CheckCircle, Clock, Lock, Trash2, Loader2 } from 'lucide-react'
import { useQnAs, useAnswerQnA, useDeleteQnA } from '../../hooks/queries'
import { Button, Card, Badge } from '../../components/ui'
import { cn } from '../../lib/utils'

export function QnAManagementPage() {
  const { data: qnas = [], isLoading } = useQnAs()
  const answerMutation = useAnswerQnA()
  const deleteMutation = useDeleteQnA()

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'waiting' | 'answered'>('all')
  const [selectedQnA, setSelectedQnA] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')

  // 통계
  const waitingCount = qnas.filter(q => !q.isAnswered).length
  const answeredCount = qnas.filter(q => q.isAnswered).length

  // 필터링
  const filteredQnAs = qnas.filter(qna => {
    const matchesSearch =
      qna.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qna.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qna.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filter === 'all' ||
      (filter === 'waiting' && !qna.isAnswered) ||
      (filter === 'answered' && qna.isAnswered)
    return matchesSearch && matchesFilter
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

  const handleAnswer = async (id: string) => {
    if (!answerText.trim()) {
      alert('답변 내용을 입력해주세요.')
      return
    }
    try {
      await answerMutation.mutateAsync({ id, answer: answerText.trim() })
      setSelectedQnA(null)
      setAnswerText('')
      alert('답변이 등록되었습니다.')
    } catch {
      alert('답변 등록에 실패했습니다.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 문의를 삭제하시겠습니까?')) return
    try {
      await deleteMutation.mutateAsync(id)
      alert('삭제되었습니다.')
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  const openAnswerModal = (qna: typeof qnas[0]) => {
    setSelectedQnA(qna.id)
    setAnswerText(qna.answer || '')
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
          <h1 className="text-lg font-bold text-neutral-900">Q&A 관리</h1>
          <span className="text-sm text-neutral-500">{filteredQnAs.length}건</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1 text-amber-600">
            <Clock className="w-4 h-4" />
            답변대기 {waitingCount}건
          </span>
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            답변완료 {answeredCount}건
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="상품명, 문의내용, 작성자 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {[
            { id: 'all', label: '전체' },
            { id: 'waiting', label: '답변대기' },
            { id: 'answered', label: '답변완료' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as 'all' | 'waiting' | 'answered')}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === f.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Q&A List */}
      <Card>
        <div className="divide-y divide-neutral-100">
          {filteredQnAs.map((qna) => (
            <div key={qna.id} className="p-4">
              <div className="flex gap-4">
                {/* 상품 이미지 */}
                {qna.productImage && (
                  <img
                    src={qna.productImage}
                    alt={qna.productName}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={qna.isAnswered ? 'success' : 'warning'}
                      size="sm"
                    >
                      {qna.isAnswered ? '답변완료' : '답변대기'}
                    </Badge>
                    {qna.isPrivate && (
                      <Badge variant="secondary" size="sm" className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        비공개
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 mb-1">{qna.productName}</p>
                  <p className="text-sm text-neutral-900 mb-2">{qna.question}</p>

                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span>{qna.author}</span>
                    <span>{formatDate(qna.createdAt)}</span>
                  </div>

                  {/* 기존 답변 */}
                  {qna.answer && (
                    <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                      <p className="text-xs font-medium text-primary-700 mb-1">판매자 답변</p>
                      <p className="text-sm text-neutral-700">{qna.answer}</p>
                      {qna.answeredAt && (
                        <p className="text-xs text-neutral-500 mt-1">{formatDate(qna.answeredAt)}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant={qna.isAnswered ? 'secondary' : 'primary'}
                    onClick={() => openAnswerModal(qna)}
                  >
                    {qna.isAnswered ? '수정' : '답변'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(qna.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredQnAs.length === 0 && (
            <div className="py-12 text-center">
              <MessageCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">문의가 없습니다.</p>
            </div>
          )}
        </div>
      </Card>

      {/* 답변 모달 */}
      {selectedQnA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedQnA(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">답변 작성</h2>
            </div>

            <div className="p-6">
              {/* 문의 내용 */}
              <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-700">
                  {qnas.find(q => q.id === selectedQnA)?.question}
                </p>
              </div>

              {/* 답변 입력 */}
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="답변을 입력하세요"
                rows={5}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setSelectedQnA(null)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={() => handleAnswer(selectedQnA)}
                disabled={answerMutation.isPending}
                className="flex-1"
              >
                {answerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    저장 중...
                  </>
                ) : (
                  '답변 저장'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
