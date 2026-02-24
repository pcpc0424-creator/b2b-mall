const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

interface ConfirmPaymentParams {
  paymentKey: string
  orderId: string
  amount: number
}

interface ConfirmPaymentResult {
  success: boolean
  payment?: {
    paymentKey: string
    orderId: string
    status: string
    totalAmount: number
    method: string
    approvedAt: string
    receipt?: string
  }
  error?: string
  code?: string
}

/** 토스페이먼츠 결제 승인 (Supabase Edge Function 경유) */
export async function confirmPayment(params: ConfirmPaymentParams): Promise<ConfirmPaymentResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30초 타임아웃

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const data = await response.json()

    if (!response.ok) {
      console.error('결제 승인 실패:', data)
      throw new Error(data.error || '결제 승인에 실패했습니다.')
    }

    if (data.error) {
      throw new Error(data.error)
    }

    return data as ConfirmPaymentResult
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('결제 승인 요청 시간이 초과되었습니다. 다시 시도해주세요.')
    }
    throw err
  }
}

interface CancelPaymentParams {
  paymentKey: string
  cancelReason?: string
  cancelAmount?: number // 부분 취소 시 금액
}

interface CancelPaymentResult {
  success: boolean
  status: string
  totalAmount: number
  balanceAmount: number
  canceledAmount: number
  error?: string
  code?: string
}

/** 토스페이먼츠 결제 취소/환불 (Supabase Edge Function 경유) */
export async function cancelPayment(params: CancelPaymentParams): Promise<CancelPaymentResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/cancel-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const data = await response.json()

    if (!response.ok) {
      console.error('결제 취소 실패:', data)
      throw new Error(data.error || '결제 취소에 실패했습니다.')
    }

    if (data.error) {
      throw new Error(data.error)
    }

    return data as CancelPaymentResult
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('결제 취소 요청 시간이 초과되었습니다. 다시 시도해주세요.')
    }
    throw err
  }
}
