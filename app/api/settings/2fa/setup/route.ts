import { createRegularClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export async function POST() {
  try {
    const supabase = createRegularClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate secret
    const secret = authenticator.generateSecret()
    
    // First, check if user settings exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    // If settings don't exist, create them
    if (!existingSettings) {
      const { error: createError } = await supabase
        .from('user_settings')
        .insert({
          user_id: session.user.id,
          temp_2fa_secret: secret,
          two_factor_enabled: false,
          updated_at: new Date().toISOString()
        })

      if (createError) {
        throw createError
      }
    } else {
      // Update existing settings
      const { error: updateError } = await supabase
        .from('user_settings')
        .update({
          temp_2fa_secret: secret,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)

      if (updateError) {
        throw updateError
      }
    }

    // Generate QR code
    const otpauth = authenticator.keyuri(
      session.user.email || '',
      'MaskingTech',
      secret
    )
    
    const qrCodeUrl = await QRCode.toDataURL(otpauth)

    return NextResponse.json({ qrCodeUrl })
  } catch (error) {
    console.error('2FA Setup Error:', error)
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    )
  }
} 