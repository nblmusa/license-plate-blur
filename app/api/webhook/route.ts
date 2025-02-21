import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    )
  }

  const supabase = createRouteHandlerClient({ cookies })

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata.userId

      // Update user's subscription status
      await supabase
        .from('profiles')
        .update({
          subscription_tier: 'pro',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const userId = subscription.metadata.userId

      // Reset user's subscription status
      await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      break
    }
  }

  return NextResponse.json({ received: true })
}