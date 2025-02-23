import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    // Validate Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 500 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      )
    }
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user's customer ID from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      console.error('Database error:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    if (!user?.stripe_customer_id) {
      console.error('No Stripe customer ID found for user:', session.user.id);
      return NextResponse.json(
        { error: 'No associated billing account found' },
        { status: 404 }
      )
    }

    // Validate return URL
    const returnUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!returnUrl) {
      console.error('NEXT_PUBLIC_APP_URL is not set');
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      )
    }

    try {
      // Create Stripe portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: `${returnUrl}/billing`,
      })

      return NextResponse.json({ url: portalSession.url })
    } catch (stripeError: any) {
      console.error('Stripe portal session error:', stripeError);
      return NextResponse.json(
        { error: stripeError.message || 'Failed to create billing portal session' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Portal route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 