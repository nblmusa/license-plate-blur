import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get('Stripe-Signature');

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session?.metadata?.userId;
        const priceId = session.line_items?.data[0]?.price?.id;

        if (userId) {
          // Update user's subscription tier based on price ID
          const tier = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'pro' :
                      priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID ? 'enterprise' : 'basic';

          await supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const priceId = subscription.items.data[0].price.id;
        const currentPeriodStart = new Date(subscription.current_period_start * 1000);
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        const userId = subscription.metadata?.userId;

        // Update subscription in database
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            status,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('Failed to update subscription:', updateError);
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          );
        }

        // Update user's subscription tier if userId is available
        if (userId) {
          const tier = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'pro' :
                      priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID ? 'enterprise' : 'basic';

          await supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.userId;

        // Update subscription status to canceled
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('Failed to cancel subscription:', updateError);
          return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
          );
        }

        // Reset user's subscription tier if userId is available
        if (userId) {
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Record the invoice
        const { error: insertError } = await supabase
          .from('invoices')
          .insert([{
            stripe_invoice_id: invoice.id,
            amount_due: invoice.amount_due,
            amount_paid: invoice.amount_paid,
            status: invoice.status,
            invoice_pdf: invoice.invoice_pdf,
            created_at: new Date(invoice.created * 1000).toISOString()
          }]);

        if (insertError) {
          console.error('Failed to record invoice:', insertError);
          return NextResponse.json(
            { error: 'Failed to record invoice' },
            { status: 500 }
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.userId;

        // Update subscription status to past_due
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('Failed to update subscription status:', updateError);
          return NextResponse.json(
            { error: 'Failed to update subscription status' },
            { status: 500 }
          );
        }

        // Update user's subscription tier if userId is available
        if (userId) {
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 