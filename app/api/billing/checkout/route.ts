import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PLANS } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get plan and return URL from request
    const { planId, returnUrl } = await request.json();
    const plan = PLANS[planId.toUpperCase()];

    if (!plan || !plan.priceId || plan.priceId === 'free') {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Validate and construct return URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL must be set');
    }

    // Construct success and cancel URLs with proper encoding
    const successUrl = new URL('/dashboard', baseUrl);
    successUrl.searchParams.set('subscription', 'success');
    if (returnUrl) {
      successUrl.searchParams.set('returnTo', returnUrl);
    }

    const cancelUrl = new URL('/dashboard', baseUrl);
    cancelUrl.searchParams.set('subscription', 'cancelled');
    if (returnUrl) {
      cancelUrl.searchParams.set('returnTo', returnUrl);
    }

    // Check if user already has a Stripe customer ID
    let { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // If no customer ID exists, create a new customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          user_id: session.user.id
        }
      });
      customerId = customer.id;
      console.log('created new customer id', customerId);
    }

    console.log('customer id: ', customerId);

    // Create checkout session with properly encoded URLs
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: plan.priceId,
        quantity: 1,
      }],
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      subscription_data: {
        metadata: {
          user_id: session.user.id,
          plan_id: planId
        },
        // trial_period_days: 14
      },
      metadata: {
        user_id: session.user.id,
        plan_id: planId,
        return_url: returnUrl || ''
      }
    });

    if (!checkoutSession.url) {
      throw new Error('Failed to create checkout session');
    }

    // If this is a new customer, create initial subscription record
    if (!subscription) {
      console.log('subscription data ', {
        user_id: session.user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: 'pending_' + checkoutSession.id, // Temporary ID until subscription is created
        stripe_price_id: plan.priceId,
        plan_id: planId,
        status: 'incomplete',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      const { error: dbError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: session.user.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: 'pending_' + checkoutSession.id, // Temporary ID until subscription is created
          stripe_price_id: plan.priceId,
          plan_id: planId,
          status: 'incomplete',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (dbError) {
        console.error('Failed to create subscription record:', dbError);
      }
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 