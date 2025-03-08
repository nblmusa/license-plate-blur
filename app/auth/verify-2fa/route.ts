import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { code, session } = await request.json();

    if (!code || !session?.email || !session?.userId || !session?.hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid request - missing required fields' },
        { status: 400 }
      );
    }

    // Get user's 2FA settings
    let { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('two_factor_enabled, two_factor_secret')
      .eq('user_id', session.userId)
      .single();

    if (!settings?.two_factor_enabled || !settings?.two_factor_secret) {
      console.error('2FA is not properly configured:', { 
        enabled: settings?.two_factor_enabled,
        hasSecret: !!settings?.two_factor_secret 
      });
      return NextResponse.json(
        { error: '2FA is not properly configured' },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: settings.two_factor_secret
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // If code is valid, sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: session.email,
      password: session.hashedPassword
    });

    if (signInError) {
      console.error('Failed to sign in after 2FA:', signInError);
      return NextResponse.json(
        { error: 'Failed to complete sign in' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 