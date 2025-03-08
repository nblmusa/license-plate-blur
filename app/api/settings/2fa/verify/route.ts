import { createRegularClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { authenticator } from 'otplib'

export async function POST(request: Request) {
  try {
    const supabase = createRegularClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get verification code from request
    const { code } = await request.json()
    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      )
    }

    // Get user settings with temporary secret
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('temp_2fa_secret')
      .eq('user_id', session.user.id)
      .single()

    if (settingsError) {
      throw settingsError
    }

    if (!settings?.temp_2fa_secret) {
      return NextResponse.json(
        { error: 'No 2FA setup in progress' },
        { status: 400 }
      )
    }

    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: settings.temp_2fa_secret
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Save the verified secret
    const { error: updateError } = await supabase
      .from('user_settings')
      .update({
        two_factor_secret: settings.temp_2fa_secret,
        temp_2fa_secret: null,
        two_factor_enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('2FA Verification Error:', error)
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    )
  }
} 