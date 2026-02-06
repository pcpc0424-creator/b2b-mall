import { supabase } from '../lib/supabase'

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
  const { data, error } = await supabase.functions.invoke('confirm-payment', {
    body: params,
  })

  if (error) {
    throw new Error(error.message || '결제 승인 요청에 실패했습니다.')
  }

  if (data.error) {
    throw new Error(data.error)
  }

  return data as ConfirmPaymentResult
}
