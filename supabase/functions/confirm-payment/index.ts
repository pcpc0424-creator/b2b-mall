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
    const { paymentKey, orderId, amount } = await req.json()

    if (!paymentKey || !orderId || !amount) {
      return new Response(
        JSON.stringify({ error: '필수 파라미터가 누락되었습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 토스페이먼츠 결제 승인 API 호출
    const encryptedSecretKey = btoa(`${TOSS_SECRET_KEY}:`)

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.message || '결제 승인에 실패했습니다.',
          code: data.code,
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 결제 승인 성공
    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          paymentKey: data.paymentKey,
          orderId: data.orderId,
          status: data.status,
          totalAmount: data.totalAmount,
          method: data.method,
          approvedAt: data.approvedAt,
          receipt: data.receipt?.url,
        },
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
