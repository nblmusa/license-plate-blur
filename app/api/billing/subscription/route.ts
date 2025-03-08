import { NextResponse } from 'next/server'
import supabaseServer from "@/lib/supabase-server"; 

export async function GET() {
  try {
    const supabase = supabaseServer();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      throw subError
    }

    // Get profile for subscription tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      throw profileError
    }

    // Get usage history for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: usageHistory, error: usageError } = await supabase
      .from('usage_records')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: false })

    if (usageError) {
      throw usageError
    }

    // Format usage history
    const formattedUsageHistory = (usageHistory || []).map(record => ({
      month: new Date(record.created_at).toLocaleString('default', { month: 'long', year: 'numeric' }),
      imagesProcessed: record.images_processed
    }))

    return NextResponse.json({
      tier: profile.subscription_tier || 'free',
      status: subscription?.status || 'active',
      currentPeriodEnd: subscription?.current_period_end || null,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
      usage: {
        imagesProcessed: subscription?.usage?.images_processed || 0,
        periodStart: subscription?.current_period_start || new Date().toISOString(),
        periodEnd: subscription?.current_period_end || new Date().toISOString(),
        daysLeft: subscription?.current_period_end 
          ? Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : 30
      },
      usageHistory: formattedUsageHistory
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
} 