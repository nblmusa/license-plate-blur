import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate secret
    const secret = authenticator.generateSecret()
    
    // Store the secret temporarily (we'll save it permanently after verification)
    const { error: updateError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        temp_2fa_secret: secret,
        updated_at: new Date().toISOString()
      })

    if (updateError) {
      throw updateError
    }

    // Generate QR code
    const otpauth = authenticator.keyuri(
      session.user.email || '',
      'PlateGuard',
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