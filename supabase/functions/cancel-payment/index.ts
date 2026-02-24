import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TOSS_SECRET_KEY = Deno.env.get('TOSS_SECRET_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { paymentKey, cancelReason, cancelAmount } = await req.json()

    if (!paymentKey) {
      return new Response(
        JSON.stringify({ error: 'paymentKey는 필수입니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 토스페이먼츠 결제 취소 API 호출
    const encryptedSecretKey = btoa(`${TOSS_SECRET_KEY}:`)

    const body: Record<string, unknown> = {
      cancelReason: cancelReason || '고객 요청에 의한 취소',
    }

    // 부분 취소인 경우 금액 포함
    if (cancelAmount) {
      body.cancelAmount = cancelAmount
    }

    const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.message || '결제 취소에 실패했습니다.',
          code: data.code,
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 결제 취소 성공
    return new Response(
      JSON.stringify({
        success: true,
        cancels: data.cancels,
        status: data.status,
        totalAmount: data.totalAmount,
        balanceAmount: data.balanceAmount,
        canceledAmount: data.cancels?.reduce((sum: number, c: { cancelAmount: number }) => sum + c.cancelAmount, 0) || 0,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
