import { createServiceClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const relevantEvents = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
])

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (relevantEvents.has(event.type)) {
    try {
      const supabase = createServiceClient()
      const subscription = event.data.object as Stripe.Subscription

      // Get customer email from Stripe
      const customer = await stripe.customers.retrieve(subscription.customer as string)
      const customerEmail = customer.email!

      // Get user by email
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', customerEmail)
        .single()

      if (!userData?.id) {
        throw new Error('User not found')
      }

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: userData.id,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
              stripe_price_id: subscription.items.data[0].price.id,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end
            })
          break

        case 'customer.subscription.deleted':
          await supabase
            .from('user_subscriptions')
            .delete()
            .eq('stripe_subscription_id', subscription.id)
          break
      }

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error('Webhook handler failed:', error)
      return NextResponse.json(
        { error: 'Webhook handler failed' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
} 