import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    if (!webhookSecret) {
      console.error('Missing webhook secret');
      return NextResponse.json(
        { error: 'Missing webhook secret' },
        { status: 400 }
      );
    }

    const signature = headers().get('stripe-signature');
    if (!signature) {
      console.error('Missing stripe signature');
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    // Get the raw body
    const rawBody = await request.text();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
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

    const supabase = createServiceClient();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('checkout.session.completed');
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('session', session);
        
        // Get the price ID from the session's line items
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;
        const userId = session.metadata?.user_id;

        console.log('userId', userId);
        console.log('priceId', priceId);

        // We'll let the subscription.created event handle the tier update
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        console.log('customer.subscription.updated');
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const priceId = subscription.items.data[0].price.id;
        const currentPeriodStart = new Date(subscription.current_period_start * 1000);
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        let userId = subscription.metadata?.user_id;

        console.log('Processing subscription update:', {
          customerId,
          status,
          priceId,
          userId
        });

        if (!userId) {
          // Try to find userId from customer metadata
          const customer = await stripe.customers.retrieve(customerId);
          console.log('Retrieved customer:', customer);
          if ('metadata' in customer && customer.metadata?.user_id) {
            userId = customer.metadata.user_id;
            console.log('Found userId in customer metadata:', userId);
          }
        }

        if (userId) {
          // Calculate tier first
          const tier = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'pro' :
                      priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID ? 'enterprise' : 'basic';
          
          console.log('Calculated tier:', {
            tier,
            priceId,
            STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
            STRIPE_ENTERPRISE_PRICE_ID: process.env.STRIPE_ENTERPRISE_PRICE_ID
          });

          // Update subscription in database
          const { error: updateError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: customerId,
              stripe_price_id: priceId,
              plan_id: tier,
              status,
              current_period_start: currentPeriodStart,
              current_period_end: currentPeriodEnd,
              cancel_at_period_end: subscription.cancel_at_period_end,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
              quantity: subscription.items.data[0].quantity || 1,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'stripe_customer_id',
              ignoreDuplicates: false
            });

          if (updateError) {
            console.error('Failed to update subscription:', updateError);
          } else {
            console.log('Successfully updated subscription');
            
            // Only update the profile tier if the subscription is active
            if (status === 'active' || status === 'trialing') {
              console.log('Updating profile tier to:', tier);
              
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .update({
                  subscription_tier: tier,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', userId)
                .select()
                .single();

              if (profileError) {
                console.error('Failed to update profile tier:', profileError);
              } else {
                console.log('Successfully updated profile:', profile);
              }
            } else {
              console.log('Skipping profile update, subscription status:', status);
            }
          }
        } else {
          console.error('No userId found for subscription');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          // Update subscription status to canceled
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .match({ user_id: userId, stripe_customer_id: customerId });

          if (updateError) {
            console.error('Failed to cancel subscription:', updateError);
          }

          // Reset user's subscription tier
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

      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        let userId: string | undefined;

        // Try to get userId from subscription metadata
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          userId = subscription.metadata?.user_id;
        }

        // If not found, try to get from customer metadata
        if (!userId) {
          const customer = await stripe.customers.retrieve(customerId);
          if ('metadata' in customer && customer.metadata?.user_id) {
            userId = customer.metadata.user_id;
          }
        }

        if (userId) {
          // Record the invoice
          const { error: insertError } = await supabase
            .from('invoices')
            .upsert([{
              user_id: userId,
              stripe_invoice_id: invoice.id,
              stripe_customer_id: customerId,
              amount_due: invoice.amount_due,
              amount_paid: invoice.amount_paid,
              status: invoice.status,
              invoice_pdf: invoice.invoice_pdf,
              created_at: new Date(invoice.created * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }], {
              onConflict: 'stripe_invoice_id',
              ignoreDuplicates: false
            });

          if (insertError) {
            console.error('Failed to record invoice:', insertError);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.user_id;

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

// We need this to handle raw body
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// } 