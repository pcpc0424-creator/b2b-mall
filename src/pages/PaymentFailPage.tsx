import { useSearchParams, Link } from 'react-router-dom'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button, Card } from '../components/ui'

export function PaymentFailPage() {
  const [searchParams] = useSearchParams()
  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message')

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <Card className="p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          결제에 실패했습니다
        </h1>
        <p className="text-neutral-500 mb-4">
          결제 처리 중 문제가 발생했습니다
        </p>

        {(errorCode || errorMessage) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
            <div className="space-y-2 text-sm">
              {errorCode && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">에러 코드</span>
                  <span className="font-mono text-red-600">{errorCode}</span>
                </div>
              )}
              {errorMessage && (
                <div>
                  <span className="text-neutral-500">에러 메시지</span>
                  <p className="mt-1 text-red-600">{decodeURIComponent(errorMessage)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link to="/cart" className="block">
            <Button className="w-full">
              <RefreshCw className="w-5 h-5 mr-2" />
              다시 시도하기
            </Button>
          </Link>
          <Link to="/products" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              쇼핑 계속하기
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
